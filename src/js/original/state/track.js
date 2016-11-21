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
goog.provide('audioCat.state.Track');

goog.require('audioCat.audio.Analyser');
goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.Section');
goog.require('audioCat.state.SectionAddedEvent');
goog.require('audioCat.state.SectionRemovedEvent');
goog.require('audioCat.state.effect.EffectManager');
goog.require('audioCat.state.envelope.PanEnvelope');
goog.require('audioCat.state.envelope.VolumeEnvelope');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.math');


/**
 * Manages a single track of audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates successive
 *     unique IDs. These IDs are unique throughout the entire application.
 * @param {string} trackName The name of the track.
 * @param {!audioCat.state.envelope.VolumeEnvelope=} opt_volumeEnvelope An
 *     envelope that allows for fine control of volume through control points.
 *     If not provided, defaults to an empty envelope.
 * @param {!audioCat.state.envelope.PanEnvelope=} opt_panEnvelope An
 *     envelope that allows for fine control of pan through control points.
 *     If not provided, defaults to an empty envelope.
 * @param {number=} opt_gain The initial gain.
 * @param {number=} opt_pan The initial pan.
 * @param {!Array.<!audioCat.state.effect.Effect>=} opt_effects An optional list
 *     of effects for initially populating the effect manager. Optional.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.Track = function(
    idGenerator,
    trackName,
    opt_volumeEnvelope,
    opt_panEnvelope,
    opt_gain,
    opt_pan,
    opt_effects) {
  goog.base(this);

  /**
   * The ID of the track.
   * @private {!audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * The name of the track.
   * @private {string}
   */
  this.trackName_ = trackName;

  /**
   * The number of channels outputted by this track.
   * @private {number}
   */
  this.numberOfChannels_ = audioCat.audio.Constant.DEFAULT_OUTPUT_CHANNEL_COUNT;

  /**
   * A list of sections sorted by begin time.
   * @private {!Array.<!audioCat.state.Section>}
   */
  this.sectionsByBeginTime_ = [];

  /**
   * The overall track gain from 0 to 1.
   * @private {number}
   */
  this.gain_ = goog.isDef(opt_gain) ?
      opt_gain : audioCat.audio.Constant.DEFAULT_VOLUME_SAMPLE_UNITS;

  /**
   * The overall pan from left to right. Ranges from -45 to 45.
   * @private {number}
   */
  this.panFromLeft_ = goog.isDef(opt_pan) ?
      opt_pan : audioCat.audio.Constant.DEFAULT_PAN_DEGREES;

  /**
   * The duration of the track (s). Defaults to 0 if the track lacks sections.
   * @private {number}
   */
  this.duration_ = 0;

  /**
   * Whether this track is muted.
   * @private {boolean}
   */
  this.muted_ = false;

  /**
   * Whether this track is solo-ed.
   * @private {boolean}
   */
  this.soloed_ = false;

  /**
   * Analyses audio. Gives us fresh audio data.
   * @private {!audioCat.audio.Analyser}
   */
  this.audioAnalyser_ = new audioCat.audio.Analyser(this.numberOfChannels_);

  var self = this;
  /**
   * Manages effects applied to this track.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = new audioCat.state.effect.EffectManager(
      idGenerator,
      function() {
          return 'track ' + self.trackName_;
      },
      opt_effects);

  /**
   * An envelope that allows for control of volume via control points.
   * @private {!audioCat.state.envelope.VolumeEnvelope}
   */
  this.volumeEnvelope_ = opt_volumeEnvelope ||
      new audioCat.state.envelope.VolumeEnvelope(idGenerator);

  /**
   * An envelope that allows for control of pan via control points.
   * @private {!audioCat.state.envelope.PanEnvelope}
   */
  this.panEnvelope_ = opt_panEnvelope ||
      new audioCat.state.envelope.PanEnvelope(idGenerator);
};
goog.inherits(audioCat.state.Track, audioCat.utility.EventTarget);

/**
 * @return {!audioCat.state.envelope.VolumeEnvelope} The volume envelope.
 */
audioCat.state.Track.prototype.getVolumeEnvelope = function() {
  return this.volumeEnvelope_;
};

/**
 * @return {!audioCat.state.envelope.PanEnvelope} The pan envelope.
 */
audioCat.state.Track.prototype.getPanEnvelope = function() {
  return this.panEnvelope_;
};

/**
 * @param {boolean} state Sets whether this track is muted.
 */
audioCat.state.Track.prototype.setMutedState = function(state) {
  if (state == this.muted_) {
    // Nothing to be changed.
    return;
  }
  this.muted_ = state;
  if (state) {
    this.setSoloedState(false);
  }
  this.dispatchEvent(audioCat.state.events.TRACK_MUTE_CHANGED);
};

/**
 * @return {boolean} Whether this track is muted.
 */
audioCat.state.Track.prototype.getMutedState = function() {
  return this.muted_;
};

/**
 * @param {boolean} state Sets whether this track is solo-ed.
 */
audioCat.state.Track.prototype.setSoloedState = function(state) {
  if (state == this.soloed_) {
    // Nothing to be changed.
    return;
  }
  this.soloed_ = state;
  if (state) {
    this.setMutedState(false);
  }
  this.dispatchEvent(audioCat.state.events.TRACK_SOLO_CHANGED);
};

/**
 * @return {boolean} Whether this track is solo-ed.
 */
audioCat.state.Track.prototype.getSoloedState = function() {
  return this.soloed_;
};

/**
 * @return {audioCat.utility.Id} The ID of the track. This ID is unique
 *     throughout the application.
 */
audioCat.state.Track.prototype.getId = function() {
  return this.id_;
};

/**
 * Sets the name of the track.
 * @param {string} trackName The name of the track.
 * @param {boolean=} opt_suppressEvent If provided and true, suppresses the
 *     track from dispatching an event indicating name change.
 */
audioCat.state.Track.prototype.setName =
    function(trackName, opt_suppressEvent) {
  // TODO(chizeng): When it matters, throw an event indicating name change.
  this.trackName_ = trackName;
  if (!opt_suppressEvent) {
    this.dispatchEvent(audioCat.state.events.TRACK_NAME_CHANGED);
  }
};

/**
 * @return {string} The name of the track
 */
audioCat.state.Track.prototype.getName = function() {
  return this.trackName_;
};

/**
 * @return {!audioCat.audio.Analyser} An analyser for audio that provides live
 *     audio data or visualizations and such. Or no data if the track isn't
 *     playing or removed.
 */
audioCat.state.Track.prototype.getAudioAnalyser = function() {
  return this.audioAnalyser_;
};

/**
 * @return {!audioCat.state.effect.EffectManager} The manager that applies
 *     various effects to this audio track.
 */
audioCat.state.Track.prototype.getEffectManager = function() {
  return this.effectManager_;
};

/**
 * @return {number} The duration of the track in seconds.
 */
audioCat.state.Track.prototype.getDuration = function() {
  return this.duration_;
};

/**
 * @return {number} The number of channels in the output for this track.
 */
audioCat.state.Track.prototype.getNumberOfChannels = function() {
  return this.numberOfChannels_;
};

/**
 * @return {number} The overall gain of the track.
 */
audioCat.state.Track.prototype.getGain = function() {
  return this.gain_;
};

/**
 * Sets the overall gain of the track.
 * @param {number} gain The new gain value.
 * @param {boolean=} opt_stableGainChanged Whether to fire an event noting that
 *     the stable volume of the track has changed. The stable volume is the one
 *     that the user has finalized - after shifting controls around.
 */
audioCat.state.Track.prototype.setGain = function(gain, opt_stableGainChanged) {
  if (goog.math.nearlyEquals(this.gain_, gain)) {
    // Volume did not change. Do nothing.
    return;
  }
  this.gain_ = gain;
  this.dispatchEvent(audioCat.state.events.TRACK_VOLUME_CHANGED);
  if (opt_stableGainChanged) {
    this.dispatchEvent(audioCat.state.events.TRACK_STABLE_VOLUME_CHANGED);
  }
};

/**
 * Sets the gain based on a decibel, not a raw, value.
 * @param {number} decibels The decibel value of the gain.
 * @param {boolean=} opt_stableGainChanged Whether to fire an event noting that
 *     the stable volume of the track has changed. The stable volume is the one
 *     that the user has finalized - after shifting controls around.
 */
audioCat.state.Track.prototype.setGainInDecibels = function(
    decibels,
    opt_stableGainChanged) {
  // TODO(chizeng): Use the audio unit converter so we do this in one place.
  this.setGain(Math.pow(10, decibels / 20), opt_stableGainChanged);
};

/**
 * Gets the gain in decibels, not in raw sample units.
 * @return {number} The gain of the track in decibels.
 */
audioCat.state.Track.prototype.getGainInDecibels = function() {
  // TODO(chizeng): Use the audio unit converter so we do this in one place.
  return 20 * Math.log(this.gain_) / audioCat.audio.Constant.LOG10;
};

/**
 * @return {number} The pan level from the left to the right (-45 to 45).
 */
audioCat.state.Track.prototype.getPanFromLeft = function() {
  return this.panFromLeft_;
};

/**
 * Sets the pan level from the left.
 * @param {number} pan The new pan level from the left (from -45 to 45).
 * @param {boolean=} opt_stablePanChanged Whether to fire an event noting that
 *     the stable panning of the track has changed.
 */
audioCat.state.Track.prototype.setPanFromLeft =
    function(pan, opt_stablePanChanged) {
  if (goog.math.nearlyEquals(this.panFromLeft_, pan)) {
    // Panning did not change. Do nothing.
    return;
  }
  this.panFromLeft_ = pan;
  this.dispatchEvent(audioCat.state.events.TRACK_PAN_CHANGED);
  if (opt_stablePanChanged) {
    this.dispatchEvent(audioCat.state.events.TRACK_STABLE_PAN_CHANGED);
  }
};

/**
 * Adds a section to the track.
 * @param {!audioCat.state.Section} section The section of audio added.
 * @param {boolean=} opt_silentlyChange If true, makes the removal without
 *     notifying other objects. Doing so is rather dangerous, so this is only
 *     used for very temporary and atomic purposes. Avoid if possible.
 * @param {boolean=} opt_transitory If true, indicates that this section removal
 *     is part of a larger action. For instance, perhaps we're splitting a
 *     section, in which case we remove the previous section and add two new
 *     sections. Setting this parameter to true gives respondent objects the
 *     opportunity to delay manifesting changes until the last action instead of
 *     on this action.
 */
audioCat.state.Track.prototype.addSection = function(
    section,
    opt_silentlyChange,
    opt_transitory) {
  var sections = this.sectionsByBeginTime_;
  section.setTrack(this);

  // Add section at the correct index using binary insertion.
  var newIndex = -1 * (goog.array.binarySearch(
      sections,
      section,
      audioCat.state.Section.compareSectionsByBeginTime) + 1);
  goog.array.insertAt(sections, section, newIndex);

  // Set a listener on the section for when the section changes begin time.
  goog.events.listen(section, audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleSectionBeginTimeChanged_, false, this);

  if (!opt_silentlyChange) {
    this.dispatchEvent(new audioCat.state.SectionAddedEvent(
        newIndex, section, opt_transitory));
  }
};

/**
 * Handles what happens when the begin time of a section changes. Shuffles the
 * ordering of sections by begin time appropriately.
 * @param {!audioCat.state.SectionBeginTimeChangedEvent} event The associated
 *     event.
 * @private
 */
audioCat.state.Track.prototype.handleSectionBeginTimeChanged_ =
    function(event) {
  var sections = this.sectionsByBeginTime_;
  var section = /** @type {!audioCat.state.Section} */ (event.target);

  // Find the current section (with current time) in the array.
  var compareFunction = audioCat.state.Section.compareSectionsByBeginTime;
  // if (goog.array.binarySearch(sections, section, compareFunction) < 0) {
  // The section was not found in its proper position. It must be moved.
  // Find the current erring index by temporarily setting the begin time to
  // the previous time and suppressing the associated event. Remove
  // section.
  //   section.setBeginTime(event.getPreviousBeginTime(), true);
  //   goog.array.binaryRemove(sections, section, compareFunction);

  //   // Re-insert the section. Again, suppress the this change in begin time.
  //   section.setBeginTime(event.getNewBeginTime(), true);
  //   goog.array.binaryInsert(sections, section, compareFunction);
  // }

  // Simply remove the section and re-insert it. The above logic is too complex.
  // goog.array.remove(sections, section);
  // section.setBeginTime(event.getNewBeginTime(), true);
  // goog.array.binaryInsert(sections, section, compareFunction);

  // ... actually, just sort the array. :)
  section.setBeginTime(event.getNewBeginTime(), true);
  goog.array.sort(sections, compareFunction);

  // Notify other objects that some section of this track has changed in time.
  this.dispatchEvent(audioCat.state.events.SECTION_TIME_PROPERTY_CHANGED);
};

/**
 * Removes a section from the track.
 * @param {!audioCat.state.Section} section The section of audio to remove.
 * @param {boolean=} opt_silentlyChange If true, makes the removal without
 *     notifying other objects. Doing so is rather dangerous, so this is only
 *     used for very temporary and atomic purposes. Avoid if possible.
 * @param {boolean=} opt_transitory If true, indicates that this section removal
 *     is part of a larger action. For instance, perhaps we're splitting a
 *     section, in which case we remove the previous section and add two new
 *     sections. Setting this parameter to true gives respondent objects the
 *     opportunity to delay manifesting changes until the last action instead of
 *     on this action.
 */
audioCat.state.Track.prototype.removeSection = function(
    section,
    opt_silentlyChange,
    opt_transitory) {
  // Remove the section in a binary fashion.
  var sections = this.sectionsByBeginTime_;
  var compareFunction = audioCat.state.Section.compareSectionsByBeginTime;
  var index = goog.array.binarySearch(sections, section, compareFunction);
  goog.array.removeAt(sections, index);

  // Remove the listener for the section's begin time changing.
  goog.events.unlisten(section,
      audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleSectionBeginTimeChanged_, false, this);

  // Actually remove the section.
  section.setTrack(null);
  if (!opt_silentlyChange) {
    this.dispatchEvent(
        new audioCat.state.SectionRemovedEvent(index, section, opt_transitory));
  }
};

/**
 * @return {number} The number of sections on this track.
 */
audioCat.state.Track.prototype.getNumberOfSections = function() {
  return this.sectionsByBeginTime_.length;
};

/**
 * Obtains the section at a certain index assuming the sections are ordered by
 * begin time. Assumes that sectionIndex < this.getNumberOfSections().
 * @param {number} sectionIndex The index of the section to get.
 * @return {!audioCat.state.Section} The section at that index.
 */
audioCat.state.Track.prototype.getSectionAtIndexFromBeginning =
    function(sectionIndex) {
  return this.sectionsByBeginTime_[sectionIndex];
};
