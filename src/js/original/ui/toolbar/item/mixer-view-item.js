goog.provide('audioCat.ui.toolbar.item.MixerViewItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A toolbar item for toggling between mixer view and normal view for looking at
 * tracks.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.MixerViewItem = function(
    domHelper,
    editModeManager,
    actionManager,
    toolTip) {
  /**
   * Whether we are in mixer mode.
   * @private {boolean}
   */
  this.mixerMode_ = false;

  /**
   * The label.
   * @private {string}
   */
  this.label_ = this.determineAriaLabel_();

  goog.base(this, domHelper, editModeManager, actionManager, toolTip,
      this.label_, undefined, true,
      'View tracks in mixer mode.');

  // Indicate to users that this item is clickable even when active.
  this.setClickableOnActive(true);

  domHelper.listenForPress(this.getDom(), this.handlePress_, false, this);
};
goog.inherits(
    audioCat.ui.toolbar.item.MixerViewItem, audioCat.ui.toolbar.item.Item);

/**
 * Handles what happens when you click on this button. Specifically, toggles
 * whether we are in mixer mode.
 * @private
 */
audioCat.ui.toolbar.item.MixerViewItem.prototype.handlePress_ = function() {
  // TODO(chizeng): Put this logic into an action.
  this.mixerMode_ = !this.mixerMode_;
  this.label_ = this.determineAriaLabel_();

  // Change the UI appropriately.
  var trackPanel = goog.dom.getElementByClass(goog.getCssName('all'));
  goog.asserts.assert(trackPanel, 'The application container was not found.');
  var functionToApply = this.mixerMode_ ?
      goog.dom.classes.add : goog.dom.classes.remove;
  functionToApply(trackPanel, goog.getCssName('mixerViewOn'));
  this.setActiveState(this.mixerMode_);
};

/**
 * Computes the currently appropriate aria label.
 * @return {string} The proper aria label for current circumstances.
 * @private
 */
audioCat.ui.toolbar.item.MixerViewItem.prototype.determineAriaLabel_ =
    function() {
  return (this.mixerMode_ ? 'Exit' : 'View tracks in') + ' mixer mode.';
};

/** @override */
audioCat.ui.toolbar.item.MixerViewItem.prototype.getInternalDom = function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/mixerView.svg');
};
