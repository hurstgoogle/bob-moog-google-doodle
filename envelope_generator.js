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
 * @fileoverview Attack, Decay, Sustain, Decay (ADSD) envelope generator.
 */
goog.provide('doodle.moog.EnvelopeGenerator');



/**
 * An ADSD envelope generator, used to control volume of a single synth note.
 *
 * See the Phase_ enum below for a description of how ADSD envelopes work.
 *
 * @param {number} sampleInterval How many seconds pass with each sample.
 * @param {number} attackTime Initial attack time in seconds.
 * @param {number} decayTime Initial decay time in seconds.
 * @param {number} sustainLevel Initial sustain level [0..1].
 * @constructor
 */
doodle.moog.EnvelopeGenerator = function(
    sampleInterval, attackTime, decayTime, sustainLevel) {
  /**
   * How many seconds pass with each sample.
   * @type {number}
   * @private
   * @const
   */
  this.SAMPLE_INTERVAL_ = sampleInterval;

  /**
   * The amount by which the tone associated with this envelope should be
   * scaled.  A number in the range [0, 1].
   * @type {number}
   * @private
   */
  this.amplitudeCoefficient_ = 0;

  /**
   * The current phase of the envelope.
   * @type {!doodle.moog.EnvelopeGenerator.Phase_}
   * @private
   */
  this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.INACTIVE;

  /**
   * The duration of the attack phase in seconds.
   * @type {number}
   * @private
   */
  this.attackTime_ = attackTime;

  /**
   * How much the amplitude should be increased for each sample in the attack
   * phase.
   *
   * NOTE: This variable and other 'step' variables can be computed from other
   * EnvelopeGenerator state.  We explicitly store these values though since
   * they are precisely the data needed in getNextAmplitudeCoefficient which is
   * typically executed in a sound buffer filling loop and therefore performance
   * critical.
   * @type {number}
   * @private
   */
  this.attackStep_;

  /**
   * The duration of the decay phase in seconds.
   * @type {number}
   * @private
   */
  this.decayTime_ = decayTime;

  /**
   * How much the amplitude should be decreased for each sample in the decay
   * phase.
   * @type {number}
   * @private
   */
  this.decayStep_;

  /**
   * The sustain amplitude coefficient.
   * @type {number}
   * @private
   */
  this.sustainLevel_ = sustainLevel;

  /**
   * How much the amplitude should be decreased for each sample in the release
   * phase.
   * @type {number}
   * @private
   */
  this.releaseStep_;

  this.recomputePhaseSteps_();
};


/**
 * The different phases of an ADSD envelope.  When playing a key on a synth,
 * these phases are always executed in the order they're defined in this enum.
 *
 * @enum {number}
 * @private
 */
doodle.moog.EnvelopeGenerator.Phase_ = {
  // A linear ramp up from no volume (just before a key is struck) to maximum
  // volume.
  ATTACK: 0,
  // A linear ramp down from maximum volume to the sustain volume level.
  DECAY: 1,
  // Once the attack and decay phases have completed, the volume at which the
  // note is held until the key is released.
  SUSTAIN: 2,
  // A linear ramp down from the sustain volume to no volume after a key is
  // released.  Moog instruments uniquely reuse the decay time parameter for the
  // release time (hence the "ADSD" acronym instead of "ADSR").
  RELEASE: 3,
  // Meta state indicating that the envelope is not currently active.
  INACTIVE: 4
};


/**
 * Initiates the attack phase of the envelope (e.g., when a key is pressed).
 */
doodle.moog.EnvelopeGenerator.prototype.startAttack = function() {
  this.recomputePhaseSteps_();
  this.amplitudeCoefficient_ = 0;
  this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.ATTACK;
};


/**
 * Initiates the release phase of the envelope (e.g., when a key is lifted).
 */
doodle.moog.EnvelopeGenerator.prototype.startRelease = function() {
  if (this.phase_ == doodle.moog.EnvelopeGenerator.Phase_.RELEASE) {
    return;
  } else {
    // Compute release step based on the current amplitudeCoefficient_.
    if (this.decayTime_ <= 0) {
      this.releaseStep_ = 1;
    } else {
      this.releaseStep_ =
          this.amplitudeCoefficient_ * this.SAMPLE_INTERVAL_ / this.decayTime_;
    }
  }
  this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.RELEASE;
};


/**
 * Gets the next amplitude coefficient that should be applied to the currently
 * playing note.  This method must be called (and applied, natch) for each
 * sample filled for the duration of a note.
 *
 * @return {number} An amplitude coefficient in the range [0, 1] that should be
 *     applied to the current sample.
 */
doodle.moog.EnvelopeGenerator.prototype.getNextAmplitudeCoefficient =
    function() {
  switch (this.phase_) {
    case doodle.moog.EnvelopeGenerator.Phase_.ATTACK:
      this.amplitudeCoefficient_ += this.attackStep_;
      if (this.amplitudeCoefficient_ >= 1) {
        this.amplitudeCoefficient_ = 1;
        this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.DECAY;
      }
      break;
    case doodle.moog.EnvelopeGenerator.Phase_.DECAY:
      this.amplitudeCoefficient_ -= this.decayStep_;
      if (this.amplitudeCoefficient_ <= this.sustainLevel_) {
        this.amplitudeCoefficient_ = this.sustainLevel_;
        this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.SUSTAIN;
      }
      break;
    case doodle.moog.EnvelopeGenerator.Phase_.SUSTAIN:
      // Just stay at the sustain level until a release is signaled.
      break;
    case doodle.moog.EnvelopeGenerator.Phase_.RELEASE:
      this.amplitudeCoefficient_ -= this.releaseStep_;
      if (this.amplitudeCoefficient_ <= 0) {
        this.amplitudeCoefficient_ = 0;
        this.phase_ = doodle.moog.EnvelopeGenerator.Phase_.INACTIVE;
      }
      break;
    case doodle.moog.EnvelopeGenerator.Phase_.INACTIVE:
      // Stay at 0, as set in the release transition (muted).
      break;
  }

  return this.amplitudeCoefficient_;
};


/**
 * Sets attack phase duration.
 * @param {number} time Duration of the attack phase in seconds.
 */
doodle.moog.EnvelopeGenerator.prototype.setAttackTime = function(time) {
  this.attackTime_ = time;
  this.recomputePhaseSteps_();
};


/**
 * Sets decay phase duration.
 * @param {number} time Duration of the decay phase in seconds.
 */
doodle.moog.EnvelopeGenerator.prototype.setDecayTime = function(time) {
  this.decayTime_ = time;
  this.recomputePhaseSteps_();
};


/**
 * Sets the sustain level.
 * @param {number} level The sustain level, a number in the range [0, 1].
 */
doodle.moog.EnvelopeGenerator.prototype.setSustainLevel = function(level) {
  this.sustainLevel_ = level;
  this.recomputePhaseSteps_();
};


/**
 * Updates phase step variables to reflect current EnvelopeGenerator state.
 * @private
 */
doodle.moog.EnvelopeGenerator.prototype.recomputePhaseSteps_ = function() {
  if (this.attackTime_ <= 0) {
    this.attackStep_ = 1;
  } else {
    this.attackStep_ = this.SAMPLE_INTERVAL_ / this.attackTime_;
  }

  if (this.decayTime_ <= 0) {
    this.decayStep_ = 1;
    this.releaseStep_ = 1;
  } else {
    this.decayStep_ =
        (1 - this.sustainLevel_) * this.SAMPLE_INTERVAL_ / this.decayTime_;
    this.releaseStep_ =
        this.sustainLevel_ * this.SAMPLE_INTERVAL_ / this.decayTime_;
  }
};
