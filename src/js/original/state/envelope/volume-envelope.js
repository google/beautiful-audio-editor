goog.provide('audioCat.state.envelope.VolumeEnvelope');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.envelope.Envelope');


/**
 * The internal model representation of an envelope for controlling volume.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!Array.<!audioCat.state.envelope.ControlPoint>=} opt_controlPoints A
 *     list of initial control points for the envelope. Empty if not provided.
 * @constructor
 * @extends {audioCat.state.envelope.Envelope}
 */
audioCat.state.envelope.VolumeEnvelope =
    function(idGenerator, opt_controlPoints) {
  // Initial value of 1.0 for volume. Volume must be within [0.0, 2.0].
  var constant = audioCat.audio.Constant;
  goog.base(
      this,
      idGenerator,
      'Volume',
      constant.DEFAULT_VOLUME_SAMPLE_UNITS,
      constant.MIN_VOLUME_SAMPLE_UNITS,
      constant.MAX_VOLUME_SAMPLE_UNITS,
      '',
      opt_controlPoints,
      'Silence',
      '0 dB',
      '6 dB');
};
goog.inherits(audioCat.state.envelope.VolumeEnvelope,
    audioCat.state.envelope.Envelope);
