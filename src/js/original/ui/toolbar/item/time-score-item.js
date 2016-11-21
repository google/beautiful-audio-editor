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
goog.provide('audioCat.ui.toolbar.item.TimeScoreItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A toolbar item for switching between displaying audio with score or with
 * time units.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history. Executes undos and redos.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the time-domain scale as well as whether
 *     to display with bars or time units.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.TimeScoreItem = function(
    domHelper,
    commandManager,
    editModeManager,
    timeDomainScaleManager,
    actionManager,
    toolTip) {
  /**
   * Manages the scale at which we display the time of audio as well as when we
   * change from displaying using bars to using time or vice versa.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * The internals of this item.
   * @private {!Element}
   */
  this.internals_ = domHelper.createElement('div');
  goog.dom.classes.add(this.internals_, goog.getCssName('barTimeItemInternal'));
  goog.base(
      this, domHelper, editModeManager, actionManager, toolTip, '', undefined,
      true,
      'Switch whether to display the grid based on time or a 4/4 signature.');

  /**
   * The element that contains the text noting the signature.
   * @private {!Element}
   */
  this.timeSignatureTextContainer_ = domHelper.createElement('div');
  domHelper.appendChild(this.internals_, this.timeSignatureTextContainer_);
  goog.dom.classes.add(
      this.timeSignatureTextContainer_,
      goog.getCssName('timeSignatureTextContainer'));

  var numberOfBeatsContainer = domHelper.createElement('div');
  goog.dom.classes.add(
      numberOfBeatsContainer, goog.getCssName('numberOfBeatsContainer'));
  domHelper.appendChild(
      this.timeSignatureTextContainer_, numberOfBeatsContainer);
  /**
   * Contains the portion of the time signature that is the number of beats.
   * @private {!Element}
   */
  this.numberOfBeatsContainer_ = numberOfBeatsContainer;

  var signatureDividingBarContainer = domHelper.createElement('div');
  goog.dom.classes.add(
      signatureDividingBarContainer,
      goog.getCssName('signatureDividingBarContainer'));
  domHelper.appendChild(
      this.timeSignatureTextContainer_, signatureDividingBarContainer);
  /**
   * Contains the dividing bar portion of the time signature.
   * @private {!Element}
   */
  this.signatureDividingBarContainer_ = signatureDividingBarContainer;

  var beatUnitContainer = domHelper.createElement('div');
  goog.dom.classes.add(
      beatUnitContainer,
      goog.getCssName('beatUnitContainer'));
  domHelper.appendChild(
      this.timeSignatureTextContainer_, beatUnitContainer);
  /**
   * Contains the beat unit portion of the time signature.
   * @private {!Element}
   */
  this.beatUnitContainer_ = beatUnitContainer;

  this.displayProperTimeSignature_();

  /**
   * Covers this item with an image that indicates that the time signature is
   * disabled.
   * @private {!Element}
   */
  this.coverImage_ = audioCat.ui.toolbar.item.Item.createIcon(
      domHelper, 'images/forbid.svg');
  goog.dom.classes.add(
      this.coverImage_,
      goog.getCssName('barTimeDisplayForbidCover'));
  domHelper.appendChild(this.internals_, this.coverImage_);

  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.SCORE_TIME_SWAPPED,
      this.handleScoreTimeSwapped_, false, this);

  this.domHelper.listenForPress(this.getDom(), this.handlePress_, false, this);

  // Prevent this item from maintaining its active state after being clicked on.
  // For instance, the item might not maintain its gradient after being clicked.
  this.setClickableOnActive(true);

  // Determine the proper aria label.
  this.setAriaLabel(this.determineAriaLabel_());
};
goog.inherits(
    audioCat.ui.toolbar.item.TimeScoreItem, audioCat.ui.toolbar.item.Item);

/**
 * Handles what happens when you click on this button. Specifically, swaps
 * whether we are displaying audio with bars or with time units.
 * @private
 */
audioCat.ui.toolbar.item.TimeScoreItem.prototype.handlePress_ = function() {
  /** @type {!audioCat.action.track.ToggleSignatureTimeGridAction} */ (
      this.actionManager.retrieveAction(
          audioCat.action.ActionType.TOGGLE_SIGNATURE_TIME_GRID)).doAction();
};

/**
 * Displays the proper time signature.
 * @private
 */
audioCat.ui.toolbar.item.TimeScoreItem.prototype.displayProperTimeSignature_ =
    function() {
  // Update the displayed time signature when it is allowed to change.
  var signatureTempoManager =
      this.timeDomainScaleManager_.getSignatureTempoManager();
  var domHelper = this.domHelper;

  domHelper.setTextContent(this.numberOfBeatsContainer_,
      String(signatureTempoManager.getBeatsInABar()));

  domHelper.setTextContent(this.beatUnitContainer_,
      String(signatureTempoManager.getBeatUnit()));
};

/**
 * Visualizes whether we display audio using bars or time.
 * @private
 */
audioCat.ui.toolbar.item.TimeScoreItem.prototype.handleScoreTimeSwapped_ =
    function() {
  // Changes whether we are active.
  this.setActiveState(this.timeDomainScaleManager_.getDisplayAudioUsingBars());

  // Set the proper label.
  this.setAriaLabel(this.determineAriaLabel_());
};

/**
 * Determines the proper aria label at the moment.
 * @return {string} The proper label.
 * @private
 */
audioCat.ui.toolbar.item.TimeScoreItem.prototype.determineAriaLabel_ =
    function() {
  // TODO(chizeng): Update the aria time signature if the time signature is
  // ever allowed to change.
  var label;
  if (this.timeDomainScaleManager_.getDisplayAudioUsingBars()) {
    label = 'Display with time units.';
  } else {
    var tempoManager = this.timeDomainScaleManager_.getSignatureTempoManager();
    label = 'Display with ' + tempoManager.getBeatsInABar() + ' ' +
        tempoManager.getBeatUnit() + ' time signature.';
  }
  if (!this.getEnabledState()) {
    label = 'Disabled ' + label + ' button.';
  }
  return label;
};

/** @override */
audioCat.ui.toolbar.item.TimeScoreItem.prototype.getInternalDom = function() {
  return this.internals_;
};
