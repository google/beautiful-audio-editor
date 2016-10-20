goog.provide('audioCat.audio.junction.effect.EffectJunction');

goog.require('audioCat.audio.junction.SubsequentJunction');

/**
 * An interface that all junctions that induce some effect must implement.
 * Extends the interface for subsequent nodes - after all, effect nodes must
 * come after other nodes.
 * @interface
 * @extends {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.effect.EffectJunction = function() {
};
