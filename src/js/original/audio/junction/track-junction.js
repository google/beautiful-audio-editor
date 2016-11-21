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
goog.provide('audioCat.audio.junction.TrackJunction');

goog.require('audioCat.audio.junction.AnalyserJunction');
goog.require('audioCat.audio.junction.ChannelSplitterJunction');
goog.require('audioCat.audio.junction.EventType');
goog.require('audioCat.audio.junction.GainJunction');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.PanJunction');
goog.require('audioCat.audio.junction.SectionJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.VolumeEnvelopeJunction');
goog.require('audioCat.audio.junction.effect.EffectManagerJunction');
goog.require('audioCat.state.events');
goog.require('goog.events');
goog.require('goog.object');


/**
 * A junction for playing a track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.Track} track The track.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between different units and standards within audio.
 * @param {!audioCat.audio.junction.GainJunction} mutedGainJunction A gain
 *     junction that is hooked up to the destination junction, but is muted.
 *     Some analyser junctions only work if they are hooked along the path to
 *     the destination.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.StartJunction}
 */
audioCat.audio.junction.TrackJunction = function(
    idGenerator,
    audioContextManager,
    track,
    audioUnitConverter,
    mutedGainJunction) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.TRACK);

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The track.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * A mapping of section ID to the section junction.
   * @private {!Object<audioCat.utility.Id,
   *              !audioCat.audio.junction.SectionJunction>}
   */
  this.sectionJunctionMapping_ = {};

  /**
   * Whether this junction has been started and not stopped yet.
   * @private {boolean}
   */
  this.trackStartedPlaying_ = false;

  /**
   * The absolute begin time of the previous start.
   * @private {number}
   */
  this.previousAbsoluteBeginTime_ = 0;

  /**
   * The previous time in seconds into the audio at which playing started.
   * Meaningless if no start has occurred.
   * @private {number}
   */
  this.previousStartTimeIntoAudio_ = 0;

  /**
   * A junction that enforces volume envelopes.
   * @private {!audioCat.audio.junction.VolumeEnvelopeJunction}
   */
  this.volumeEnvelopeJunction_ =
      new audioCat.audio.junction.VolumeEnvelopeJunction(
          idGenerator,
          audioContextManager,
          track.getVolumeEnvelope(),
          audioUnitConverter);

  /**
   * A junction that allows users to apply various effects to the track.
   * @private {!audioCat.audio.junction.effect.EffectManagerJunction}
   */
  this.effectManagerJunction_ =
      new audioCat.audio.junction.effect.EffectManagerJunction(
          audioContextManager,
          track.getEffectManager(),
          idGenerator,
          audioUnitConverter,
          track.getNumberOfChannels());
  this.effectManagerJunction_.connect(this.volumeEnvelopeJunction_);

  /**
   * An overall gain junction for the track.
   * @private {!audioCat.audio.junction.GainJunction}
   */
  this.gainJunction_ = new audioCat.audio.junction.GainJunction(
      idGenerator, audioContextManager, track.getGain());
  this.volumeEnvelopeJunction_.connect(this.gainJunction_);

  /**
   * An overall pan junction for the track.
   * @private {!audioCat.audio.junction.PanJunction}
   */
  this.panJunction_ = new audioCat.audio.junction.PanJunction(
      idGenerator, audioContextManager, track.getPanFromLeft());
  this.gainJunction_.connect(this.panJunction_);

  // /**
  // * A junction that checks for clipping.
  // * @private {!audioCat.audio.junction.ClipDetectorJunction}
  // */
  // this.clipDetectorJunction_ =
  //     new audioCat.audio.junction.ClipDetectorJunction(
  //         idGenerator, audioContextManager, track.getNumberOfChannels());
  // // Attach it to a silent gain junction that connects to the destination.
  // this.clipDetectorJunction_.connect(mutedGainJunction);
  // track.getAudioAnalyser().setClipDetectorJunction(
  //     this.clipDetectorJunction_);

  var numberOfTrackOutputChannels = track.getNumberOfChannels();
  /**
   * A channel splitter for analysis.
   * @private {!audioCat.audio.junction.ChannelSplitterJunction}
   */
  this.channelSplitterJunction_ =
      new audioCat.audio.junction.ChannelSplitterJunction(
          idGenerator, audioContextManager, numberOfTrackOutputChannels);
  this.panJunction_.connect(this.channelSplitterJunction_);

  var channelAnalyserJunctions = new Array(numberOfTrackOutputChannels);
  for (var i = 0; i < numberOfTrackOutputChannels; ++i) {
    channelAnalyserJunctions[i] = new audioCat.audio.junction.AnalyserJunction(
        idGenerator, audioContextManager, track.getNumberOfChannels());
    this.channelSplitterJunction_.connectChannel(
        i, channelAnalyserJunctions[i]);
    channelAnalyserJunctions[i].connect(mutedGainJunction);
  }
  /**
   * An array of analyser junctions. One per channel.
   * @private {!Array.<!audioCat.audio.junction.AnalyserJunction>}
   */
  this.channelAnalyserJunctions_ = channelAnalyserJunctions;
  track.getAudioAnalyser().setChannelAnalyserJunctions(
      this.channelAnalyserJunctions_);

  /**
   * An overall analyser junction that does not change the audio going through
   * it, but offers analysis.
   * @private {!audioCat.audio.junction.AnalyserJunction}
   */
  this.analyserJunction_ = new audioCat.audio.junction.AnalyserJunction(
      idGenerator, audioContextManager, track.getNumberOfChannels());
  track.getAudioAnalyser().setAnalyserJunction(this.analyserJunction_);
  // Connect the analyser junction to both the clip detector junction and later
  // junctions.
  // this.analyserJunction_.connect(this.clipDetectorJunction_);
  this.panJunction_.connect(this.analyserJunction_);

  // Add junctions for existing sections.
  var numberOfSections = track.getNumberOfSections();
  for (var i = 0; i < numberOfSections; ++i) {
    this.addSectionJunction_(track.getSectionAtIndexFromBeginning(i));
  }

  // For sections added in the future, add a section.
  var listenFunction = goog.events.listen;
  listenFunction(track, audioCat.state.events.SECTION_ADDED,
      this.handleNewSection_, false, this);

  // If a section is removed, remove it and don't play it.
  listenFunction(track, audioCat.state.events.SECTION_REMOVED,
      this.handleSectionRemoved_, false, this);

  // Change the gain junction if the track's gain changes.
  listenFunction(track, audioCat.state.events.TRACK_VOLUME_CHANGED,
      this.handleChangeInGain_, false, this);

  // Change the pan junction if the track's pan changes.
  listenFunction(track, audioCat.state.events.TRACK_PAN_CHANGED,
      this.handleChangeInPan_, false, this);

  // Handle changes to muted state.
  listenFunction(track, audioCat.state.events.TRACK_MUTE_CHANGED,
      this.handleChangeInMutedState_, false, this);

  // Handle changes in the volume envelope for the track.
  listenFunction(track.getVolumeEnvelope(),
      audioCat.state.envelope.events.CONTROL_POINTS_CHANGED,
      this.handleControlPointsChanged_, false, this);

  // Handle removes, adds, and swaps in effects.
  listenFunction(this.effectManagerJunction_,
      audioCat.audio.junction.EventType.RECONNECT_REQUESTED,
      this.handleEffectManagerReconnectRequest_, false, this);
};
goog.inherits(
    audioCat.audio.junction.TrackJunction, audioCat.audio.junction.Junction);

/**
 * Handles what happens when control points of the volume envelope change.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleControlPointsChanged_ =
    function() {
  // TODO(chizeng): When the user changes the volume envelope, the audio
  // restarts in order to create a completely new gain node and thus discount
  // the linear ramps previously made. This kind of works in that altering the
  // volume envelope while playing alters the audi live, but introduces pops
  // and clicks while the volume envelope changes. Can't think of a better way
  // to heed changes in the envelope while playing.
  this.possiblyStartAndStopSound_();
};

/**
 * Handles what happens when the effect manager node requests a reconnect.
 * Specifically, reconnects all sections to the effect manager node, then
 * restarts playing if we are currently playing this track.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.
    handleEffectManagerReconnectRequest_ = function() {
  // This should handle the reconnection.
  this.possiblyStartAndStopSound_();
};

/**
 * Restarts audible playing of the track if it is currently playing.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.possiblyStartAndStopSound_ =
    function() {
  if (this.trackStartedPlaying_) {
    this.stopSections_();
    this.start(this.previousStartTimeIntoAudio_ +
        this.audioContextManager.getAbsoluteTime() -
            this.previousAbsoluteBeginTime_);
  }
};

/**
 * @override
 */
audioCat.audio.junction.TrackJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  var track = this.track_;
  var unlistenFunction = goog.events.unlisten;
  unlistenFunction(track, audioCat.state.events.SECTION_ADDED,
      this.handleNewSection_, false, this);
  unlistenFunction(track, audioCat.state.events.SECTION_REMOVED,
      this.handleSectionRemoved_, false, this);
  unlistenFunction(track, audioCat.state.events.TRACK_VOLUME_CHANGED,
      this.handleChangeInGain_, false, this);
  unlistenFunction(track, audioCat.state.events.TRACK_PAN_CHANGED,
      this.handleChangeInPan_, false, this);
  unlistenFunction(track, audioCat.state.events.TRACK_MUTE_CHANGED,
      this.handleChangeInMutedState_, false, this);
  unlistenFunction(track.getVolumeEnvelope(),
      audioCat.state.envelope.events.CONTROL_POINTS_CHANGED,
      this.handleControlPointsChanged_, false, this);
  unlistenFunction(this.effectManagerJunction_,
      audioCat.audio.junction.EventType.RECONNECT_REQUESTED,
      this.handleEffectManagerReconnectRequest_, false, this);

  // Clean up all the sections.
  var numberOfSections = track.getNumberOfSections();
  for (var i = 0; i < numberOfSections; ++i) {
    this.removeSectionJunction_(track.getSectionAtIndexFromBeginning(i));
  }
  this.effectManagerJunction_.cleanUp();
  this.volumeEnvelopeJunction_.cleanUp();
  this.gainJunction_.cleanUp();
  this.panJunction_.cleanUp();
  this.channelSplitterJunction_.cleanUp();
  for (var i = 0; i < this.channelAnalyserJunctions_.length; ++i) {
    this.channelAnalyserJunctions_[i].cleanUp();
  }
  this.channelAnalyserJunctions_.length = 0;
  // this.clipDetectorJunction_.cleanUp();
  this.analyserJunction_.cleanUp();

  // Make the analyser stop heeding this junction since the junction's defunct.
  track.getAudioAnalyser().setAnalyserJunction(null);
  track.getAudioAnalyser().setClipDetectorJunction(null);

  this.cleanedUp = true;
};

/**
 * Handles a change in the gain of the track.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleChangeInGain_ =
    function() {
  this.gainJunction_.setGain(this.track_.getGain());
};

/**
 * Handles a change in the pan of the track.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleChangeInPan_ =
    function() {
  this.panJunction_.setPan(this.track_.getPanFromLeft());
};

/**
 * Handles a change in the muted state of the track.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleChangeInMutedState_ =
    function() {
  var track = this.track_;
  if (track.getMutedState()) {
    this.stopSections_();
  } else if (this.trackStartedPlaying_) {
    this.start(this.previousStartTimeIntoAudio_ +
        this.audioContextManager.getAbsoluteTime() -
            this.previousAbsoluteBeginTime_);
  }
};

/**
 * Removes the junction for a section.
 * @param {!audioCat.state.Section} section The section to remove the junction
 *     for.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.removeSectionJunction_ =
    function(section) {
  var sectionJunctionMapping = this.sectionJunctionMapping_;
  var sectionJunction = sectionJunctionMapping[section.getId()];
  if (sectionJunction) {
    delete sectionJunctionMapping[section.getId()];
    sectionJunction.stop();
    sectionJunction.cleanUp();
  }
};

/**
 * @return {audioCat.utility.Id} The ID of the track.
 */
audioCat.audio.junction.TrackJunction.prototype.getTrackId = function() {
  return this.track_.getId();
};

/**
 * @return {boolean} True iff the track is muted.
 */
audioCat.audio.junction.TrackJunction.prototype.trackIsMuted = function() {
  return this.track_.getMutedState();
};

/**
 * Handles what happens when a new section is added.
 * @param {!audioCat.state.SectionAddedEvent} event The associated event.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleNewSection_ =
    function(event) {
  this.addSectionJunction_(event.getSection());
};

/**
 * Handles what happens when a section is removed.
 * @param {!audioCat.state.SectionRemovedEvent} event The associated event.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.handleSectionRemoved_ =
    function(event) {
  this.removeSectionJunction_(event.getSection());
};

/**
 * Creates a section junction and adds it to this track junction.
 * @param {!audioCat.state.Section} section The section to add a junction for.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.addSectionJunction_ =
    function(section) {
  var sectionJunction = new audioCat.audio.junction.SectionJunction(
      this.idGenerator_, this.audioContextManager, section);

  sectionJunction.connect(this.effectManagerJunction_);
  this.sectionJunctionMapping_[section.getId()] = sectionJunction;
  this.maybeStartSectionJunction_(sectionJunction,
      this.previousStartTimeIntoAudio_ +
          this.audioContextManager.getAbsoluteTime() -
              this.previousAbsoluteBeginTime_);
};

/** @override */
audioCat.audio.junction.TrackJunction.prototype.connect = function(junction) {
  this.analyserJunction_.connect(junction);
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.TrackJunction.prototype.start =
    function(time, opt_offlineAudioContext) {
  if (!opt_offlineAudioContext) {
    this.trackStartedPlaying_ = true;
    this.previousAbsoluteBeginTime_ =
        this.audioContextManager.getAbsoluteTime();
    this.previousStartTimeIntoAudio_ = time;
  }

  this.volumeEnvelopeJunction_.setStartIntoAudioTime(
      time, opt_offlineAudioContext);

  // We must recreate this connection since the volume envelope refreshes its
  // gain node it clears previous, irrelevant ramps.
  var effectManagerJunction = this.effectManagerJunction_;
  effectManagerJunction.disconnect();
  effectManagerJunction.connect(this.volumeEnvelopeJunction_);

  goog.object.forEach(this.sectionJunctionMapping_, function(sectionJunction) {
    this.maybeStartSectionJunction_(
        sectionJunction, time, opt_offlineAudioContext);
  }, this);
};

/**
 * Starts a section junction at a certain time.
 * @param {!audioCat.audio.junction.SectionJunction} sectionJunction The section
 *     to start if appropriate to do so.
 * @param {number} time The time into playing to start at.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to render into. If not
 *     provided, uses the live audio context.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.maybeStartSectionJunction_ =
    function(sectionJunction, time, opt_offlineAudioContext) {
  // Start if we're either playing audio or rendering the audio.
  if ((this.trackStartedPlaying_ || opt_offlineAudioContext) &&
      !this.track_.getMutedState()) {
    sectionJunction.start(time, opt_offlineAudioContext);
  }
};

/** @override */
audioCat.audio.junction.TrackJunction.prototype.stop = function() {
  this.stopSections_();
  this.trackStartedPlaying_ = false;
};

/**
 * Halts all the section junctions by stopping them. Does not consider this
 * action to be a reset of the previous absolute start time.
 * @private
 */
audioCat.audio.junction.TrackJunction.prototype.stopSections_ = function() {
  goog.object.forEach(this.sectionJunctionMapping_, function(sectionJunction) {
    sectionJunction.stop();
  }, this);
};
