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
goog.provide('audioCat.audio.AudioGraph');

goog.require('audioCat.audio.AudioContextManager');
goog.require('audioCat.audio.EventType');
goog.require('audioCat.audio.junction.AnalyserJunction');
goog.require('audioCat.audio.junction.ChannelSplitterJunction');
goog.require('audioCat.audio.junction.DestinationJunction');
goog.require('audioCat.audio.junction.EventType');
goog.require('audioCat.audio.junction.GainJunction');
goog.require('audioCat.audio.junction.TrackJunction');
goog.require('audioCat.audio.junction.effect.EffectManagerJunction');
goog.require('audioCat.state.envelope.events');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.object');


/**
 * The graph of audio junctions. Junctions connect together and eventually
 * connect to the destination.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application in the same space.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager The effect
 *     manager that controls effects for the whole project.
 * @param {!audioCat.state.Project} project Encapsulates information about the
 *     project.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.AudioGraph = function(
    idGenerator,
    audioContextManager,
    trackManager,
    audioUnitConverter,
    masterEffectManager,
    project) {
  goog.base(this);

  /**
   * Generates unique IDs.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  /**
   * Whether all tracks have been started and not stopped yet.
   * @private {boolean}
   */
  this.trackJunctionsStarted_ = false;

  /**
   * Manages the audio context.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * Manages the state of tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * A mapping between track ID and track junction.
   * @private {!Object.<audioCat.utility.Id,
   *     !audioCat.audio.junction.TrackJunction>}
   */
  this.trackIdJunctionMapping_ = {};

  /**
   * The audio destination junction.
   * @private {!audioCat.audio.junction.DestinationJunction}
   */
  this.destinationJunction_ = new audioCat.audio.junction.DestinationJunction(
      idGenerator, audioContextManager);

  var numberOfOutputChannels = project.getNumberOfChannels();
  /**
   * Some analyser nodes only work if they are along a path to the destination
   * junction, so we cheat by connecting them to a muted gain junction.
   * @private {!audioCat.audio.junction.GainJunction}
   */
  this.mutedGainJunction_ = new audioCat.audio.junction.GainJunction(
      idGenerator, audioContextManager, 0, numberOfOutputChannels);
  this.mutedGainJunction_.connect(this.destinationJunction_);

  /**
   * The master gain junction.
   * @private {!audioCat.audio.junction.GainJunction}
   */
  this.masterGainJunction_ = new audioCat.audio.junction.GainJunction(
      idGenerator, audioContextManager, 1, numberOfOutputChannels);

  /**
   * The master effect junction.
   * @private {!audioCat.audio.junction.effect.EffectManagerJunction}
   */
  this.masterEffectManagerJunction_ =
      new audioCat.audio.junction.effect.EffectManagerJunction(
          audioContextManager,
          masterEffectManager,
          idGenerator,
          audioUnitConverter,
          numberOfOutputChannels);

  /**
   * The previous absolute time in seconds at which playing started.
   * @private {number}
   */
  this.previousAbsoluteStartTime_ = 0;

  /**
   * The time in seconds into the audio at which playing previously began.
   * Meaningless if no playing has started yet.
   * @private {number}
   */
  this.previousStartTimeIntoAudio_ = 0;

  /**
   * The analyser junction used to analyse audio that goes through. Does not
   * otherwise alter the audio.
   * @private {!audioCat.audio.junction.AnalyserJunction}
   */
  this.analyserJunction_ = new audioCat.audio.junction.AnalyserJunction(
      idGenerator, audioContextManager, numberOfOutputChannels);
  this.masterEffectManagerJunction_.connect(this.analyserJunction_);

  // The master effect junction must connect to some junction first before other
  // junctions can connect to it.
  this.masterGainJunction_.connect(this.masterEffectManagerJunction_);

  /**
   * Splits the audio into channels so we can analyse channels separately.
   * @private {!audioCat.audio.junction.ChannelSplitterJunction}
   */
  this.channelSplitterJunction_ =
      new audioCat.audio.junction.ChannelSplitterJunction(
          idGenerator, audioContextManager, numberOfOutputChannels);

  this.analyserJunction_.connect(this.channelSplitterJunction_);

  var channelAnalyserJunctions = new Array(numberOfOutputChannels);
  for (var i = 0; i < numberOfOutputChannels; ++i) {
    channelAnalyserJunctions[i] = new audioCat.audio.junction.AnalyserJunction(
        idGenerator, audioContextManager, numberOfOutputChannels);
    this.channelSplitterJunction_.connectChannel(
        i, channelAnalyserJunctions[i]);
    channelAnalyserJunctions[i].connect(this.mutedGainJunction_);
  }

  /**
   * A list of analyser junctions, one for each output channel.
   * @private {!Array.<audioCat.audio.junction.AnalyserJunction>}
   */
  this.channelAnalyserJunctions_ = channelAnalyserJunctions;

  // /**
  // * A junction for detecting clipping.
  // * @private {!audioCat.audio.junction.ClipDetectorJunction}
  // */
  // this.clipDetectorJunction_ =
  //     new audioCat.audio.junction.ClipDetectorJunction(
  //         idGenerator, audioContextManager, numberOfOutputChannels);

  // Attach a junction to detect clipping. This attaches a junction to more
  // than one node, which should be fine. This attachment should come after
  // since the last attachment determines the specified next junction for the
  // analyser junction.
  // this.analyserJunction_.connect(this.clipDetectorJunction_);
  this.analyserJunction_.connect(this.destinationJunction_);

  // The clip detector junction must hook up to the destination to take effect.
  // So we cheat by hooking it up to a muted gain node before linking it to the
  // destination.
  // this.clipDetectorJunction_.connect(this.mutedGainJunction_);

  // Add junctions for existing tracks.
  var numberOfTracks = trackManager.getNumberOfTracks();
  for (var i = 0; i < numberOfTracks; ++i) {
    this.addTrackJunction_(trackManager.getTrack(i));
  }

  // TODO(chizeng): Remove these listeners if the audio graph is removed.

  // Listen to the addition of tracks.
  var listenFunction = goog.events.listen;
  listenFunction(trackManager, audioCat.state.events.TRACK_ADDED,
      this.handleTrackAdded_, false, this);

  // Listen to the removal of tracks.
  listenFunction(trackManager, audioCat.state.events.TRACK_REMOVED,
      this.handleTrackRemoved_, false, this);

  // Listen to changes in the currently solo-ed track.
  listenFunction(trackManager, audioCat.state.events.SOLOED_TRACK_CHANGED,
      this.handleSoloedTrackChanged_, false, this);

  listenFunction(this.masterEffectManagerJunction_,
      audioCat.audio.junction.EventType.RECONNECT_REQUESTED,
      this.handleEffectManagerReconnectRequest_, false, this);
};
goog.inherits(audioCat.audio.AudioGraph, audioCat.utility.EventTarget);

/**
 * Starts junctions in preparation for offline rendering.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext}
 *     offlineAudioContext The offline audio context to start into.
 */
audioCat.audio.AudioGraph.prototype.startForOfflineRendering =
    function(offlineAudioContext) {
  // It's important not to start at 0 here since offline audio contexts treat
  // time 0 as the point at which I think the web page loaded, whereas we want
  // to start rendering now.
  this.start(0, offlineAudioContext);
};

/**
 * Handles what happens when the currently solo-ed track changes.
 * @private
 */
audioCat.audio.AudioGraph.prototype.handleSoloedTrackChanged_ = function() {
  this.stopAndPossiblyRestartAtCurrentTime_();
};

/**
 * Handles what happens when master effects change. We must reconnect the track
 * junctions to the master effects since new nodes had been created. The old
 * ones are no longer connected.
 * @private
 */
audioCat.audio.AudioGraph.prototype.handleEffectManagerReconnectRequest_ =
    function() {
  var masterGainJunction = this.masterGainJunction_;
  masterGainJunction.disconnect();
  masterGainJunction.connect(this.masterEffectManagerJunction_);
  this.stopAndPossiblyRestartAtCurrentTime_();
};

/**
 * Stops the audio, and immediately starts playing again at the current time.
 * This is necessary if some node changes, and we must reconnect our audio
 * graph.
 * @private
 */
audioCat.audio.AudioGraph.prototype.stopAndPossiblyRestartAtCurrentTime_ =
    function() {
  // If we're not playing in the first place, we don't need to do anything. The
  // next starting of audio should just pick up changes.
  if (this.trackJunctionsStarted_) {
    // Stop and replay at the updated time so that we consider the change in
    // solo state.
    var timeForReplay = this.previousStartTimeIntoAudio_ +
        this.audioContextManager_.getAbsoluteTime() -
        this.previousAbsoluteStartTime_;
    this.stopAllStartNodes();
    this.start(timeForReplay);
  }
};

/**
 * Handles what happens when a track is removed.
 * @param {!audioCat.state.TrackRemovedEvent} event The associated event.
 * @private
 */
audioCat.audio.AudioGraph.prototype.handleTrackRemoved_ = function(event) {
  var track = event.getTrack();
  this.removeTrackJunction_(track);
};

/**
 * Removes a junction for a track and removes it from the audio graph.
 * @param {!audioCat.state.Track} track The track to remove a junction for.
 * @private
 */
audioCat.audio.AudioGraph.prototype.removeTrackJunction_ = function(track) {
  var trackIdJunctionMapping = this.trackIdJunctionMapping_;
  var trackJunction = trackIdJunctionMapping[track.getId()];
  trackJunction.stop();
  trackJunction.cleanUp();
  delete trackIdJunctionMapping[track.getId()];
};

/**
 * Handles what happens when a track is added.
 * @param {!audioCat.state.TrackAddedEvent} event The associated event.
 * @private
 */
audioCat.audio.AudioGraph.prototype.handleTrackAdded_ = function(event) {
  var track = event.getTrack();
  this.addTrackJunction_(track);
};

/**
 * Adds a junction for a track and includes it in the audio graph.
 * @param {!audioCat.state.Track} track The track to create a junction for.
 * @private
 */
audioCat.audio.AudioGraph.prototype.addTrackJunction_ = function(track) {
  var audioContextManager = this.audioContextManager_;
  var trackJunction = new audioCat.audio.junction.TrackJunction(
      this.idGenerator_, audioContextManager, track, this.audioUnitConverter_,
      this.mutedGainJunction_);
  trackJunction.connect(this.masterGainJunction_);
  this.trackIdJunctionMapping_[track.getId()] = trackJunction;

  // Start the track if the right conditions exist.
  this.maybeStartTrackJunction_(trackJunction,
      this.previousStartTimeIntoAudio_ +
          audioContextManager.getAbsoluteTime() -
              this.previousAbsoluteStartTime_);
};

/**
 * Starts playing the whole audio graph `time` seconds into the audio.
 * @param {number} time The time into the audio to start playing at.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to start into. If not
 *     provided, uses a live audio context instead.
 */
audioCat.audio.AudioGraph.prototype.start =
    function(time, opt_offlineAudioContext) {
  var trackJunctionMapping = this.trackIdJunctionMapping_;
  if (!opt_offlineAudioContext) {
    // This only pertains to playing audio, not rendering it.
    this.trackJunctionsStarted_ = true;
    this.previousAbsoluteStartTime_ =
        this.audioContextManager_.getAbsoluteTime();
    this.previousStartTimeIntoAudio_ = time;
  }

  var masterEffectManagerJunction = this.masterEffectManagerJunction_;
  masterEffectManagerJunction.disconnect();
  masterEffectManagerJunction.connect(this.analyserJunction_);

  goog.object.forEach(trackJunctionMapping, function(trackJunction) {
    this.maybeStartTrackJunction_(trackJunction, time, opt_offlineAudioContext);
  }, this);

  // TODO(chizeng): Decide if using an accumulator is helpful.
  // var startNodeAccumulator = this.startNodeAccumulator_;
  // for (var trackId in trackJunctionMapping) {
  //   trackJunctionMapping[trackId].stageForStarting(
  //       startNodeAccumulator, time, opt_offline);
  // }
  // startNodeAccumulator.triggerStarts();
};

/**
 * Starts playing the track junction if the right conditions exist.
 * @param {!audioCat.audio.junction.TrackJunction} trackJunction The track
 *     junction to start if the right conditions exist.
 * @param {number} time The time into the audio to start playing at.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to start into. If not
 *     provided, uses a live audio context instead.
 * @private
 */
audioCat.audio.AudioGraph.prototype.maybeStartTrackJunction_ =
    function(trackJunction, time, opt_offlineAudioContext) {
  if (!this.trackJunctionsStarted_ && !opt_offlineAudioContext) {
    // The tracks in general are not supposed to playing now.
    return;
  }

  var soloedTrack = this.trackManager_.getSoloedTrack();
  if (soloedTrack && soloedTrack.getId() != trackJunction.getTrackId()) {
    // If a track is currently soloed, don't play if this is the wrong track.
    return;
  }

  // Start the track even if it is muted since it could be unmuted during play.
  // Starting the track doesn't necessarily mean making sound.
  trackJunction.start(time, opt_offlineAudioContext);
};

/**
 * Stops any start nodes from playing. Type-checking suppressed due to how
 * Closure errs if objects are indexed with numbers.
 */
audioCat.audio.AudioGraph.prototype.stopAllStartNodes = function() {
  var trackJunctionMapping = this.trackIdJunctionMapping_;
  goog.object.forEach(trackJunctionMapping, function(trackJunction) {
    trackJunction.stop();
  }, this);

  this.trackJunctionsStarted_ = false;

  // TODO(chizeng): Decide if using an accumulator is helpful.
  // Empty staged source nodes so we can play again next time.
  // this.startNodeAccumulator_.emptyStartNodes();
};

/**
 * Sets the master gain value.
 * @param {number} masterGain The master gain value.
 */
audioCat.audio.AudioGraph.prototype.setMasterGain = function(masterGain) {
  if (goog.math.nearlyEquals(masterGain, this.masterGainJunction_.getGain())) {
    // No change to the master gain occured.
    return;
  }
  this.masterGainJunction_.setGain(masterGain);
  this.dispatchEvent(audioCat.audio.EventType.MASTER_GAIN_CHANGED);
};

/**
 * @return {number} The master gain value.
 */
audioCat.audio.AudioGraph.prototype.getMasterGain = function() {
  return this.masterGainJunction_.getGain();
};

/**
 * @return {!audioCat.audio.junction.AnalyserJunction} The analyser junction
 *     used to analyse audio.
 */
audioCat.audio.AudioGraph.prototype.getAnalyserJunction = function() {
  return this.analyserJunction_;
};

/**
 * @return {!Array.<!audioCat.audio.junction.AnalyserJunction>} A list of
 *     analyser junctions - one for each channel.
 */
audioCat.audio.AudioGraph.prototype.getChannelAnalyserJunctions = function() {
  return this.channelAnalyserJunctions_;
};

/**
 * @return {number} The sample rate of the output for the project.
 */
audioCat.audio.AudioGraph.prototype.getSampleRate = function() {
  return this.audioContextManager_.getSampleRate();
};
