goog.provide('audioCat.state.StatePlanManager');

goog.require('audioCat.state.DecodingEndedEvent');
goog.require('audioCat.state.EncodingDoneEvent');
goog.require('audioCat.state.events');
goog.require('audioCat.state.plan.JsonEncoderStrategy');
goog.require('audioCat.utility.EventTarget');


/**
 * Encodes and decodes the project state using some particular strategy.
 * @param {!audioCat.state.Project} project Contains project meta data.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates successive
 *     unique IDs. These IDs are unique throughout the entire application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages
 *     interactions with the audio context and the web audio API in general.
 * @param {!audioCat.audio.AudioGraph} audioGraph Hooks audio components
 *     together.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages how time is scaled and displayed.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Centralizes creating effects of various types.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Manages
 *     effects applied to the master output.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.utility.ArrayHexifier} arrayHexifier Converts between
 *     arrays and hex strings.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.StatePlanManager = function(
    project,
    idGenerator,
    audioContextManager,
    audioGraph,
    timeDomainScaleManager,
    trackManager,
    effectModelController,
    masterEffectManager,
    commandManager,
    memoryManager,
    arrayHexifier) {
  goog.base(this);
  /**
   * The strategy we use to encode and decode.
   * @private {!audioCat.state.plan.EncoderStrategy}
   */
  this.strategy_ = new audioCat.state.plan.JsonEncoderStrategy(
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
      arrayHexifier);

  // Simply pass on any decoding ended events to listeners of the plan manager.
  this.strategy_.listen(audioCat.state.events.DECODING_ENDED, function(e) {
    this.dispatchEvent(e);
  }, false, this);
};
goog.inherits(audioCat.state.StatePlanManager, audioCat.utility.EventTarget);

/**
 * Takes an encoding and makes the current work space take on its state,
 * overriding any existing content.
 * @param {!ArrayBuffer} encoding The encoding to actuate.
 */
audioCat.state.StatePlanManager.prototype.decode = function(encoding) {
  /** @param {!audioCat.state.DecodingEndedEvent} e */
  this.strategy_.listenOnce(audioCat.state.events.DECODING_ENDED, function(e) {
    this.dispatchEvent(new audioCat.state.DecodingEndedEvent(e.getError()));
  }, false, this);
  this.strategy_.decode(encoding);
};

/**
 * Produces an encoding of the state of the project that can
 * be later loaded into the app. Fires an EncodingDone event when done encoding.
 * Also returns the encoding.
 * @return {!Blob}
 */
audioCat.state.StatePlanManager.prototype.produceEncoding = function() {
  this.dispatchEvent(audioCat.state.events.ENCODING_BEGAN);
  var encoding = this.strategy_.produceEncoding();
  this.dispatchEvent(new audioCat.state.EncodingDoneEvent(encoding));
  return encoding;
};
