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
goog.provide('audioCat.audio.render.ExportFunction');

goog.require('audioCat.audio.render.ExportFormat');


/**
 * A static mapping between export format and function. The function takes as
 * arguments a list of channels, a sample rate, the size of each sample in
 * bytes, the main page URL, and whether the web worker should transfer the
 * generated array buffer for use by say Android java.
 *
 * Increment the argument count in export manager when adding a new argument.
 *
 * @type {!Object.<audioCat.audio.render.ExportFormat,
 *     function(!Array.<!ArrayBuffer>, number, number, string, boolean)>}
 */
audioCat.audio.render.ExportFunction = {};


(function() {
  // This is the method for exporting MP3 files.
  audioCat.audio.render.ExportFunction[
      audioCat.audio.render.ExportFormat.MP3] = function(
          channelData, sampleRate, outputSingleSampleByteSize, pageUrl) {
    // Begin mp3 export with lame.min.js (faster version).
    if (channelData.length != 1 && channelData.length != 2) {
      this.postMessage([3,
          'MP3 export does not support ' + channelData.length + ' channels.']);
      return;
    }

    // Try to find where the path begins.
    var baseUrlMatches = pageUrl.match(/^https?:\/\/[^\/]+\//);
    var baseUrl = baseUrlMatches && baseUrlMatches.length > 0 ?
        baseUrlMatches[0] : '';
    importScripts(baseUrl + 'js/lame.js');

    var sampleLength = channelData[0].length;
    var lib = new lamejs();
    var quality = 128; // 128 kbps
    var mp3encoder = /** @type {!lamejs.Mp3Encoder} */ (new lib['Mp3Encoder'](
        channelData.length, sampleRate, quality));
    var mp3Data = [];

    var sampleBlockSize = 1152; // Should be multiple of 576 to make fast.

    var baseProgress = 0.1;
    this.postMessage([2, baseProgress]);


    var typedArrayConstructor;

    // We are converting from Float32Array, so we must clamp values.
    var clampMin;
    var clampMax;
    // todo(chizeng): figure out if we are to use unsigned here instead.
    switch (outputSingleSampleByteSize) {
      case 1:
        clampMin = -127;
        clampMax = 128;
        typedArrayConstructor = Int8Array;
        break;
      case 2:
        clampMin = -32767;
        clampMax = 32768;
        typedArrayConstructor = Int16Array;
        break;
      case 4:
        clampMin = -2147483647;
        clampMax = 2147483648;
        typedArrayConstructor = Int32Array;
        break;
    }
    if (!typedArrayConstructor) {
      this.postMessage([3, 'Bit depth undetected for mp3 export.']);
      return;
    }
    var typedChannelData = [];
    var positiveClampMin = 0 - clampMin;
    for (var i = 0; i < channelData.length; ++i) {
      var newTypedArray = new typedArrayConstructor(channelData[i].length);
      var singleChannelData = channelData[i];
      for (var j = 0; j < sampleLength; ++j) {
        // Convert to within scale [minClamp, maxClamp].
        var scaledValue = singleChannelData[j] *
            (singleChannelData[j] < 0 ? positiveClampMin : clampMax);
        // Clamp.
        newTypedArray[j] = Math.max(clampMin, Math.min(clampMax, scaledValue));
      }
      typedChannelData.push(newTypedArray);
    }
    var midSectionProgressSum = 0.85;
    for (var i = 0; i < sampleLength; i += sampleBlockSize) {
      var subarraysToProcess = [];
      for (var j = 0; j < typedChannelData.length; ++j) {
        subarraysToProcess.push(
            typedChannelData[j].subarray(i, i + sampleBlockSize));
      }
      var mp3buf =
          mp3encoder.encodeBuffer.apply(mp3encoder, subarraysToProcess);
      if (mp3buf && mp3buf.length > 0) {
        mp3Data.push(mp3buf.buffer);
      }
      this.postMessage([2,
          baseProgress + midSectionProgressSum * i / sampleLength]);
    }

    var lastBit = mp3encoder.flush();
    if (lastBit && lastBit.length > 0) {
      mp3Data.push(lastBit.buffer);
    }
    var fileBlob = new Blob(mp3Data, {type: 'audio/mpeg'});
    return [
        1, // 1 notes that this message communicates how exporting is done.
        (this.URL || this.webkitURL).createObjectURL(fileBlob),
        fileBlob.size
      ];

    // Begin mp3 export with libmp3lame.js (slow version).

    // var base = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
    // importScripts(base + 'js/la.js');

    // var bufferL = channelData[0];
    // var bufferR = channelData[1];

    // var mp3codec = Lame.init();
    // Lame.set_mode(mp3codec, Lame.JOINT_STEREO);
    // Lame.set_num_channels(mp3codec, 2);
    // Lame.set_out_samplerate(mp3codec, sampleRate);

    // // TODO(chizeng): Let the user vary the bitrate.
    // Lame.set_bitrate(mp3codec, 128);
    // Lame.init_params(mp3codec);

    // // Create the MP3 a little bit at a time.
    // var encodedParts = [];
    // var chunkSize = 5000; // Size of each chunk in bytes.
    // var samplesDone = chunkSize;
    // var sampleLength = bufferL.length;

    // while (samplesDone < sampleLength) {
    //   var beginSample = samplesDone - chunkSize;
    //   var endSample = samplesDone;
    //   var more = Lame.encode_buffer_ieee_float(
    //       mp3codec,
    //       bufferL.subarray(beginSample, endSample),
    //       bufferR.subarray(beginSample, endSample)
    //     );
    //   encodedParts.push(more.data);
    //   this.postMessage([2, samplesDone / sampleLength]);
    //   samplesDone += chunkSize;
    // }

    // if (samplesDone > sampleLength) {
    //   // Some last portions are left.
    //   var beginSample = samplesDone - chunkSize;
    //   var endSample = sampleLength;
    //   var more = Lame.encode_buffer_ieee_float(
    //       mp3codec,
    //       bufferL.subarray(beginSample, endSample),
    //       bufferR.subarray(beginSample, endSample)
    //     );
    //   encodedParts.push(more.data);
    // }

    // more = Lame.encode_flush(mp3codec);
    // encodedParts.push(more.data);
    // Lame.close(mp3codec);

    // // Consider most of the work done.
    // var fileBlob = new Blob(encodedParts, {type: 'audio/mpeg'});
    // this.postMessage([2, 1]);

    // var fileByteSize = fileBlob.size;
    // return [
    //     1, // 1 notes that this message communicates how exporting is done.
    //     (this.URL || this.webkitURL).createObjectURL(fileBlob),
    //     fileByteSize
    //   ];
  };

  // This is the method for exporting WAV files.
  audioCat.audio.render.ExportFunction[audioCat.audio.render.ExportFormat.WAV] =
      function(
          channelData,
          sampleRate,
          outputSingleSampleByteSize,
          pageUrl,
          transferData) {
    var writeString = function(dataView, offsetIntoData, someStringToWrite) {
      for (var i = 0; i < someStringToWrite.length; i++) {
        dataView.setUint8(
            offsetIntoData + i, someStringToWrite.charCodeAt(i));
      }
    };

    // Compute basic stats.
    var numberOfChannels = channelData.length;
    var lengthOfOneChannel = channelData[0].length;
    var totalLength = numberOfChannels * lengthOfOneChannel;

    // The total amount of work units to be done for this worker.
    // We have 2 loops through all samples. Then, we have to make the blob.
    var totalWorkToDo = totalLength * 2.1;
    var totalWorkDone = 0;
    var reportWorkEveryThisManySamples = 20000;

    // Interleave sample data into a single array.
    var interleavedArray;
    try {
      interleavedArray = new Float32Array(totalLength);
    } catch (e) {
      // We lacked enough memory to create this. Tell the user and quit export.
      this.postMessage([3, 'Not enough memory to create the file. ' +
          'Try shortening your overall audio length.']);
      return;
    }

    for (var channelIndex = 0; channelIndex < numberOfChannels;
        ++channelIndex) {
      var currentChannelData = channelData[channelIndex];
      var overallIndex = channelIndex;
      for (var oneChannelIndex = 0; oneChannelIndex < lengthOfOneChannel;
          ++oneChannelIndex) {
        interleavedArray[overallIndex] = currentChannelData[oneChannelIndex];
        overallIndex += numberOfChannels;

        // Report work done.
        totalWorkDone += 1;
        if (totalWorkDone % reportWorkEveryThisManySamples == 0) {
          this.postMessage([2, totalWorkDone / totalWorkToDo]);
        }
      }
    }

    var waveFileHeaderByteSize = 44;
    var sampleDataChunkByteSize = outputSingleSampleByteSize * totalLength;
    var totalFileSize = sampleDataChunkByteSize + waveFileHeaderByteSize;

    var finalArrayBuffer = new ArrayBuffer(totalFileSize);
    var dataView = new DataView(finalArrayBuffer);

    // RIFF identifier.
    writeString(dataView, 0, 'RIFF');

    // File length.
    var fileByteSize = 32 + sampleDataChunkByteSize;
    dataView.setUint32(4, fileByteSize, true);

    // Type of RIFF. For our purposes, this always equals "WAVE".
    writeString(dataView, 8, 'WAVE');

    // Format chunk identifier.
    writeString(dataView, 12, 'fmt ');

    // Length of format chunk.
    dataView.setUint32(16, 8 * outputSingleSampleByteSize, true);

    // Sample format (raw).
    dataView.setUint16(20, 1, true);

    // Number of channels.
    dataView.setUint16(22, numberOfChannels, true);

    // Sample rate.
    dataView.setUint32(24, sampleRate, true);

    // Byte rate (sample rate * block align).
    var blockAlign = numberOfChannels * outputSingleSampleByteSize;
    dataView.setUint32(28, blockAlign * sampleRate, true);

    // Block align (channel count * bytes per sample).
    dataView.setUint16(32, blockAlign, true);

    // Bits per sample.
    dataView.setUint16(34, 8 * outputSingleSampleByteSize, true);

    // Data chunk identifier. Marks beginning of data.
    writeString(dataView, 36, 'data');

    // Data chunk length in bytes.
    dataView.setUint32(40, sampleDataChunkByteSize, true);

    // Convert the output to the given bit depth.
    var byteOffset = waveFileHeaderByteSize;

    // The sample byte size must be a power of 2: one of 1, 2, or 4.
    var sampleBitSetFunction = dataView.setInt16;
    switch (outputSingleSampleByteSize) {
      case 1:
        sampleBitSetFunction = dataView.setInt8;
        break;
      case 2:
        sampleBitSetFunction = dataView.setInt16;
        break;
      case 4:
        sampleBitSetFunction = dataView.setInt32;
        break;
    }

    var interleavedSampleLength = interleavedArray.length;
    for (var i = 0; i < interleavedSampleLength;
        i++, byteOffset += outputSingleSampleByteSize) {
      var sampleValue = interleavedArray[i];
      // Clamp sample to [-1, 1].
      if (sampleValue < -1) {
        sampleValue = -1;
      } else if (sampleValue > 1) {
        sampleValue = 1;
      }

      // Deal with endianness.
      if (sampleValue < 0) {
        sampleValue *= 0x8000;
      } else {
        sampleValue *= 0x7FFF;
      }
      sampleBitSetFunction.call(dataView, byteOffset, sampleValue, true);

      // Report work done.
      totalWorkDone += 1;
      if (totalWorkDone % reportWorkEveryThisManySamples == 0) {
        this.postMessage([2, totalWorkDone / totalWorkToDo]);
      }
    }

    // Consider most of the work done.
    this.postMessage([2, 1]);

    if (transferData) {
      // We are likely in an Android web view. Post back the data so that
      self.postMessage([
          1, // 1 notes that this message communicates how exporting is done.
          '', // We transfer the data, so we do not need to create a URL.
          fileByteSize, // Byte size of file.
          finalArrayBuffer // The array buffer containing all the data.
        ], [
          finalArrayBuffer // Tell browser to transfer, not clone this data.
        ]);

      // Do not directly return anything meaningful to prevent the worker from
      // posting twice. See the web worker manager.
    } else {
      // Post back an object URL.
      var fileBlob = new Blob([finalArrayBuffer], {type: 'audio/wav'});
      return [
          1, // 1 notes that this message communicates how exporting is done.
          (this.URL || this.webkitURL).createObjectURL(fileBlob),
          fileByteSize,
          null
        ];
    }
  };
})();
