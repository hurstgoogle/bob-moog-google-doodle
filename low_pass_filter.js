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
 * @fileoverview Moog-like low pass audio filter.
 */
goog.provide('doodle.moog.LowPassFilter');

goog.require('doodle.moog.CompoundAudioNode');



/**
 * A dynamic low pass filter emulator.
 * @param {!AudioContext} audioContext Audio context to which this oscillator
 *     will be bound.
 * @param {number} cutoffFrequency The cutoff frequency above which the
 *     frequencies are attenuated.
 * @param {number} contour Amount of contour to apply to the filter envelope.
 * @param {number} attackTime Initial attack time in seconds.
 * @param {number} decayTime Initial decay time in seconds.
 * @param {number} sustainLevel Initial sustain level [0..1].
 * @constructor
 * @implements {doodle.moog.CompoundAudioNode}
 */
doodle.moog.LowPassFilter = function(
    audioContext, cutoffFrequency, contour, attackTime, decayTime,
    sustainLevel) {
  /**
   * Audio context in which this filter operates.
   * @type {!AudioContext}
   * @private
   */
  this.audioContext_ = audioContext;

  /**
   * The low pass filter Web Audio node.
   * @type {!BiquadFilterNode}
   * @private
   */
  this.lowPassFilterNode_ = audioContext.createBiquadFilter();
  this.lowPassFilterNode_.type =
      doodle.moog.LowPassFilter.LOW_PASS_FILTER_TYPE_ID_;

  /**
   * Frequency above which sound should be progressively attenuated.
   * @type {number}
   * @private
   */
  this.cutoffFrequency_ = cutoffFrequency;

  /**
   * The amount of 'contour' to add to the low pass filter ADS (attack, decay,
   * sustain) envelope.  Contour is essentially a variable cutoff frequency
   * coefficient. See doodle.moog.EnvelopeGenerator for an explanation of how
   * ADS envelopes work.
   * @type {number}
   * @private
   */
  this.contour_ = contour;

  /**
   * The duration of the attack phase in seconds.
   * @type {number}
   * @private
   */
  this.attackTime_ = attackTime;

  /**
   * The duration of the decay phase in seconds.
   * @type {number}
   * @private
   */
  this.decayTime_ = decayTime;

  /**
   * The sustain frequency coefficient.
   * @type {number}
   * @private
   */
  this.sustainLevel_ = sustainLevel;

  this.resetContourEnvelope_();
};


/**
 * Biquad Filter type ID for a low pass filter (from the Web Audio spec).
 * @type {number}
 * @const
 * @private
 */
doodle.moog.LowPassFilter.LOW_PASS_FILTER_TYPE_ID_ = 0;


/**
 * Initiates the attack phase of the contour envelope (e.g., when a key is
 * pressed).
 */
doodle.moog.LowPassFilter.prototype.startAttack = function() {
  var now = this.audioContext_.currentTime;

  this.lowPassFilterNode_.frequency.cancelScheduledValues(now);

  this.lowPassFilterNode_.frequency.value = this.cutoffFrequency_;
  this.lowPassFilterNode_.frequency.setValueAtTime(this.cutoffFrequency_, now);

  var contourFrequency = this.contour_ * this.cutoffFrequency_;

  this.lowPassFilterNode_.frequency.exponentialRampToValueAtTime(
      contourFrequency, now + this.attackTime_);
  this.lowPassFilterNode_.frequency.exponentialRampToValueAtTime(
      this.cutoffFrequency_ +
      this.sustainLevel_ * (contourFrequency - this.cutoffFrequency_),
      now + this.attackTime_ + this.decayTime_);
};


/**
 * Sets the filter cutoff frequency.
 * @param {number} cutoffFrequency The cutoff frequency above which the
 *     frequencies are attenuated.
 */
doodle.moog.LowPassFilter.prototype.setCutoffFrequency = function(
    cutoffFrequency) {
  this.cutoffFrequency_ = cutoffFrequency;
  this.resetContourEnvelope_();
};


/**
 * Sets the filter envelope contour.
 * @param {number} contour Amount of contour to apply to the filter envelope.
 */
doodle.moog.LowPassFilter.prototype.setContour = function(contour) {
  this.contour_ = contour;
  this.resetContourEnvelope_();
};


/**
 * Sets attack phase duration.
 * @param {number} time Duration of the attack phase in seconds.
 */
doodle.moog.LowPassFilter.prototype.setContourAttackTime = function(time) {
  this.attackTime_ = time;
  this.resetContourEnvelope_();
};


/**
 * Sets decay phase duration.
 * @param {number} time Duration of the decay phase in seconds.
 */
doodle.moog.LowPassFilter.prototype.setContourDecayTime = function(time) {
  this.decayTime_ = time;
  this.resetContourEnvelope_();
};


/**
 * Sets the sustain level.
 * @param {number} level The sustain level, a number in the range [0, 1].
 */
doodle.moog.LowPassFilter.prototype.setContourSustainLevel = function(level) {
  this.sustainLevel_ = level;
  this.resetContourEnvelope_();
};


/**
 * Resets the contour envelope AudioParam using current LowPassFilter state.
 * @private
 */
doodle.moog.LowPassFilter.prototype.resetContourEnvelope_ = function() {
  this.lowPassFilterNode_.frequency.cancelScheduledValues(0);
  this.lowPassFilterNode_.frequency.value = this.cutoffFrequency_;
};


/** @inheritDoc */
doodle.moog.LowPassFilter.prototype.getSourceNode = function() {
  return this.lowPassFilterNode_;
};


/** @inheritDoc */
doodle.moog.LowPassFilter.prototype.connect = function(destination) {
  this.lowPassFilterNode_.connect(destination);
};


/** @inheritDoc */
doodle.moog.LowPassFilter.prototype.disconnect = function() {
  this.lowPassFilterNode_.disconnect();
};
