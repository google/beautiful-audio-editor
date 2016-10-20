goog.provide('audioCat.ui.master.effect.MasterEffectAppearButton');

goog.require('audioCat.ui.master.MainMasterButton');
goog.require('audioCat.ui.tracks.effect.FxAppearButtonManager');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A widget that toggles whether the master effects feature appears.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment - a segment like a track of audio.
 * @param {!audioCat.ui.tracks.effect.EffectChipsAlterer} effectChipsAlterer
 *     Manages chips representing effects for a segment of audio.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.effect.MasterEffectAppearButton = function(
    domHelper,
    effectManager,
    effectChipsAlterer) {
  var buttonElement = new audioCat.ui.master.MainMasterButton(domHelper, 'FX')
      .getDom();
  goog.dom.classes.add(buttonElement, goog.getCssName('masterFxButton'));
  goog.base(this, buttonElement);

  /**
   * Manages the button for toggling whether the chips alterer appear.
   * @private {!audioCat.ui.tracks.effect.FxAppearButtonManager}
   */
  this.fxAppearManager_ = new audioCat.ui.tracks.effect.FxAppearButtonManager(
      domHelper,
      effectManager,
      effectChipsAlterer,
      buttonElement);
};
goog.inherits(audioCat.ui.master.effect.MasterEffectAppearButton,
    audioCat.ui.widget.Widget);
