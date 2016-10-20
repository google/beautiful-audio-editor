goog.provide('audioCat.audio.junction.Type');


/**
 * Enumerates types of junctions. Increment the following index when a new type
 * of junction is added.
 * Next available integer: 19
 * @enum {number}
 */
audioCat.audio.junction.Type = {
  ANALYSER: 4,
  CHANNEL_SPLITTER: 17,
  CLIP: 5,
  CONVOLVER: 18,
  DELAY: 8,
  DESTINATION: 7,
  DYNAMIC_COMPRESSOR: 16,
  EFFECT_MANAGER: 13,
  FILTER_EFFECT: 14,
  GAIN: 2,
  GAIN_EFFECT: 15,
  MEDIA_SOURCE: 11,
  PAN: 3,
  PAN_ENVELOPE: 10,
  SECTION: 6,
  SCRIPT_PROCESSOR: 12,
  TRACK: 1,
  VOLUME_ENVELOPE: 9
};
