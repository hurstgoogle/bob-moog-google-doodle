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
 * @fileoverview Provides a wide band pass filter to protect headphones and
 * speakers from really low and high frequencies.
 */
goog.provide('doodle.moog.WideBandPassFilter');

goog.require('doodle.moog.CompoundAudioNode');



/**
 * A wide band pass filter designed to filter out low and high frequencies that
 * might damage poorly made speakers connected to poorly made sound cards.
 * @param {!AudioContext} audioContext Audio context to which this oscillator
 *     will be bound.
 * @param {number} lowCutoffFrequency The cutoff frequency below which sound is
 *     attenuated.
 * @param {number} highCutoffFrequency The cutoff frequency above which sound is
 *     attenuated.
 * @constructor
 * @implements {doodle.moog.CompoundAudioNode}
 */
doodle.moog.WideBandPassFilter = function(
    audioContext, lowCutoffFrequency, highCutoffFrequency) {
  /**
   * The low pass filter Web Audio node.
   * @type {!BiquadFilterNode}
   * @private
   */
  this.lowPassFilterNode_ = audioContext.createBiquadFilter();
  this.lowPassFilterNode_.type =
      doodle.moog.WideBandPassFilter.LOW_PASS_FILTER_TYPE_ID_;
  this.lowPassFilterNode_.frequency.value = highCutoffFrequency;

  /**
   * The high pass filter Web Audio node.
   * @type {!BiquadFilterNode}
   * @private
   */
  this.highPassFilterNode_ = audioContext.createBiquadFilter();
  this.highPassFilterNode_.type =
      doodle.moog.WideBandPassFilter.HIGH_PASS_FILTER_TYPE_ID_;
  this.highPassFilterNode_.frequency.value = lowCutoffFrequency;

  this.lowPassFilterNode_.connect(this.highPassFilterNode_);
};


/**
 * Biquad Filter type ID for a low pass filter (from the Web Audio spec).
 * @type {number}
 * @const
 * @private
 */
doodle.moog.WideBandPassFilter.LOW_PASS_FILTER_TYPE_ID_ = 0;


/**
 * Biquad Filter type ID for a low pass filter (from the Web Audio spec).
 * @type {number}
 * @const
 * @private
 */
doodle.moog.WideBandPassFilter.HIGH_PASS_FILTER_TYPE_ID_ = 1;


/** @inheritDoc */
doodle.moog.WideBandPassFilter.prototype.getSourceNode = function() {
  return this.lowPassFilterNode_;
};


/** @inheritDoc */
doodle.moog.WideBandPassFilter.prototype.connect = function(destination) {
  this.highPassFilterNode_.connect(destination);
};


/** @inheritDoc */
doodle.moog.WideBandPassFilter.prototype.disconnect = function() {
  this.highPassFilterNode_.disconnect();
};
