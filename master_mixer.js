// Copyright 2012 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Master mixer for all doodle Web Audio sources.
 */
goog.provide('doodle.moog.MasterMixer');

goog.require('doodle.moog.MasterMixerInterface');



/**
 * Master mixer for the multiple virtual synthesizers that may play back
 * simultaneously via the Sequencer.
 * @param {!AudioContext} audioContext Audio context in which this mixer will
 *     operate.
 * @param {!Array.<!doodle.moog.SynthesizerInterface>} synthesizers The
 *     synthesizers that feed into this mixer.
 * @param {!doodle.moog.WideBandPassFilter} wideBandPassFilter The wide band
 *     pass filter used within this mixer.
 * @constructor
 * @implements {doodle.moog.MasterMixerInterface}
 */
doodle.moog.MasterMixer = function(
    audioContext, synthesizers, wideBandPassFilter) {
  /**
   * The audio context in which this mixer operates.
   * @type {!AudioContext}
   * @private
   */
  this.audioContext_ = audioContext;

  /**
   * The synthesizers this mixer mixes.
   * @type {!Array.<!doodle.moog.Synthesizer>}
   * @private
   */
  this.synthesizers_ = synthesizers;

  /**
   * Filter used to cut out really low/high frequencies.
   * @type {!doodle.moog.WideBandPassFilter}
   * @private
   */
  this.wideBandPassFilter_ = wideBandPassFilter;

  for (var i = 0; i < synthesizers.length; i++) {
    synthesizers[i].connect(wideBandPassFilter.getSourceNode());
  }
};


/** @inheritDoc */
doodle.moog.MasterMixer.prototype.turnOn = function() {
  window.setTimeout(goog.bind(function() {
    // NOTE: The audio pipeline is connected in a setTimeout to avoid a Chrome
    // bug in which the audio will occasionally fail to initialize/play.
    this.wideBandPassFilter_.connect(this.audioContext_.destination);
  }, this), 0);
};


/** @inheritDoc */
doodle.moog.MasterMixer.prototype.turnOff = function() {
  this.wideBandPassFilter_.disconnect();
};
