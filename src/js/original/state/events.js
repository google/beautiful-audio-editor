goog.provide('audioCat.state.events');


/**
 * Enumerates event names. When you add an event, increment the following
 * letter. Make sure to keep event names and numbers unique. Currently, there
 * is no automatic way to maintain this list of event names.
 * Next available event string: zb
 * @enum {string}
 */
audioCat.state.events = {
  ANALYSER_READY: 'r',
  AUDIO_CHEST_CHANGED: 'za',
  CLIP_ADDED: 'n',
  CLIPS_REMOVED: 'z', // All clips cleared from section.
  DECODING_ENDED: 'u',
  ENCODING_BEGAN: 's',
  ENCODING_DONE: 't',
  LICENSE_REGISTRATION_CHANGED: 'w',
  MEMORY_CHANGED: 'y',

  PLAYBACK_RATE_CHANGED: 'x',
  PROJECT_TITLE_CHANGED: 'v',
  SECTION_ADDED: 'f', // A section just got added to a track.
  SECTION_BEGIN_TIME_CHANGED: 'j',
  SECTION_TIME_PROPERTY_CHANGED: 'q', // Track dispatches due to section change.
  SECTION_MOVING_STATE_CHANGED: 'k', // A section has begun to be moved.
  SECTION_REMOVED: 'h',

  // Dispatched by track manager when solo-ed track is removed or changed.
  SOLOED_TRACK_CHANGED: 'o',

  TRACK_ADDED: 'a',
  TRACK_CHANGED_FOR_SECTION: 'i',
  TRACK_NAME_CHANGED: 'p',
  TRACK_MUTE_CHANGED: 'l',
  TRACK_PAN_CHANGED: 'd',
  TRACK_REMOVED: 'g',
  TRACK_SOLO_CHANGED: 'm',
  TRACK_STABLE_PAN_CHANGED: 'e',
  TRACK_STABLE_VOLUME_CHANGED: 'c',
  TRACK_VOLUME_CHANGED: 'b'
};
