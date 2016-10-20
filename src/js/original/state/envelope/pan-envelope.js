goog.provide('audioCat.state.envelope.PanEnvelope');

goog.require('audioCat.state.envelope.Envelope');


/**
 * The internal model representation of an envelope for controlling panning.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!Array.<!audioCat.state.envelope.ControlPoint>=} opt_controlPoints A
 *     list of initial control points for the envelope. Empty if not provided.
 * @constructor
 * @extends {audioCat.state.envelope.Envelope}
 */
audioCat.state.envelope.PanEnvelope =
    function(idGenerator, opt_controlPoints) {
  // Initial value of 0 for volume. Volume must be within [-45, 45].
  var halfSpan = 45;
  goog.base(
      this,
      idGenerator,
      'Pan',
      0,
      -1 * halfSpan,
      halfSpan,
      '',
      opt_controlPoints);
};
goog.inherits(audioCat.state.envelope.PanEnvelope,
    audioCat.state.envelope.Envelope);
