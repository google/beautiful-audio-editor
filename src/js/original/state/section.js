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
goog.provide('audioCat.state.Section');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.ClipAddedEvent');
goog.require('audioCat.state.SectionBeginTimeChangedEvent');
goog.require('audioCat.state.TrackChangedForSectionEvent');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');


/**
 * Manages a contiguous section of audio. A section is a block of audio that can
 * be readily moved around and have effects be applied to it.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates numeric IDs
 *     unique throughout a single instance of the entire application.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing that
 *     larger piece of audio.
 * @param {string} sectionName The name of the section.
 * @param {number} beginTime The time at which the section begins on the track
 *     in seconds.
 * @param {audioCat.state.Track=} opt_track The track that this section belongs
 *     to. If not specified or null, then the section belongs to no track.
 * @param {!Array.<!audioCat.state.Clip>=} opt_clips An optional list of initial
 *     clips.
 * @param {number=} opt_playbackRate The playback rate for the section of audio.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.Section = function(
    idGenerator,
    audioChest,
    sectionName,
    beginTime,
    opt_track,
    opt_clips,
    opt_playbackRate) {
  goog.base(this);

  /**
   * An ID that uniquely identifies this section.
   * @private {audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * The larger piece of audio.
   * @private {!audioCat.audio.AudioChest}
   */
  this.audioChest_ = audioChest;

  /**
   * The time at which the section begins on the track.
   * @private {number}
   */
  this.beginTime_ = beginTime;

  /**
   * The playback rate for this section of audio.
   * @private {number}
   */
  this.playbackRate_ = opt_playbackRate ||
      audioCat.audio.Constant.DEFAULT_PLAYBACK_RATE;


  /**
   * A list of clips sorted by begin time. The clips cannot overlap in time.
   * @private {!Array.<!audioCat.state.Clip>}
   */
  this.clips_ = opt_clips || [];

  // If we have clips, then use them to compute the duration.
  var duration = 0;
  if (opt_clips && opt_clips.length) {
    var minSampleIndex = opt_clips[0].getBeginSampleIndex();
    var maxSampleIndex = opt_clips[0].getRightSampleBound();
    for (var c = 0; c < opt_clips.length; ++c) {
      var clip = opt_clips[c];
      if (clip.getBeginSampleIndex() < minSampleIndex) {
        minSampleIndex = clip.getBeginSampleIndex();
      }
      if (clip.getRightSampleBound() > maxSampleIndex) {
        maxSampleIndex = clip.getRightSampleBound();
      }
    }
    var untaintedDuration =
        (maxSampleIndex - minSampleIndex) / this.getSampleRate();
  }

  /**
   * The duration without considering the playback rate.
   * @private {number}
   */
  this.playbackRate1Duration_ = untaintedDuration || 0;

  // TODO(chizeng): Update the duration during various changes to the section.
  /**
   * The duration of the section in seconds.
   * @private {number}
   */
  this.duration_ = untaintedDuration / this.playbackRate_;

  /**
   * The name of the section.
   * @private {string}
   */
  this.sectionName_ = sectionName;

  /**
   * The track that this section is currently in. Or null if this section is not
   * within any track.
   * @private {audioCat.state.Track}
   */
  this.track_ = opt_track || null;

  /**
   * Whether or not this section is marked as being moved.
   * @private {boolean}
   */
  this.movingState_ = false;

  /**
   * The sample offset at which to starting iterating to determine the height of
   * the wave bar representing a sample. The concept of this offset prevents
   * jerkiness when the user tries to split a clip in half.
   * @private {number}
   */
  this.sampleOffsetIndex_ = 0;
};
goog.inherits(audioCat.state.Section, audioCat.utility.EventTarget);


/**
 * Compares 2 sections. This ordering is strictly increasing for assuming a
 * listing has all unique sections. Compares by begin time, then by ID.
 * @param {!audioCat.state.Section} section1
 * @param {!audioCat.state.Section} section2
 * @return {number} -1 if the first section is less than, 1 if the first section
 *     is greater than the second section, and 0 if they are equal.
 */
audioCat.state.Section.compareSectionsByBeginTime = function(
    section1,
    section2) {
  if (section1.getBeginTime() != section2.getBeginTime()) {
    return (section1.getBeginTime() < section2.getBeginTime()) ? -1 : 1;
  }
  if (section1.getId() != section2.getId()) {
    return (section1.getId() < section2.getId()) ? -1 : 1;
  }
  return 0;
};


/**
 * @return {!audioCat.audio.AudioChest} The audio chest containing the audio.
 */
audioCat.state.Section.prototype.getAudioChest = function() {
  return this.audioChest_;
};

/**
 * Sets whether or not this section is marked as being moved.
 * @param {boolean} movingState Whether this section is marked as currently
 *     being moved.
 */
audioCat.state.Section.prototype.setMovingState = function(movingState) {
  if (this.movingState_ == movingState) {
    return;
  }
  this.movingState_ = movingState;
  this.dispatchEvent(audioCat.state.events.SECTION_MOVING_STATE_CHANGED);
};

/**
 * @return {boolean} Whether this section is marked as being moved.
 */
audioCat.state.Section.prototype.getMovingState = function() {
  return this.movingState_;
};

/**
 * @return {audioCat.utility.Id} An ID that is unique to this section
 *     throughout the application.
 */
audioCat.state.Section.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {audioCat.state.Track} The track that the section is currently in. Or
 *     null if the section is not within any track.
 */
audioCat.state.Section.prototype.getTrack = function() {
  return this.track_;
};

/**
 * Sets the track that the section belongs to.
 * @param {audioCat.state.Track} track The track that the section belongs to. Or
 *     null to specify that the section belongs to no track.
 */
audioCat.state.Section.prototype.setTrack = function(track) {
  this.track_ = track;
  this.dispatchEvent(new audioCat.state.TrackChangedForSectionEvent(track));
};

/**
 * @return {number} The sample rate.
 */
audioCat.state.Section.prototype.getSampleRate = function() {
  return this.audioChest_.getSampleRate();
};

/**
 * @return {number} The number of channels.
 */
audioCat.state.Section.prototype.getNumberOfChannels = function() {
  return this.audioChest_.getNumberOfChannels();
};

/**
 * @return {number} The duration in seconds.
 */
audioCat.state.Section.prototype.getDuration = function() {
  return this.duration_;
};

/**
 * Sets the playback rate.
 * @param {number} playbackRate The playback rate.
 */
audioCat.state.Section.prototype.setPlaybackRate = function(playbackRate) {
  if (this.playbackRate_ != playbackRate) {
    this.playbackRate_ = playbackRate;
    this.duration_ = this.playbackRate1Duration_ / playbackRate;
    this.dispatchEvent(audioCat.state.events.PLAYBACK_RATE_CHANGED);
  }
};

/**
 * @return {number} The playback rate.
 */
audioCat.state.Section.prototype.getPlaybackRate = function() {
  return this.playbackRate_;
};

/**
 * @return {number} The duration of this section of audio assuming a playback
 *     rate of 1.
 */
audioCat.state.Section.prototype.getPlaybackRate1Duration = function() {
  return this.playbackRate1Duration_;
};

/**
 * @return {number} The index of the sample of the audio stored in the
 *     audio chest at which the section of audio begins. This index might not be
 *     zero - ie, in the case in which the audio was cropped. Returns 0 if no
 *     clips exist in this section.
 */
audioCat.state.Section.prototype.getBeginAudioChestSampleIndex = function() {
  var clips = this.clips_;
  if (!clips.length) {
    return 0;
  }
  return clips[0].getBeginSampleIndex();
};

/**
 * @return {number} The exclusive right bound of the sample of the audio stored
 *     in the audio chest at which the section of audio begins. This index might
 *     not be zero - ie, in the case in which the audio was cropped. Returns 0
 *     if no clips exist in this section.
 */
audioCat.state.Section.prototype.getAudioChestSampleRightBound = function() {
  var clips = this.clips_;
  var numberOfClips = clips.length;
  if (numberOfClips == 0) {
    return 0;
  }
  return clips[numberOfClips - 1].getRightSampleBound();
};

/**
 * Sets the time at which the section begins playing.
 * @param {number} beginTime The new begin time in seconds.
 * @param {boolean=} opt_silentChange If true, sets the begin time without
 *     notifying other entities by dispatching an event. Using this option is
 *     rather dangerous and is usually for temporary purposes. Defaults to
 *     false. Make sure to speedily change the time back if you use this.
 */
audioCat.state.Section.prototype.setBeginTime = function(
    beginTime,
    opt_silentChange) {
  var previousBeginTime = this.beginTime_;
  if (previousBeginTime == beginTime) {
    // Nothing to change.
    return;
  }
  this.beginTime_ = beginTime;
  if (!opt_silentChange) {
    this.dispatchEvent(new audioCat.state.SectionBeginTimeChangedEvent(
        previousBeginTime, beginTime));
  }
};

/**
 * @return {number} The beginning time of the section in seconds.
 */
audioCat.state.Section.prototype.getBeginTime = function() {
  return this.beginTime_;
};

/**
 * @return {string} The name of the section.
 */
audioCat.state.Section.prototype.getName = function() {
  return this.sectionName_;
};

/**
 * Removes all clips from this section. Fires no event.
 */
audioCat.state.Section.prototype.removeAllClips = function() {
  this.clips_.length = 0;
  this.dispatchEvent(audioCat.state.events.CLIPS_REMOVED);
};

/**
 * Adds a clip of audio to the section. A clip just specifies an interval of
 * samples.
 * @param {!audioCat.state.Clip} clip The clip to add.
 * @param {boolean=} opt_silently Whether to add the clip without firing an
 *     event.
 */
audioCat.state.Section.prototype.addClip = function(clip, opt_silently) {
  var clips = this.clips_;
  var newClipBeginRelativeTime = 0;
  var sampleRate = this.audioChest_.getSampleRate();
  for (var i = 0; i < clips.length; ++i) {
    var localClip = clips[i];
    newClipBeginRelativeTime += localClip.getRightSampleBound() -
        localClip.getBeginSampleIndex();
  }
  newClipBeginRelativeTime /= sampleRate;
  this.clips_.push(clip);

  // TODO(chizeng): Fix this to allow for multiple ones.
  var clipBeginSampleIndex = clip.getBeginSampleIndex();
  var clipEndSampleRightBound = clip.getRightSampleBound();

  // Every time a clip is altered, added, or removed, update the duration.
  this.playbackRate1Duration_ =
      (clipEndSampleRightBound - clipBeginSampleIndex) / sampleRate;
  this.duration_ = this.playbackRate1Duration_ / this.playbackRate_;

  // Dispatch an event notifying others of the new clip.
  if (!opt_silently) {
    this.dispatchEvent(new audioCat.state.ClipAddedEvent(
         clip, newClipBeginRelativeTime));
  }
};

/**
 * Sets the audio chest of this section.
 * @param {!audioCat.audio.AudioChest} audioChest
 */
audioCat.state.Section.prototype.setAudioChest = function(audioChest) {
  this.audioChest_ = audioChest;
  this.dispatchEvent(audioCat.state.events.AUDIO_CHEST_CHANGED);
};

/**
 * @return {number} The number of clips this section has.
 */
audioCat.state.Section.prototype.getNumberOfClips = function() {
  return this.clips_.length;
};

/**
 * Obtains the clip at a certain index in the section. Assumes that
 * clipIndex lies within [0, this.getNumberOfClips()].
 * @param {number} clipIndex An integer. The index of the clip to return.
 * @return {!audioCat.state.Clip} The clip at a certain index.
 */
audioCat.state.Section.prototype.getClipAtIndex = function(clipIndex) {
  return /** @type {!audioCat.state.Clip} */ (this.clips_[clipIndex]);
};

/**
 * Obtains the sample value at an index into the AudioChest.
 * @param {number} channelIndex The channel from which to obtain the sample.
 * @param {number} sampleIndex The index to obtain the sample for.
 * @return {number} The sample within [-1.0, 1.0] at a certain index in the
 *     audio chest.
 */
audioCat.state.Section.prototype.getSampleAtIndex =
    function(channelIndex, sampleIndex) {
  return this.audioChest_.getSampleAtIndex(channelIndex, sampleIndex);
};

/**
 * Converts samples to seconds based on the section's characteristics like
 * sample rate.
 * @param {number} numberOfSamples The number of samples.
 * @return {number} The time duration in seconds.
 */
audioCat.state.Section.prototype.computeDurationFromSamples =
    function(numberOfSamples) {
  return numberOfSamples / this.audioChest_.getSampleRate();
};

/**
 * Creates a copy of the section identical to this one, except not attached to
 * the track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @return {!audioCat.state.Section} A section identical to this one. Except
 *     this new section is not attached to the track of the original section.
 */
audioCat.state.Section.prototype.clone = function(idGenerator) {
  var newSection = new audioCat.state.Section(
      idGenerator, this.audioChest_, this.getName(), this.getBeginTime(),
      undefined, undefined, this.playbackRate_);
  var numberOfClips = this.getNumberOfClips();
  for (var i = 0; i < numberOfClips; ++i) {
    newSection.addClip(this.getClipAtIndex(i));
  }
  return newSection;
};

/**
 * @return {number} The offset at which to start iterating through samples.
 */
audioCat.state.Section.prototype.getSampleOffset = function() {
  return this.sampleOffsetIndex_;
};

/**
 * Sets the offset at which to start iterating through samples.
 * @param {number} sampleOffset The offset.
 */
audioCat.state.Section.prototype.setSampleOffset = function(sampleOffset) {
  this.sampleOffsetIndex_ = sampleOffset;
};
