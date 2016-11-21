/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audioCat.state.plan.JsonEncoderStrategy');

goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.Clip');
goog.require('audioCat.state.DecodingEndedEvent');
goog.require('audioCat.state.Section');
goog.require('audioCat.state.Track');
goog.require('audioCat.state.effect.DynamicCompressorEffect');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');
goog.require('audioCat.state.effect.GainEffect');
goog.require('audioCat.state.effect.PanEffect');
goog.require('audioCat.state.effect.ReverbEffect');
goog.require('audioCat.state.envelope.ControlPoint');
goog.require('audioCat.state.envelope.VolumeEnvelope');
goog.require('audioCat.state.plan.AudioChestPlan');
goog.require('audioCat.state.plan.ClipPlan');
goog.require('audioCat.state.plan.Constant');
goog.require('audioCat.state.plan.DisplayPlan');
goog.require('audioCat.state.plan.EffectPlan');
goog.require('audioCat.state.plan.EffectPlan.DynamicCompressionProperty');
goog.require('audioCat.state.plan.EffectPlan.FilterProperty');
goog.require('audioCat.state.plan.EffectPlan.GainProperty');
goog.require('audioCat.state.plan.EffectPlan.PanProperty');
goog.require('audioCat.state.plan.EffectPlan.SimpleReverbProperty');
goog.require('audioCat.state.plan.EncoderStrategy');
goog.require('audioCat.state.plan.EnvelopeControlPointPlan');
goog.require('audioCat.state.plan.EnvelopePlan');
goog.require('audioCat.state.plan.NumericConstant');
goog.require('audioCat.state.plan.ProjectPlan');
goog.require('audioCat.state.plan.SectionPlan');
goog.require('audioCat.state.plan.TimeSignaturePlan');
goog.require('audioCat.state.plan.TrackPlan');
goog.require('goog.asserts');
goog.require('goog.events.EventHandler');
goog.require('goog.json');
goog.require('goog.object');


/**
 * A strategy for encoding the project state that relies on JSON.
 * @param {!audioCat.state.Project} project Contains project meta data.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates successive
 *     unique IDs. These IDs are unique throughout the entire application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages
 *     interactions with the audio context and the web audio API in general.
 * @param {!audioCat.audio.AudioGraph} audioGraph Hooks audio components
 *     together.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands, allowing for undo and redo.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages how time is scaled and displayed.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Centralizes creating effects of various types.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Manages
 *     effects applied to the master output.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.utility.ArrayHexifier} arrayHexifier Converts between
 *     arrays and hex strings.
 * @constructor
 * @extends {audioCat.state.plan.EncoderStrategy}
 */
audioCat.state.plan.JsonEncoderStrategy = function(
    project,
    idGenerator,
    audioContextManager,
    audioGraph,
    commandManager,
    timeDomainScaleManager,
    trackManager,
    effectModelController,
    masterEffectManager,
    memoryManager,
    arrayHexifier) {
  goog.base(this);
  /**
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * @private {!audioCat.audio.AudioGraph}
   */
  this.audioGraph_ = audioGraph;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * @private {!audioCat.state.effect.EffectModelController}
   */
  this.effectModelController_ = effectModelController;

  /**
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.masterEffectManager_ = masterEffectManager;

  /**
   * @private {!audioCat.state.MemoryManager}
   */
  this.memoryManager_ = memoryManager;

  /**
   * @private {!audioCat.utility.ArrayHexifier}
   */
  this.arrayHexifier_ = arrayHexifier;
};
goog.inherits(audioCat.state.plan.JsonEncoderStrategy,
    audioCat.state.plan.EncoderStrategy);


/**
 * A data type used to store information on how audio chests are used so that we
 * can summarize the chests at the end.
 * @typedef {{
 *   audioChest: !audioCat.audio.AudioChest,
 *   beginSample: number,
 *   endSampleBound: number
 * }}
 */
var AudioChestEntry;


/** @override */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceEncoding = function() {
  // Create a plan for a project.
  var projectPlan = {};

  // Keep track of which audio chests have been stored so we don't store twice.
  // This mapping is (ID of audio chest) -> (AudioChestEntry - see above.)
  var audioChestMapping = {};

  projectPlan[audioCat.state.plan.ProjectPlan.NAME] = this.project_.getTitle();
  projectPlan[audioCat.state.plan.ProjectPlan.SAMPLE_RATE] =
      this.audioGraph_.getSampleRate();
  projectPlan[audioCat.state.plan.ProjectPlan.NUMBER_OF_CHANNELS] =
      this.project_.getNumberOfChannels();
  projectPlan[audioCat.state.plan.ProjectPlan.DISPLAY_PLAN] =
      this.produceDisplayPlanEncoding_();
  projectPlan[audioCat.state.plan.ProjectPlan.TIME_SIGNATURE_PLAN] =
      this.produceTimeSignaturePlanEncoding_();
  var trackPlans =
      this.produceTrackPlanEncodings_(this.trackManager_, audioChestMapping);
  projectPlan[audioCat.state.plan.ProjectPlan.TRACK_PLANS] = trackPlans;

  // TODO(chizeng): Produce effect plans.
  projectPlan[audioCat.state.plan.ProjectPlan.EFFECT_PLANS] =
      this.produceEffectPlanEncodings_(this.masterEffectManager_);
  projectPlan[audioCat.state.plan.ProjectPlan.AUDIO_CHEST_PLANS] =
      this.produceAudioChestPlanEncodings_(audioChestMapping);

  // Loop through the clips once more. Subtract out the min sample index.
  this.subtractMinFromClips_(audioChestMapping, trackPlans);

  // Write an audioproject header, then the audio buffers, then the JSON.
  var jsonBlob = new Blob([goog.json.serialize(projectPlan)]);
  var toWrite = ['audioproject'];
  this.encodeSampleData_(audioChestMapping, toWrite);
  toWrite.push(new Uint32Array([jsonBlob.size]));
  toWrite.push(jsonBlob);
  return new Blob(
      toWrite, {type: audioCat.state.plan.Constant.PROJECT_MIME_TYPE});
};

/**
 * Subtracts out the min from each clip bound since we only stored parts of
 * audio buffers that were used.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from used audio chest ID to audio chest entries.
 * @param {!Array.<!audioCat.state.plan.TrackPlan>} trackPlans Track plans.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.subtractMinFromClips_ =
    function(audioChestMapping, trackPlans) {
  for (var i = 0; i < trackPlans.length; ++i) {
    var sectionPlans =
        trackPlans[i][audioCat.state.plan.TrackPlan.SECTION_PLANS];
    for (var j = 0; j < sectionPlans.length; ++j) {
      var sectionPlan = sectionPlans[j];
      var clipPlans = sectionPlan[audioCat.state.plan.SectionPlan.CLIP_PLANS];
      goog.asserts.assert(clipPlans.length);
      var beginSampleIndex = audioChestMapping[
          sectionPlan[audioCat.state.plan.SectionPlan.AUDIO_CHEST_ID]].
              beginSample;
      for (var k = 0; k < clipPlans.length; ++k) {
        var clipPlan = clipPlans[k];
        clipPlan[audioCat.state.plan.ClipPlan.BEGIN_SAMPLE] -= beginSampleIndex;
        clipPlan[audioCat.state.plan.ClipPlan.RIGHT_BOUND_SAMPLE] -=
            beginSampleIndex;
      }
    }
  }
};

/**
 * Produces a list of encoded sample data per audio chest.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from used audio chest ID to audio chest entries.
 * @param {!Array.<*>} toWrite The list of encoded sample data to append to.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.encodeSampleData_ =
    function(audioChestMapping, toWrite) {
  toWrite.push(new Uint32Array([goog.object.getCount(audioChestMapping)]));
  goog.object.forEach(audioChestMapping, function(entry, audioChestId) {
    var audioChest = entry.audioChest;
    var numberOfChannels = audioChest.getNumberOfChannels();
    var trackHeaderData = new Uint32Array(
        audioCat.state.plan.NumericConstant.TOTAL_BUFFER_SPACE_IN_INTS);
    trackHeaderData[0] = audioChestId;
    trackHeaderData[1] = numberOfChannels;
    trackHeaderData[2] = entry.endSampleBound - entry.beginSample;
    toWrite.push(trackHeaderData);
    var audioBuffer = audioChest.getAudioBuffer();
    for (var i = 0; i < numberOfChannels; ++i) {
      toWrite.push(audioBuffer.getChannelData(i).subarray(
          entry.beginSample, entry.endSampleBound));
    }
  });
};

/**
 * Produces a list of encodings of effects.
 * @param {!audioCat.state.effect.EffectManager} effectManager The manager of
 *     effects to encode into plans.
 * @return {!Array.<!audioCat.state.plan.EffectPlan>} A list of effect plans.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceEffectPlanEncodings_ =
    function(effectManager) {
  var numberOfEffects = effectManager.getNumberOfEffects();
  var effectPlans = new Array(numberOfEffects);
  for (var i = 0; i < numberOfEffects; ++i) {
    effectPlans[i] =
        this.produceEffectPlanEncoding_(effectManager.getEffectAtIndex(i));
  }
  return effectPlans;
};

/**
 * Produces an encoding of an effect.
 * @param {!audioCat.state.effect.Effect} effect The effect to encode.
 * @return {!audioCat.state.plan.EffectPlan} An encoding of an effect.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceEffectPlanEncoding_ =
    function(effect) {
  var effectPlan = {};
  var modelId = effect.getModel().getEffectModelId();
  effectPlan[audioCat.state.plan.EffectPlan.EFFECT_ID] = modelId;
  switch (modelId) {
    case audioCat.state.effect.EffectId.PEAKING:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.GAIN] =
          effect.getGainField().getValue();
      // Continue so we nab the others.
    case audioCat.state.effect.EffectId.ALLPASS:
    case audioCat.state.effect.EffectId.BANDPASS:
    case audioCat.state.effect.EffectId.HIGHPASS:
    case audioCat.state.effect.EffectId.LOWPASS:
    case audioCat.state.effect.EffectId.NOTCH:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.FREQUENCY] =
          effect.getFrequencyField().getValue();
      effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.Q] =
          effect.getQField().getValue();
      break;
    case audioCat.state.effect.EffectId.LOWSHELF:
    case audioCat.state.effect.EffectId.HIGHSHELF:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.FREQUENCY] =
          effect.getFrequencyField().getValue();
      effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.GAIN] =
          effect.getGainField().getValue();
      break;
    case audioCat.state.effect.EffectId.GAIN:
      goog.asserts.assert(effect instanceof audioCat.state.effect.GainEffect);
      effectPlan[audioCat.state.plan.EffectPlan.GainProperty.GAIN] =
          effect.getGainField().getValue();
      break;
    case audioCat.state.effect.EffectId.PAN:
      goog.asserts.assert(effect instanceof audioCat.state.effect.PanEffect);
      effectPlan[audioCat.state.plan.EffectPlan.PanProperty.PAN] =
          effect.getPanField().getValue();
      break;
    case audioCat.state.effect.EffectId.REVERB:
      goog.asserts.assert(effect instanceof audioCat.state.effect.ReverbEffect);
      effectPlan[audioCat.state.plan.EffectPlan.SimpleReverbProperty.DURATION] =
          effect.getDurationField().getValue();
      effectPlan[audioCat.state.plan.EffectPlan.SimpleReverbProperty.DECAY] =
          effect.getDecayField().getValue();
      effectPlan[audioCat.state.plan.EffectPlan.SimpleReverbProperty.REVERSED] =
          effect.getReversedField().getValue() ? 1 : 0;
      break;
    case audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR:
      goog.asserts.assert(
          effect instanceof audioCat.state.effect.DynamicCompressorEffect);
      effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.ATTACK] =
              effect.getAttackField().getValue();
      effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.KNEE] =
              effect.getKneeField().getValue();
      effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.RATIO] =
              effect.getRatioField().getValue();
      effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.RELEASE] =
              effect.getReleaseField().getValue();
      effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.THRESHOLD] =
              effect.getThresholdField().getValue();
      break;
    default:
      goog.asserts.fail('No effect type identified.');
  }
  return /** @type {!audioCat.state.plan.EffectPlan} */ (effectPlan);
};

/**
 * Produces a list of encodings of individual tracks.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from the IDs of audio chests recorded to store later and the
 *     actual audio chests.
 * @return {!Array.<!audioCat.state.plan.TrackPlan>} A list of track plans.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceTrackPlanEncodings_ =
    function(trackManager, audioChestMapping) {
  var numberOfTracks = trackManager.getNumberOfTracks();
  var trackPlans = new Array(numberOfTracks);
  for (var i = 0; i < numberOfTracks; ++i) {
    trackPlans[i] = this.produceTrackPlanEncoding_(
        trackManager.getTrack(i),
        audioChestMapping);
  }
  return trackPlans;
};

/**
 * Produces an encoding of how a track is stored.
 * @param {!audioCat.state.Track} track The track to encode into a plan.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from the IDs of audio chests recorded to store later and the
 *     actual audio chests.
 * @return {!audioCat.state.plan.TrackPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceTrackPlanEncoding_ =
    function(track, audioChestMapping) {
  // TODO(chizeng): Create volume envelope and section plans.
  var trackPlan = {};
  trackPlan[audioCat.state.plan.TrackPlan.TRACK_TITLE] = track.getName();
  trackPlan[audioCat.state.plan.TrackPlan.GAIN] = track.getGain();
  trackPlan[audioCat.state.plan.TrackPlan.PAN] = track.getPanFromLeft();
  trackPlan[audioCat.state.plan.TrackPlan.SOLOED] = track.getSoloedState();
  trackPlan[audioCat.state.plan.TrackPlan.MUTED] = track.getMutedState();
  trackPlan[audioCat.state.plan.TrackPlan.VOLUME_ENVELOPE_PLAN] =
      this.produceEnvelopePlanEncoding_(track.getVolumeEnvelope());
  trackPlan[audioCat.state.plan.TrackPlan.SECTION_PLANS] =
      this.produceSectionPlanEncodings_(track, audioChestMapping);
  trackPlan[audioCat.state.plan.TrackPlan.EFFECT_PLANS] =
      this.produceEffectPlanEncodings_(track.getEffectManager());
  return /** @type {!audioCat.state.plan.TrackPlan} */ (trackPlan);
};

/**
 * Produces a list of encodings of audio sections.
 * @param {!audioCat.state.Track} track The track to encode the sections of.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from the IDs of audio chests recorded to store later and the
 *     actual audio chests.
 * @return {!Array.<!audioCat.state.plan.SectionPlan>}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceSectionPlanEncodings_ =
    function(track, audioChestMapping) {
  var numberOfSections = track.getNumberOfSections();
  var sectionPlans = [];
  for (var i = 0; i < numberOfSections; ++i) {
    var section = track.getSectionAtIndexFromBeginning(i);
    if (section.getNumberOfClips()) {
      // Only store this section if it has at least 1 clip.
      sectionPlans.push(this.produceSectionPlanEncoding_(
          section, audioChestMapping));
    }
  }
  return sectionPlans;
};

/**
 * Produces an encoding of how a section is stored.
 * @param {!audioCat.state.Section} section The section of audio to encode.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A mapping from the IDs of audio chests recorded to store later and the
 *     actual audio chests.
 * @return {!audioCat.state.plan.SectionPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceSectionPlanEncoding_ =
    function(section, audioChestMapping) {
  var sectionPlan = {};
  sectionPlan[audioCat.state.plan.SectionPlan.SECTION_TITLE] =
      section.getName();
  sectionPlan[audioCat.state.plan.SectionPlan.BEGIN_TIME] =
      section.getBeginTime();
  sectionPlan[audioCat.state.plan.SectionPlan.PLAYBACK_RATE] =
      section.getPlaybackRate();
  var audioChestId = section.getAudioChest().getId();
  sectionPlan[audioCat.state.plan.SectionPlan.AUDIO_CHEST_ID] = audioChestId;
  if (!audioChestMapping[audioChestId]) {
    // We've never seen this audio chest before. Note it so we store it later.
    var firstClip = section.getClipAtIndex(0);
    audioChestMapping[audioChestId] = {
      audioChest: section.getAudioChest(),
      beginSample: firstClip.getBeginSampleIndex(),
      endSampleBound: firstClip.getRightSampleBound()
    };
  }
  var audioChestEntry = audioChestMapping[audioChestId];
  sectionPlan[audioCat.state.plan.SectionPlan.CLIP_PLANS] =
      this.produceClipPlanEncodings_(section, audioChestEntry);
  return /** @type {!audioCat.state.plan.SectionPlan} */ (sectionPlan);
};

/**
 * Produces a list of encodings of used audio chests.
 * @param {!Object.<audioCat.utility.Id, !AudioChestEntry>} audioChestMapping
 *     A finalized mapping from the IDs of audio chests used to audio chests.
 * @return {!Array.<!audioCat.state.plan.AudioChestPlan>}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.
    produceAudioChestPlanEncodings_ = function(audioChestMapping) {
  var audioChestPlans = [];
  goog.object.forEach(audioChestMapping, function(audioChestEntry) {
    audioChestPlans.push(this.produceAudioChestPlanEncoding_(audioChestEntry));
  }, this);
  return audioChestPlans;
};

/**
 * Produces an encoding of an audio chest.
 * @param {!AudioChestEntry} audioChestEntry The entry of the audio chest to
 *     encode.
 * @return {!audioCat.state.plan.AudioChestPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.
    produceAudioChestPlanEncoding_ = function(audioChestEntry) {
  // TODO(chizeng): If the audio chest has been seen before, do not encode it.
  var audioChestPlan = {};
  var audioChest = audioChestEntry.audioChest;
  audioChestPlan[audioCat.state.plan.AudioChestPlan.TITLE] =
      audioChest.getAudioName();
  audioChestPlan[audioCat.state.plan.AudioChestPlan.FORMER_ID] =
      audioChest.getId();
  audioChestPlan[audioCat.state.plan.AudioChestPlan.ORIGINATION] =
      audioChest.getAudioOrigination();
  audioChestPlan[audioCat.state.plan.AudioChestPlan.SAMPLE_RATE] =
      audioChest.getSampleRate();
  audioChestPlan[audioCat.state.plan.AudioChestPlan.SAMPLE_LENGTH] =
      audioChestEntry.endSampleBound - audioChestEntry.beginSample;
  audioChestPlan[audioCat.state.plan.AudioChestPlan.NUMBER_OF_CHANNELS] =
      audioChest.getNumberOfChannels();
  return /** @type {!audioCat.state.plan.AudioChestPlan} */ (audioChestPlan);
};

/**
 * Produces an encoding of a typed array (only Float32 for now) .. :)
 * @param {!Float32Array} array The native array to encode.
 * @return {string} The encoding in hex format.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceTypedArrayEncoding_ =
    function(array) {
  return this.arrayHexifier_.float32ArrayToHex(array);
};

/**
 * Produces a list of encodings of clips.
 * @param {!audioCat.state.Section} section The section to encode clips for.
 * @param {!AudioChestEntry} audioChestEntry The entry for the audio chest
 *     from which this section gets its sound.
 * @return {!Array.<!audioCat.state.plan.ClipPlan>} A list of encodings for
 *     clips.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceClipPlanEncodings_ =
    function(section, audioChestEntry) {
  var numberOfClips = section.getNumberOfClips();
  var clipPlans = new Array(numberOfClips);
  for (var i = 0; i < numberOfClips; ++i) {
    clipPlans[i] = this.produceClipPlanEncoding_(
        section.getClipAtIndex(i),
        audioChestEntry);
  }
  return clipPlans;
};

/**
 * Produces an encoding of a clip.
 * @param {!audioCat.state.Clip} clip The clip of audio to encode.
 * @param {!AudioChestEntry} audioChestEntry The entry for the audio chest that
 *     this clip pertains to.
 * @return {!audioCat.state.plan.ClipPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceClipPlanEncoding_ =
    function(clip, audioChestEntry) {
  var clipPlan = {};
  var beginSample = clip.getBeginSampleIndex();
  clipPlan[audioCat.state.plan.ClipPlan.BEGIN_SAMPLE] = beginSample;
  var endSampleBound = clip.getRightSampleBound();
  clipPlan[audioCat.state.plan.ClipPlan.RIGHT_BOUND_SAMPLE] = endSampleBound;
  // Decide whether to expand the bounds of the stored chunk of the audio chest.
  if (beginSample < audioChestEntry.beginSample) {
    audioChestEntry.beginSample = beginSample;
  }
  if (endSampleBound > audioChestEntry.endSampleBound) {
    audioChestEntry.endSampleBound = endSampleBound;
  }
  return /** @type {!audioCat.state.plan.ClipPlan} */ (clipPlan);
};

/**
 * Produces an encoding of how an envelope is stored.
 * @param {!audioCat.state.envelope.Envelope} envelope The envelope to encode
 *     into a plan.
 * @return {!audioCat.state.plan.EnvelopePlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceEnvelopePlanEncoding_ =
    function(envelope) {
  var envelopePlan = {};
  envelopePlan[audioCat.state.plan.EnvelopePlan.CONTROL_POINT_PLANS] =
      this.produceEnvelopeControlPointPlanEncodings_(envelope);
  return /** @type {!audioCat.state.plan.EnvelopePlan} */ (envelopePlan);
};

/**
 * Produces a list of encodings of envelope control points.
 * @param {!audioCat.state.envelope.Envelope} envelope The envelope for which to
 *     encode a list of control point plans.
 * @return {!Array.<!audioCat.state.plan.EnvelopeControlPointPlan>}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.
    produceEnvelopeControlPointPlanEncodings_ = function(envelope) {
  var numberOfControlPoints = envelope.getNumberOfControlPoints();
  var controlPointPlans = new Array(numberOfControlPoints);
  for (var i = 0; i < numberOfControlPoints; ++i) {
    controlPointPlans[i] = this.produceEnvelopeControlPointPlanEncoding_(
        envelope.getControlPointAtIndex(i));
  }
  return controlPointPlans;
};

/**
 * Produces an encoding of a control point for an envelope.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     to encode into a plan.
 * @return {!audioCat.state.plan.EnvelopeControlPointPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.
    produceEnvelopeControlPointPlanEncoding_ = function(controlPoint) {
  var controlPointPlan = {};
  controlPointPlan[audioCat.state.plan.EnvelopeControlPointPlan.TIME] =
      controlPoint.getTime();
  controlPointPlan[audioCat.state.plan.EnvelopeControlPointPlan.VALUE] =
      controlPoint.getValue();
  return /** @type {!audioCat.state.plan.EnvelopeControlPointPlan} */ (
      controlPointPlan);
};

/**
 * Produces an encoding of how to display the project.
 * @return {!audioCat.state.plan.DisplayPlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.produceDisplayPlanEncoding_ =
    function() {
  var displayPlan = {};
  displayPlan[audioCat.state.plan.DisplayPlan.DISPLAY_WITH_TIME_SIGNATURE] =
      this.timeDomainScaleManager_.getDisplayAudioUsingBars() ? 1 : 0;
  return /** @type {!audioCat.state.plan.DisplayPlan} */ (displayPlan);
};

/**
 * Produces an encoding of the current time signature.
 * @return {!audioCat.state.plan.TimeSignaturePlan}
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.
    produceTimeSignaturePlanEncoding_ = function() {
  var signatureTempoManager =
      this.timeDomainScaleManager_.getSignatureTempoManager();
  var timeSignaturePlan = {};
  timeSignaturePlan[audioCat.state.plan.TimeSignaturePlan.BEATS] =
      signatureTempoManager.getBeatsInABar();
  timeSignaturePlan[audioCat.state.plan.TimeSignaturePlan.NOTE_NUMBER] =
      signatureTempoManager.getBeatUnit();
  return /** @type {!audioCat.state.plan.TimeSignaturePlan} */ (
      timeSignaturePlan);
};

/** @override */
audioCat.state.plan.JsonEncoderStrategy.prototype.decode =
    function(encoding) {
  try {
    this.doActualDecoding_(encoding);
  } catch (e) {
    this.noteCorruptFile_(e.toString());
  }
};

/**
 * Resets all facets of the project to the point at which the user just opened
 * the editor.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.putProjectInRestartState_ =
    function() {
  // Reset project title.
  this.project_.setTitle(this.project_.getDefaultProjectTitle());
  this.project_.setSampleRate(this.audioContextManager_.getSampleRate());
  this.project_.setNumberOfChannels(
      audioCat.audio.Constant.DEFAULT_OUTPUT_CHANNEL_COUNT);
  this.trackManager_.removeAllTracks();
  // Empty the command manager since previous undos and redos are irrelevant.
  this.commandManager_.obliterateHistory();
  // Restore default effects.
  this.masterEffectManager_.removeAllEffects();
  var defaultEffects = this.effectModelController_.getDefaultMasterEffects();
  for (var i = 0; i < defaultEffects.length; ++i) {
    this.masterEffectManager_.addEffect(defaultEffects[i]);
  }
  // No links to any data now.
  this.memoryManager_.setBytesUsed(0);
};

/**
 * Actually does the work of decoding and making the state of the work space
 * match the encoding.
 * @param {!ArrayBuffer} encoding The encoding to decode and actuate.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.doActualDecoding_ =
    function(encoding) {
  var uint8View = new Uint8Array(encoding);
  if (uint8View.length == 0) {
    // If this file is empty, just obliterate the project and start from a
    // state that mimics the project just being opened.
    this.putProjectInRestartState_();
    var self = this;
    goog.global.setTimeout(function() {
      self.noteDecodingEnded_();
    }, 2);
    return;
  }

  var mark = audioCat.state.plan.Constant.FILE_INITIAL_MARK;
  if (String.fromCharCode.apply(null, uint8View.subarray(0, mark.length)) !=
      mark) {
    // The first few characters of the file must match the marking.
    this.noteCorruptFile_();
    goog.asserts.fail('Characters do not match.');
    return;
  }

  // Create a mapping: former audio chest ID -> list of channels.
  var audioBuffers = {};
  var bytesPerInt = Uint32Array.BYTES_PER_ELEMENT;
  var encodingByteLength = encoding.byteLength;
  var closestFactorOf4Bytes = Math.floor(encodingByteLength / bytesPerInt);
  var uint32View = new Uint32Array(encoding, 0, closestFactorOf4Bytes);
  var float32View = new Float32Array(encoding, 0, closestFactorOf4Bytes);
  var currentPoint = mark.length / bytesPerInt;
  var numberOfAudioBuffers = uint32View[currentPoint];
  currentPoint += 1;
  for (var a = 0; a < numberOfAudioBuffers; ++a) {
    // We've reserved this much total room for meta data per track in case we
    // must add new features in the future.
    var headerEndPoint = currentPoint +
        audioCat.state.plan.NumericConstant.TOTAL_BUFFER_SPACE_IN_INTS;
    var formerId =
        /** @type {audioCat.utility.Id} */ (uint32View[currentPoint]);
    currentPoint += 1;
    var numberOfChannels = uint32View[currentPoint];
    currentPoint += 1;
    var sampleLength = uint32View[currentPoint];
    currentPoint = headerEndPoint;
    audioBuffers[formerId] = new Array(numberOfChannels);
    for (var c = 0; c < numberOfChannels; ++c) {
      // Remember each channel.
      audioBuffers[formerId][c] = new Float32Array(sampleLength);
      var formerCurrentPoint = currentPoint;
      currentPoint += sampleLength;
      audioBuffers[formerId][c].set(float32View.subarray(
          formerCurrentPoint, currentPoint));
    }
  }
  // Parse the json.
  var jsonStringLength = uint32View[currentPoint];
  currentPoint += 1;
  var eventHandler = new goog.events.EventHandler(this);
  var fileReader = new FileReader();
  eventHandler.listen(fileReader, 'load', function() {
    eventHandler.dispose();
    // Set project parameters.
    var projectPlan = /** @type {!audioCat.state.plan.ProjectPlan} */ (
        goog.json.parse(/** @type {string} */ (fileReader.result)));
    this.project_.setTitle(projectPlan[audioCat.state.plan.ProjectPlan.NAME]);
    var sampleRate = projectPlan[audioCat.state.plan.ProjectPlan.SAMPLE_RATE];
    this.project_.setSampleRate(sampleRate);
    this.project_.setNumberOfChannels(
        projectPlan[audioCat.state.plan.ProjectPlan.NUMBER_OF_CHANNELS]);

    // Set display settings.
    var timeDomainScaleManager = this.timeDomainScaleManager_;
    var displayPlan = /** @type {!audioCat.state.plan.DisplayPlan} */(
        projectPlan[audioCat.state.plan.ProjectPlan.DISPLAY_PLAN]);
    var timeSignaturePlan =
        /** @type {!audioCat.state.plan.TimeSignaturePlan} */ (
            projectPlan[audioCat.state.plan.ProjectPlan.TIME_SIGNATURE_PLAN]);
    timeDomainScaleManager.setDisplayAudioUsingBars(!!displayPlan[
        audioCat.state.plan.DisplayPlan.DISPLAY_WITH_TIME_SIGNATURE]);
    var signatureTempoManager =
        timeDomainScaleManager.getSignatureTempoManager();
    // Beats here actually refers to the tempo (beats / minute).
    signatureTempoManager.setNumberOfBeatsInABar(
        timeSignaturePlan[audioCat.state.plan.TimeSignaturePlan.BEATS]);
    signatureTempoManager.setBeatUnit(
        timeSignaturePlan[audioCat.state.plan.TimeSignaturePlan.NOTE_NUMBER]);

    // Retrieve plans for audio chests.
    var audioChestPlans =
        projectPlan[audioCat.state.plan.ProjectPlan.AUDIO_CHEST_PLANS];
    var formerIdToAudioChestPlans = {};
    for (var a = 0; a < audioChestPlans.length; ++a) {
      var audioChestPlan = audioChestPlans[a];
      formerIdToAudioChestPlans[
          audioChestPlan[audioCat.state.plan.AudioChestPlan.FORMER_ID]] =
              audioChestPlan;
    }
    // Mapping from former ID of actuated audio chest -> audio chest.
    var actuatedAudioChests = {};

    // Populate new tracks, overriding old ones.
    var trackManager = this.trackManager_;
    trackManager.removeAllTracks();
    var trackPlans = projectPlan[audioCat.state.plan.ProjectPlan.TRACK_PLANS];
    var totalAudioMemory = 0;
    for (var t = 0; t < trackPlans.length; ++t) {
      var trackPlan =
          /** @type {!audioCat.state.plan.TrackPlan} */ (trackPlans[t]);

      // Create a volume envelope.
      var volumeEnvelopePlan =
          /** @type {!audioCat.state.plan.EnvelopePlan} */ (
              trackPlan[audioCat.state.plan.TrackPlan.VOLUME_ENVELOPE_PLAN]);
      var controlPointPlans = volumeEnvelopePlan[
          audioCat.state.plan.EnvelopePlan.CONTROL_POINT_PLANS];
      var controlPoints = new Array(controlPointPlans.length);
      for (var c = 0; c < controlPointPlans.length; ++c) {
        var controlPointPlan =
            /** @type {!audioCat.state.plan.EnvelopeControlPointPlan} */ (
                controlPointPlans[c]);
        controlPoints[c] = new audioCat.state.envelope.ControlPoint(
            this.idGenerator_,
            controlPointPlan[audioCat.state.plan.EnvelopeControlPointPlan.TIME],
            controlPointPlan[
                audioCat.state.plan.EnvelopeControlPointPlan.VALUE]);
      }
      var volumeEnvelope = new audioCat.state.envelope.VolumeEnvelope(
          this.idGenerator_, controlPoints);

      // Construct and add a track.
      var track = new audioCat.state.Track(
          this.idGenerator_,
          trackPlan[audioCat.state.plan.TrackPlan.TRACK_TITLE],
          volumeEnvelope,
          undefined, // No pan envelope.
          trackPlan[audioCat.state.plan.TrackPlan.GAIN],
          trackPlan[audioCat.state.plan.TrackPlan.PAN],
          this.decodeEffectsFromPlans_(
              trackPlan[audioCat.state.plan.TrackPlan.EFFECT_PLANS]));

      // Add the sections.
      var sectionPlans = trackPlan[audioCat.state.plan.TrackPlan.SECTION_PLANS];
      var audioContextManager = this.audioContextManager_;
      for (var s = 0; s < sectionPlans.length; ++s) {
        var sectionPlan = sectionPlans[s];
        var audioChestId = /** @type {!audioCat.utility.Id} */ (
            sectionPlan[audioCat.state.plan.SectionPlan.AUDIO_CHEST_ID]);
        if (!actuatedAudioChests[audioChestId]) {
          // Create the audio chest if we have not done so yet.
          var audioChestPlan = formerIdToAudioChestPlans[audioChestId];
          var audioBuffer = audioContextManager.createEmptyAudioBuffer(
              audioChestPlan[
                  audioCat.state.plan.AudioChestPlan.NUMBER_OF_CHANNELS],
              audioChestPlan[audioCat.state.plan.AudioChestPlan.SAMPLE_LENGTH],
              audioChestPlan[audioCat.state.plan.AudioChestPlan.SAMPLE_RATE]);
          var channelData = audioBuffers[audioChestId];
          var audioData = audioBuffers[audioChestId];
          // Set channel data.
          for (var c = 0; c < channelData.length; ++c) {
            // We just made the audio buffer, so it should exist.
            /** @type {!Float32Array} */ (
                audioContextManager.getChannelData(audioBuffer, c)).
                    set(audioData[c]);
          }
          actuatedAudioChests[audioChestId] = new audioCat.audio.AudioChest(
              audioBuffer,
              audioChestPlan[audioCat.state.plan.AudioChestPlan.TITLE],
              audioChestPlan[audioCat.state.plan.AudioChestPlan.ORIGINATION],
              this.idGenerator_);
          totalAudioMemory +=
              actuatedAudioChests[audioChestId].obtainTotalByteSize();
          // Save a little memory by removing a reference.
          delete audioBuffers[audioChestId];
        }

        // Add clips.
        var clipPlans = sectionPlan[audioCat.state.plan.SectionPlan.CLIP_PLANS];
        var clips = new Array(clipPlans.length);
        for (var c = 0; c < clipPlans.length; ++c) {
          var clipPlan = clipPlans[c];
          clips[c] = new audioCat.state.Clip(
              this.idGenerator_,
              clipPlan[audioCat.state.plan.ClipPlan.BEGIN_SAMPLE],
              clipPlan[audioCat.state.plan.ClipPlan.RIGHT_BOUND_SAMPLE]);
        }

        // Create and add the section of audio.
        var section = new audioCat.state.Section(
            this.idGenerator_,
            actuatedAudioChests[audioChestId],
            sectionPlan[audioCat.state.plan.SectionPlan.SECTION_TITLE],
            sectionPlan[audioCat.state.plan.SectionPlan.BEGIN_TIME],
            undefined,
            clips,
            sectionPlan[audioCat.state.plan.SectionPlan.PLAYBACK_RATE]);
        track.addSection(section);
      }

      // TODO(chizeng): Add effects for this track. Write method for that.
      var trackEffectManager = track.getEffectManager();
      trackManager.addTrack(track);
    }

    // Note the total memory taken up by audio.
    this.memoryManager_.setBytesUsed(totalAudioMemory);

    // Empty the command manager since previous undos and redos are irrelevant.
    this.commandManager_.obliterateHistory();

    // TODO(chizeng): Clear, and add new master effects.
    this.masterEffectManager_.removeAllEffects();
    var newMasterEffects = this.decodeEffectsFromPlans_(
        projectPlan[audioCat.state.plan.ProjectPlan.EFFECT_PLANS]);
    for (var m = 0; m < newMasterEffects.length; ++m) {
      this.masterEffectManager_.addEffect(newMasterEffects[m]);
    }

    // Indicate that decoding was successful.
    this.noteDecodingEnded_();
  }, false);
  eventHandler.listen(fileReader, 'error', function() {
    eventHandler.dispose();
    // Indicate that an error occurred while decoding.
    this.noteCorruptFile_();
  }, false);
  fileReader.readAsText(new Blob([
      uint8View.subarray(currentPoint * bytesPerInt, encodingByteLength)]));
};

/**
 * Constructs a list of effects given a list of plans for them.
 * @param {!Array.<!audioCat.state.plan.EffectPlan>} effectPlans A list of
 *     effect plans.
 * @return {!Array.<!audioCat.state.effect.Effect>} A list of effects
 *     constructed from the plans.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.decodeEffectsFromPlans_ =
    function(effectPlans) {
  var effects = new Array(effectPlans.length);
  for (var i = 0; i < effectPlans.length; ++i) {
    effects[i] = this.decodeEffectFromPlan_(effectPlans[i]);
  }
  return effects;
};

/**
 * Constructs an effect given a plan.
 * @param {!audioCat.state.plan.EffectPlan} effectPlan The plan to create an
 *     effect for.
 * @return {!audioCat.state.effect.Effect} The effect constructed from the plan.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.decodeEffectFromPlan_ =
    function(effectPlan) {
  var modelId = effectPlan[audioCat.state.plan.EffectPlan.EFFECT_ID];
  var effect = this.effectModelController_.getModelFromId(modelId).
      createDefaultEffect(this.effectModelController_, this.idGenerator_);
  switch (modelId) {
    case audioCat.state.effect.EffectId.PEAKING:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effect.getGainField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.GAIN]);
      // Continue so we nab the others.
    case audioCat.state.effect.EffectId.ALLPASS:
    case audioCat.state.effect.EffectId.BANDPASS:
    case audioCat.state.effect.EffectId.HIGHPASS:
    case audioCat.state.effect.EffectId.LOWPASS:
    case audioCat.state.effect.EffectId.NOTCH:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effect.getFrequencyField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.FREQUENCY]);
      effect.getQField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.Q]);
      break;
    case audioCat.state.effect.EffectId.LOWSHELF:
    case audioCat.state.effect.EffectId.HIGHSHELF:
      goog.asserts.assert(effect instanceof audioCat.state.effect.FilterEffect);
      effect.getFrequencyField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.FREQUENCY]);
      effect.getGainField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.FilterProperty.GAIN]);
      break;
    case audioCat.state.effect.EffectId.GAIN:
      goog.asserts.assert(effect instanceof audioCat.state.effect.GainEffect);
      effect.getGainField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.GainProperty.GAIN]);
      break;
    case audioCat.state.effect.EffectId.PAN:
      goog.asserts.assert(effect instanceof audioCat.state.effect.PanEffect);
      effect.getPanField().setValue(
          effectPlan[audioCat.state.plan.EffectPlan.PanProperty.PAN]);
      break;
    case audioCat.state.effect.EffectId.REVERB:
      goog.asserts.assert(effect instanceof audioCat.state.effect.ReverbEffect);
      effect.getDurationField().setValue(
          effectPlan[
              audioCat.state.plan.EffectPlan.SimpleReverbProperty.DURATION]);
      effect.getDecayField().setValue(
          effectPlan[
              audioCat.state.plan.EffectPlan.SimpleReverbProperty.DECAY]);
      effect.getReversedField().setValue(
          effectPlan[
              audioCat.state.plan.EffectPlan.SimpleReverbProperty.REVERSED] !=
                  0);
      break;
    case audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR:
      goog.asserts.assert(
          effect instanceof audioCat.state.effect.DynamicCompressorEffect);
      effect.getAttackField().setValue(effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.ATTACK]);
      effect.getKneeField().setValue(effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.KNEE]);
      effect.getRatioField().setValue(effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.RATIO]);
      effect.getReleaseField().setValue(effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.RELEASE]);
      effect.getThresholdField().setValue(effectPlan[
          audioCat.state.plan.EffectPlan.DynamicCompressionProperty.THRESHOLD]);
      break;
    default:
      goog.asserts.fail('No effect type identified.');
  }
  return effect;
};

/**
 * Indicates that the file is corrupt.
 * @param {string=} opt_elaboration An elaboration of the error to append if
 *     desired.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.noteCorruptFile_ =
    function(opt_elaboration) {
  var message = 'File is corrupt. Contact us if you need to recover data.';
  // if (goog.isDef(opt_elaboration)) {
  //   message += ' ' + opt_elaboration;
  // }
  this.noteDecodingEnded_(message);
};

/**
 * Fires an event noting that decoding has finished.
 * @param {string=} error An error message if there was any. An error indicates
 *     that decoding failed.
 * @private
 */
audioCat.state.plan.JsonEncoderStrategy.prototype.noteDecodingEnded_ =
    function(error) {
  this.dispatchEvent(new audioCat.state.DecodingEndedEvent(error));
};
