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
goog.provide('audioCat.audio.AudioContextManager');
goog.provide('audioCat.audio.AudioContextManager.NonNullOfflineAudioContext');


/** @typedef {!OfflineAudioContext} */
var NonNullOfflineAudioContext;

/** @typedef {AudioContext|OfflineAudioContext} */
var AudioContextLike;


/**
 * Manages audio contexts - both the single normal and several offline ones.
 * @constructor
 */
audioCat.audio.AudioContextManager = function() {
  // Determine which constructor to use based on the browser.
  var audioContextConstructor = goog.global.AudioContext ||
      goog.global.webkitAudioContext;
  if (!audioContextConstructor) {
    // No audio context constructor works. :(
    throw 2;
  }

  /**
   * The normal audio context.
   * @private {!AudioContext}
   */
  this.audioContext_ = new audioContextConstructor();

  /**
   * The copyToChannel method to use.
   * @private {!Function}
   */
  this.copyToChannelFunction_ = AudioBuffer.prototype['copyToChannel'] ||
      AudioBuffer.prototype['webkitCopyToChannel'];
};


/** @typedef {!OfflineAudioContext} */
audioCat.audio.AudioContextManager.NonNullOfflineAudioContext;

/**
 * Returns the current absolute time in seconds since the inception of the
 * audio context.
 * @param {!AudioContextLike=} opt_audioContext If provided, uses the given
 *     audio context to compute the absolute time. If not provided, uses the
 *     default live audio context.
 * @return {number} The current absolute time in seconds. The absolute time is
 *     is a very accurate time provided by the HTML5 audio context.
 */
audioCat.audio.AudioContextManager.prototype.getAbsoluteTime =
    function(opt_audioContext) {
  return (opt_audioContext || this.audioContext_).currentTime;
};

/**
 * Creates a buffer source node.
 * @param {!audioCat.audio.AudioChest} audioChest The audio chest to use for
 *     creating the source node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a source node.
 * @return {!AudioBufferSourceNode} A source node for the audio chest.
 */
audioCat.audio.AudioContextManager.prototype.createSourceNode =
    function(audioChest, opt_offlineContext) {
  var contextToUse = opt_offlineContext || this.audioContext_;
  var sourceNode = /** @type {!AudioBufferSourceNode} */ (
      contextToUse.createBufferSource());
  audioChest.setForSourceNode(sourceNode);
  return sourceNode;
};

/**
 * Creates a media stream source node.
 * @param {!MediaStream} mediaStream The media stream.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a source node.
 * @return {!MediaStreamAudioSourceNode} A new media stream source node.
 */
audioCat.audio.AudioContextManager.prototype.createMediaStreamSourceNode =
    function(mediaStream, opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).
      createMediaStreamSource(mediaStream);
};

/**
 * Creates an audio destination node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a destation node.
 * @return {!AudioDestinationNode} A new audio destination node.
 */
audioCat.audio.AudioContextManager.prototype.createAudioDestinationNode =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).destination;
};

/**
 * Obtains the singleton listener for the audio context. The listener has
 * various properties of a listener of audio.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a destation node.
 * @return {!AudioListener} A listener for the panner. Represents the location
 *     and other properties of the listener.
 */
audioCat.audio.AudioContextManager.prototype.getListener =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).listener;
};

/**
 * Sets the channel count of an audio node.
 * @param {!AudioNode} node The audio node to set the channel count for.
 * @param {number} channelCount The channel count to set to.
 */
audioCat.audio.AudioContextManager.prototype.setChannelCount = function(
    node, channelCount) {
  node.channelCount = channelCount;
};

/**
 * Gets the channel count of an audio node.
 * @param {!AudioNode} node The audio node to set the channel count for.
 * @return {number} The channel count.
 */
audioCat.audio.AudioContextManager.prototype.getChannelCount = function(node) {
  return node.channelCount;
};

/**
 * Gets the channel data of an audio buffer for some channel.
 * @param {!AudioBuffer} audioBuffer The audio buffer to get data for.
 * @param {number} channelIndex The index of the channel to get data for.
 * @return {Float32Array} The data for the channel.
 */
audioCat.audio.AudioContextManager.prototype.getChannelData = function(
    audioBuffer,
    channelIndex) {
  return audioBuffer.getChannelData(channelIndex);
};

/**
 * Sets the playback rate of an audio source node.
 * @param {!AudioBufferSourceNode} audioSourceNode The source node to change the
 *     playback rate for.
 * @param {number} playbackRate The new playback rate.
 */
audioCat.audio.AudioContextManager.prototype.setPlaybackRate = function(
    audioSourceNode, playbackRate) {
  audioSourceNode.playbackRate.value = playbackRate;
};

/**
 * Creates a script processor node.
 * @param {number} numberOfChannels The number of channels.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a script processor node.
 * @return {!ScriptProcessorNode} A new script processor node.
 */
audioCat.audio.AudioContextManager.prototype.createScriptProcessorNode =
    function(numberOfChannels, opt_offlineContext) {
  var audioContext = opt_offlineContext || this.audioContext_;
  audioContext.createScriptProcessor = audioContext.createScriptProcessor ||
      audioContext.createJavaScriptNode;
  return audioContext.createScriptProcessor(
      undefined, numberOfChannels, numberOfChannels);
};

/**
 * Creates an analyser node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create an analyser node.
 * @return {!AnalyserNode} A new analyser node.
 */
audioCat.audio.AudioContextManager.prototype.createAnalyserNode = function(
    opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createAnalyser();
};

/**
 * Sets the FFT size of an analyser node, which effectively sets the buffer
 * length to use as half of this value.
 * @param {!AnalyserNode} analyserNode The analyser node to set the FFT size
 *     for.
 * @param {number} fftSize The FFT size to set.
 */
audioCat.audio.AudioContextManager.prototype.setFftSize = function(
    analyserNode,
    fftSize) {
  analyserNode.fftSize = fftSize;
};

/**
 * Sets the FFT size of an analyser node, which effectively sets the buffer
 * length to use as half of this value.
 * @param {!AnalyserNode} analyserNode The analyser node to set the FFT size
 *     for.
 * @param {number} smoothingConstant Where 0 is unsmoothened. 1 is smoothened.
 */
audioCat.audio.AudioContextManager.prototype.setSmoothingConstant = function(
    analyserNode,
    smoothingConstant) {
  analyserNode.smoothingTimeConstant = smoothingConstant;
};

/**
 * Gets the frequency buffer length of an analyser node.
 * @param {!AnalyserNode} analyserNode The analyser node to get the frequency
 *     buffer length of.
 * @return {number} The frequency buffer length of the analyser node.
 */
audioCat.audio.AudioContextManager.prototype.getFrequencyBinCount = function(
    analyserNode) {
  return analyserNode.frequencyBinCount;
};

/**
 * Takes a Uint8Array and copies frequency byte data from an analyser node into
 * the buffer. Assumes that the buffer has the right size - specifically the
 * size should be the frequency bin count of the analyser node.
 * @param {!AnalyserNode} analyserNode The analyser node to get the frequency
 *     data from.
 * @param {!Uint8Array} buffer The buffer to copy frequency data into.
 */
audioCat.audio.AudioContextManager.prototype.getByteFrequencyData = function(
    analyserNode, buffer) {
  analyserNode.getByteFrequencyData(buffer);
};

/**
 * Takes a Uint8Array and copies time domain byte data from an analyser node
 * into the buffer. Assumes that the buffer has the right size - specifically
 * the size should be the frequency bin count of the analyser node.
 * @param {!AnalyserNode} analyserNode The analyser node to get the frequency
 *     data from.
 * @param {!Uint8Array} buffer The buffer to copy frequency data into.
 */
audioCat.audio.AudioContextManager.prototype.getByteTimeDomainData = function(
    analyserNode, buffer) {
  analyserNode.getByteTimeDomainData(buffer);
};

/**
 * Creates a gain node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a gain node.
 * @return {!GainNode} A new gain node.
 */
audioCat.audio.AudioContextManager.prototype.createGainNode =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createGain();
};

/**
 * Sets the gain for a gain node.
 * @param {!GainNode} gainNode The gain node to set the volume for.
 * @param {number} gainValue The value of the gain to set.
 */
audioCat.audio.AudioContextManager.prototype.setGain = function(
    gainNode, gainValue) {
  gainNode.gain.value = gainValue;
};

/**
 * Gets the gain of a gain node.
 * @param {!GainNode} gainNode The gain node to get the gain of.
 * @return {number} The gain of the node.
 */
audioCat.audio.AudioContextManager.prototype.getGain = function(gainNode) {
  return gainNode.gain.value;
};

/**
 * Creates a pan node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a node.
 * @return {!AudioPannerNode} A new panner node.
 */
audioCat.audio.AudioContextManager.prototype.createPanNode =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createPanner();
};

/**
 * Creates a delay node.
 * @param {number} maxDelay The max delay allowed by the resulting delay node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a node.
 * @return {!DelayNode} A new delay node.
 */
audioCat.audio.AudioContextManager.prototype.createDelayNode =
    function(maxDelay, opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createDelay(maxDelay);
};

/**
 * Creates a biquad filter node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a node.
 * @return {!BiquadFilterNode}
 */
audioCat.audio.AudioContextManager.prototype.createBiquadFilter =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createBiquadFilter();
};

/**
 * Sets the frequency of a biquad filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {number} frequency The frequency to set to.
 */
audioCat.audio.AudioContextManager.prototype.setFilterFrequency =
    function(filterNode, frequency) {
  filterNode.frequency.value = frequency;
};

/**
 * Gets the frequency of a filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @return {number} The frequency of a filter node.
 */
audioCat.audio.AudioContextManager.prototype.getFilterFrequency = function(
    filterNode) {
  return filterNode.frequency.value;
};

/**
 * Copies the magnitude and phase responses to some filter node of several
 * frequency values into provided arrays.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {!Float32Array} frequencies An array of frequencies to get values for.
 * @param {!Float32Array} magResponse The corresponding magnitude responses.
 * @param {!Float32Array} phaseResponse The corresponding phase responses.
 */
audioCat.audio.AudioContextManager.prototype.getFrequencyResponse = function(
    filterNode, frequencies, magResponse, phaseResponse) {
  filterNode.getFrequencyResponse(
      frequencies, magResponse, phaseResponse);
};

/**
 * Sets the detune of a biquad filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {number} value The detune to set to.
 */
audioCat.audio.AudioContextManager.prototype.setFilterDetune =
    function(filterNode, value) {
  filterNode.detune.value = value;
};

/**
 * Gets the detune of a filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @return {number} The detune of a filter node.
 */
audioCat.audio.AudioContextManager.prototype.getFilterDetune = function(
    filterNode) {
  return filterNode.detune.value;
};

/**
 * Sets the gain of a biquad filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {number} value The gain to set to.
 */
audioCat.audio.AudioContextManager.prototype.setFilterGain =
    function(filterNode, value) {
  filterNode.gain.value = value;
};

/**
 * Gets the gain of a filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @return {number} The gain of a filter node.
 */
audioCat.audio.AudioContextManager.prototype.getFilterGain = function(
    filterNode) {
  return filterNode.gain.value;
};

/**
 * Sets the Q (quality) value of a biquad filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {number} value The Q value to set to.
 */
audioCat.audio.AudioContextManager.prototype.setFilterQ =
    function(filterNode, value) {
  filterNode.Q.value = value;
};

/**
 * Gets the Q value of a filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @return {number} The Q of a filter node.
 */
audioCat.audio.AudioContextManager.prototype.getFilterQ = function(filterNode) {
  return filterNode.Q.value;
};

/**
 * Sets the type of a biquad filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @param {string} value The type to set to.
 */
audioCat.audio.AudioContextManager.prototype.setFilterType =
    function(filterNode, value) {
  filterNode.type = value;
};

/**
 * Gets the type of a filter node.
 * @param {!BiquadFilterNode} filterNode The node.
 * @return {string} The type of a filter node.
 */
audioCat.audio.AudioContextManager.prototype.getFilterType =
    function(filterNode) {
  return filterNode.type;
};

/**
 * Creates a dynamic compressor.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a script processor node.
 * @return {!DynamicsCompressorNode}
 */
audioCat.audio.AudioContextManager.prototype.createDynamicCompressorNode =
    function(opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createDynamicsCompressor();
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getKnee =
    function(node) {
  return node.knee.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setKnee =
    function(node, value) {
  node.knee.value = value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getThreshold =
    function(node) {
  return node.threshold.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setThreshold =
    function(node, value) {
  node.threshold.value = value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getRatio =
    function(node) {
  return node.ratio.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setRatio =
    function(node, value) {
  node.ratio.value = value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getReduction =
    function(node) {
  return node.reduction.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setReduction =
    function(node, value) {
  node.reduction.value = value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getRelease =
    function(node) {
  return node.release.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setRelease =
    function(node, value) {
  node.release.value = value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @return {number}
 */
audioCat.audio.AudioContextManager.prototype.getAttack =
    function(node) {
  return node.attack.value;
};

/**
 * @param {!DynamicsCompressorNode} node The node.
 * @param {number} value
 */
audioCat.audio.AudioContextManager.prototype.setAttack =
    function(node, value) {
  node.attack.value = value;
};

/**
 * Creates a channel splitter node.
 * @param {number} numberOfChannels The number of channels.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a script processor node.
 * @return {!ChannelSplitterNode} A newly created node.
 */
audioCat.audio.AudioContextManager.prototype.createChannelSplitterNode =
    function(numberOfChannels, opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createChannelSplitter(
      numberOfChannels);
};

/**
 * Gets the number of input channels for the node.
 * @param {!AudioNode} node The node.
 * @return {number} The number of output channels.
 */
audioCat.audio.AudioContextManager.prototype.getNumberOfInputChannels =
    function(node) {
  return node.numberOfInputs;
};

/**
 * Gets the number of output channels for the node.
 * @param {!AudioNode} node The node.
 * @return {number} The number of output channels.
 */
audioCat.audio.AudioContextManager.prototype.getNumberOfOutputChannels =
    function(node) {
  return node.numberOfOutputs;
};

/**
 * Connects a certain output channel of a splitter node to a node.
 * @param {!ChannelSplitterNode} channelSplitterNode The splitter node.
 * @param {!AudioNode} nextNode The node to connect to.
 * @param {number} channelIndex The 0-based index of the channel we should
 *     connect.
 */
audioCat.audio.AudioContextManager.prototype.connectSplitterChannel =
    function(channelSplitterNode, nextNode, channelIndex) {
  channelSplitterNode.connect(nextNode, channelIndex);
};

/**
 * Disconnects a certain output channel of a splitter node.
 * @param {!ChannelSplitterNode} channelSplitterNode The splitter node.
 * @param {number} channelIndex The 0-based index of the channel we should
 *     connect.
 */
audioCat.audio.AudioContextManager.prototype.disconnectSplitterChannel =
    function(channelSplitterNode, channelIndex) {
  channelSplitterNode.disconnect(channelIndex);
};

/**
 * Creates a convolver node.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a script processor node.
 * @return {!ConvolverNode} A newly created node.
 */
audioCat.audio.AudioContextManager.prototype.createConvolverNode = function(
    opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).createConvolver();
};

/**
 * Sets the impulse response of a convolver node.
 * @param {!ConvolverNode} convolverNode The convolver node to set the impulse
 *     response for.
 * @param {AudioBuffer} impulseResponse Null if we are unsetting the response.
 */
audioCat.audio.AudioContextManager.prototype.setImpulseResponse = function(
    convolverNode, impulseResponse) {
  convolverNode.buffer = impulseResponse;
};

/**
 * Gets the impulse response of a convolver node.
 * @param {!ConvolverNode} convolverNode The convolver node to get the impulse
 *     response for. Or null if none set.
 * @return {AudioBuffer} The impulse response of the convolver or null if none.
 */
audioCat.audio.AudioContextManager.prototype.getImpulseResponse = function(
    convolverNode) {
  return convolverNode.buffer || null;
};

/**
 * Creates an (normal context based) audio buffer from an ArrayBuffer.
 * @param {!ArrayBuffer} arrayBuffer The array buffer representing audio data.
 * @param {function(AudioBuffer)} callback The callback called once the audio
 *     is done decoding.
 * @param {function(Error)} errorCallback The callback called if an error
 *     prevents rendering.
 */
audioCat.audio.AudioContextManager.prototype.createAudioBuffer =
    function(arrayBuffer, callback, errorCallback) {
  this.audioContext_.decodeAudioData(arrayBuffer, callback, errorCallback);
};

/**
 * Copies array data into an audio buffer.
 * @param {!AudioBuffer} audioBuffer Audio buffer to copy into.
 * @param {!Float32Array} data The data to copy over.
 * @param {number} channelIndex The index of the channel to copy into.
 */
audioCat.audio.AudioContextManager.prototype.copyChannelToAudioBuffer =
    function(audioBuffer, data, channelIndex) {
  this.copyToChannelFunction_.call(audioBuffer, data, channelIndex);
};

/**
 * Creates an empty audio buffer given the specs.
 * @param {number} numberOfChannels The number of channels.
 * @param {number} lengthInSamples The length in samples.
 * @param {number} sampleRate The sample rate.
 * @return {!AudioBuffer} The new audio buffer.
 */
audioCat.audio.AudioContextManager.prototype.createEmptyAudioBuffer =
    function(numberOfChannels, lengthInSamples, sampleRate) {
  return this.audioContext_.createBuffer(
      numberOfChannels, lengthInSamples, sampleRate);
};

/**
 * Creates an offline audio context.
 * @param {number} numberOfChannels The number of channels.
 * @param {number} lengthInSamples The length in samples.
 * @param {number} sampleRate The sample rate.
 * @return {!OfflineAudioContext}
 */
audioCat.audio.AudioContextManager.prototype.createOfflineAudioContext =
    function(numberOfChannels, lengthInSamples, sampleRate) {
  var constructor = window.OfflineAudioContext ||
      window.webkitOfflineAudioContext;
  return new constructor(numberOfChannels, lengthInSamples, sampleRate);
};

/**
 * Gets the sample rate of an audio context. If not provided, defaults to the
 * live audio context for the project, which may be often preferred.
 * @param {NonNullOfflineAudioContext=} opt_offlineContext If provided, uses the
 *     offline context to create a source node.
 * @return {number} The sample rate of the project.
 */
audioCat.audio.AudioContextManager.prototype.getSampleRate = function(
    opt_offlineContext) {
  return (opt_offlineContext || this.audioContext_).sampleRate;
};
