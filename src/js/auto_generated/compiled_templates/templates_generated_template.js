// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

goog.provide('audioCat.action.templates');

goog.require('soy');
goog.require('soydata');


audioCat.action.templates.ImportFailedMessage = function(opt_data, opt_ignored) {
  return '<div>The file could not be imported. Sorry, we tried our best.<br><img src="images/sadCat.jpg" class="' + goog.getCssName('catDiversionImage') + '"></div>';
};

;
// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

goog.provide('audioCat.ui.dialog.templates');

goog.require('soy');
goog.require('soydata');


audioCat.ui.dialog.templates.Dialog = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('dialogOuterWrapper') + '\'><div class=\'' + goog.getCssName('dialogInnerWrapper') + '\'></div></div>';
};


audioCat.ui.dialog.templates.ImportAudioDialog = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('importAudioDialog') + '\'><h2>Import Audio</h2><span class=' + goog.getCssName('warningBox') + '></span><div class=\'' + goog.getCssName('supportBox') + '\'>Formats your system likely supports:<div class=\'' + goog.getCssName('supportedListing') + '\'>' + soy.$$escapeHtml(opt_data.supportedFormats) + ', and videos that use these encodings.</div></div><div class=\'' + goog.getCssName('unSupportedBox') + '\'>Unsupported formats:<div class=\'' + goog.getCssName('unsupportedListing') + '\'>' + soy.$$escapeHtml(opt_data.unsupportedFormats) + '</div></div><input class=\'' + goog.getCssName('audioUploadInputElement') + '\' type=\'file\'></div>';
};

;
// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

goog.provide('audioCat.ui.project.templates');

goog.require('soy');
goog.require('soydata');


audioCat.ui.project.templates.projectTitle = function(opt_data, opt_ignored) {
  return '<span class=\'' + goog.getCssName('projectTitleTextInput') + '\' contentEditable=true></span>';
};

;
// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

goog.provide('audioCat.ui.templates');

goog.require('soy');
goog.require('soydata');


audioCat.ui.templates.TrackDescriptorBox = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('trackDescriptorBox') + '\'><input class=\'' + goog.getCssName('trackTitleDisplay') + '\' type=\'text\' value=\'' + soy.$$escapeHtml(opt_data.trackName) + '\'><div class=\'' + goog.getCssName('fxButton') + '\'><div class=\'' + goog.getCssName('backgroundElement') + '\'></div><div class=\'' + goog.getCssName('textContent') + '\'>FX</div></div><div class=\'' + goog.getCssName('effectChipsAltererWrapper') + '\'></div><div class=\'' + goog.getCssName('trackVolumeControllerContainer') + '\'><div class=\'' + goog.getCssName('volumeSliderContainer') + '\'></div></div><div class=\'' + goog.getCssName('trackPanControllerContainer') + '\'><div class=\'' + goog.getCssName('panSliderContainer') + '\'></div></div><div class=\'' + goog.getCssName('trackButtonsContainer') + '\'><div class=\'' + goog.getCssName('trackButton') + ' ' + goog.getCssName('trackMuteButton') + '\'><div class=\'' + goog.getCssName('buttonText') + '\'>Mute</div></div><div class=\'' + goog.getCssName('trackButton') + ' ' + goog.getCssName('trackSoloButton') + '\'><div class=\'' + goog.getCssName('buttonText') + '\'>Solo</div></div><div class=\'' + goog.getCssName('trackButton') + ' ' + goog.getCssName('trackDeleteButton') + '\'><div class=\'' + goog.getCssName('buttonText') + '\'>Delete</div></div></div></div>';
};


audioCat.ui.templates.TrackAudioArea = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('trackAudioArea') + '\'><div class=\'' + goog.getCssName('trackWaveformDisplay') + '\'></div><div class=\'' + goog.getCssName('trackEnvelopeArea') + '\'></div></div>';
};


audioCat.ui.templates.EffectChipAlterer = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('effectChipAlterer') + '\'><div class=\'' + goog.getCssName('newEffectButton') + ' ' + goog.getCssName('genericButton') + '\'><div class=\'' + goog.getCssName('backgroundElement') + '\'></div><div class=\'' + goog.getCssName('textContent') + '\'>+</div></div><div class=\'' + goog.getCssName('effectChipContainer') + '\' data-e=\'' + soy.$$escapeHtml(opt_data.effectManagerId) + '\'></div></div>';
};


audioCat.ui.templates.EffectChip = function(opt_data, opt_ignored) {
  return '<div class=\'' + goog.getCssName('effectChip') + '\' data-e=' + soy.$$escapeHtml(opt_data.effectId) + '><div class=\'' + goog.getCssName('removeEffectChipButton') + '\'><span class=\'' + goog.getCssName('textContent') + '\'>&#10005;</span></div><div class=\'' + goog.getCssName('effectChipMainContent') + '\'><span class=\'' + goog.getCssName('effectChipFullName') + '\'>' + soy.$$escapeHtml(opt_data.effectName) + '</span><span class=\'' + goog.getCssName('effectChipAbbreviation') + '\'>' + soy.$$escapeHtml(opt_data.effectAbbreviation) + '</span></div></div>';
};
