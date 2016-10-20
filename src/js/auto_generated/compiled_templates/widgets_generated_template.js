// This file was automatically generated from widgets.soy.
// Please don't edit this file by hand.

goog.provide('audioCat.ui.widget.templates');

goog.require('soy');
goog.require('soydata');


audioCat.ui.widget.templates.SliderWidget = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('sliderWidgetContainer') + '\'><span class=\'' + goog.getCssName('sliderLeftLabel') + '\'>' + soy.$$escapeHtml(opt_data.leftLabel) + '</span><div class=\'' + goog.getCssName('sliderLabelAndValueContainer') + '\'><span class=\'' + goog.getCssName('sliderLabel') + '\'>' + soy.$$escapeHtml(opt_data.mainLabel) + ': </span><span class=\'' + goog.getCssName('sliderValueContainer') + '\'>' + soy.$$escapeHtml(opt_data.initialStateValue) + '</span></div><span class=\'' + goog.getCssName('sliderRightLabel') + '\'>' + soy.$$escapeHtml(opt_data.rightLabel) + '</span><br><input class=\'' + goog.getCssName('sliderInputElement') + '\' type=\'range\' min=\'' + soy.$$escapeHtml(opt_data.minSliderValue) + '\' max=\'' + soy.$$escapeHtml(opt_data.maxSliderValue) + '\' value=\'' + soy.$$escapeHtml(opt_data.initialSliderValue) + '\'></div>';
};


audioCat.ui.widget.templates.SliderWidgetValueDialog = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('sliderDialogContainer') + '\'><h3>' + soy.$$escapeHtml(opt_data.mainLabel) + '</h3><form class=\'' + goog.getCssName('sliderDialogForm') + '\' method=\'get\'><div class=\'' + goog.getCssName('messageBoxContainer') + '\'><div class=\'' + goog.getCssName('warningBox') + '\'></div><div class=\'' + goog.getCssName('successBox') + '\'></div></div><div class=\'' + goog.getCssName('extremeDialogSegment') + '\'><span class=\'' + goog.getCssName('extremeDialogSegmentDefinition') + '\'>Minimum</span><span class=\'' + goog.getCssName('extremeDialogSegmentValue') + '\'>' + soy.$$escapeHtml(opt_data.minStateValue) + '</span></div><div class=\'' + goog.getCssName('extremeDialogSegment') + '\'><span class=\'' + goog.getCssName('extremeDialogSegmentDefinition') + '\'>Maximum</span><span class=\'' + goog.getCssName('extremeDialogSegmentValue') + '\'>' + soy.$$escapeHtml(opt_data.maxStateValue) + '</span></div><input type=\'text\' value=\'' + soy.$$escapeHtml(opt_data.currentStateValue) + '\' class=\'' + goog.getCssName('sliderDialogInputElement') + '\'><input type=\'submit\' value=\'submit\'></form></div>';
};


audioCat.ui.widget.templates.PlayWidget = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('playWidgetContainer') + '\'><div class=\'' + goog.getCssName('playWidgetButton') + ' ' + goog.getCssName('defaultAudioSourceRecordButton') + '\'>&#9679;</div><div class=\'' + goog.getCssName('defaultRecordingTimeDisplay') + '\'></div></div>';
};
