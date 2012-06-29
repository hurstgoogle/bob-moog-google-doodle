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
 * @fileoverview Voltage controlled oscillator emulators.
 */
goog.provide('doodle.moog.Oscillator');

goog.require('doodle.moog.EnvelopeGenerator');
goog.require('doodle.moog.OscillatorInterface');



/**
 * A voltage controlled oscillator emulator built on the HTML5 Audio API.  This
 * is the root source of all sound in the Moog doodle.
 *
 * @param {!AudioContext} audioContext Audio context to which this oscillator
 *     will be bound.
 * @param {number} volume Initial volume level [0..1].
 * @param {!doodle.moog.OscillatorInterface.WaveForm} waveForm Initial wave
 *     form.
 * @param {!doodle.moog.OscillatorInterface.Range} range Initial pitch range.
 * @param {number} pitchBend Initial pitch bend [-1..1].
 * @param {boolean} isAcceptingKeyboardPitch Whether keyboard control is on.
 * @param {boolean} isFrequencyModulationOn Whether this oscillator should
 *     modulate its frequency using the modulator control signal.
 * @param {boolean} isModulator Whether this modulator should act as a modulator
 *     control signal in addition to an audio signal.
 * @param {number} modulatorLevel If a modulator, how strong the modulator
 *     control signal should be [0..1].
 * @param {boolean} isGlideOn Whether glide is on.
 * @param {number} glideTime Glide time in seconds.
 * @param {number} attackTime Initial attack time in seconds.
 * @param {number} decayTime Initial decay time in seconds.
 * @param {number} sustainLevel Initial sustain level [0..1].
 * @constructor
 * @implements {doodle.moog.OscillatorInterface}
 */
doodle.moog.Oscillator = function(
    audioContext, volume, waveForm, range, pitchBend, isAcceptingKeyboardPitch,
    isFrequencyModulationOn, isModulator, modulatorLevel, isGlideOn, glideTime,
    attackTime, decayTime, sustainLevel) {
  /**
   * How many seconds pass with each sample.
   * @type {number}
   * @private
   * @const
   */
  this.SAMPLE_INTERVAL_ = 1 / audioContext.sampleRate;

  /**
   * How many seconds we have advanced in the current cycle.
   * @type {number}
   * @private
   */
  this.phase_ = 0.0;

  /**
   * The amount of oscillator signal which is fed into the mixer.  Mapped onto
   * the range [0.0, 1.0] where 0 means muted and 1.0 means full loudness.
   * @type {number}
   * @private
   */
  this.volume_ = volume;

  /**
   * Shape of the wave this oscillator generates.
   * @type {!doodle.moog.OscillatorInterface.WaveForm}
   * @private
   */
  this.waveForm_ = waveForm;

  /**
   * Octave/range in which the oscillator functions.
   * @type {!doodle.moog.OscillatorInterface.Range}
   * @private
   */
  this.range_ = range;

  /**
   * Pitch bend to apply on top of the base frequency on the range [-1.0, 1.0].
   * If isAcceptingKeyboardPitch_ is true, -1/1 are a major 6th down/up; 0 is no
   * pitch bend.  If isAcceptingKeyboardPitch_ is false, -1/1 are 3 octaves
   * down/up; 0 is still no pitch bend.
   * @type {number}
   * @private
   */
  this.pitchBend_ = pitchBend;

  /**
   * Whether the oscillator pitch is controlled by keyboard signals.  If true,
   * the pitch follows the keyboard as one would expect on a piano-like
   * instrument.  If false, pressing any key on the keyboard will result in the
   * same pitch (as set by range_ and pitchBend_).
   * @type {boolean}
   * @private
   */
  this.isAcceptingKeyboardPitch_ = isAcceptingKeyboardPitch;

  /**
   * Whether this oscillator should modulate its frequency using the modulator
   * control signal.
   * @type {boolean}
   * @private
   */
  this.isFrequencyModulationOn_ = isFrequencyModulationOn;

  /**
   * Whether this modulator should act as a modulator control signal in addition
   * to an audio signal.
   * @type {boolean}
   * @const
   * @private
   */
  this.IS_MODULATOR_ = isModulator;

  /**
   * If this oscillator is also a modulator, how strong the modulator control
   * signal should be [0..1].  0 fully attenuates the control signal; 1 fully
   * applies it.
   * @type {number}
   * @private
   */
  this.modulatorLevel_ = modulatorLevel;

  /**
   * If this oscillator is also a modulator, a buffer for storing modulator
   * control signal samples.  Null iff this oscillator does not act as a
   * modulator.
   * @type {Float32Array}
   */
  this.modulatorSignal = null;

  /**
   * Whether glide (portamento sliding between notes) is enabled.
   * @type {boolean}
   * @private
   */
  this.isGlideOn_ = isGlideOn;

  /**
   * Glide duration in seconds.
   * @type {number}
   * @private
   */
  this.glideDuration_ = glideTime;

  /**
   * How much to advanced the frequency per sample while gliding.  Null until
   * the first tone is played.
   * @type {?number}
   * @private
   */
  this.glideDelta_ = null;

  /**
   * Current glide pitch.  Null until the first tone is played.
   * @type {?number}
   * @private
   */
  this.currentGlidePitch_ = null;

  /**
   * Target glide pitch.  Null until the first tone is played.
   * @type {?number}
   * @private
   */
  this.targetGlidePitch_ = null;

  /**
   * Chromatic index of the note to be played relative to the beginning of the
   * keyboard.
   * @type {number}
   * @private
   */
  this.activeNote_ = 0;

  /**
   * Envelope generator that will shape the dynamics of this oscillator.
   * @type {!doodle.moog.EnvelopeGenerator}
   */
  this.envelopeGenerator =
      new doodle.moog.EnvelopeGenerator(
          this.SAMPLE_INTERVAL_, attackTime, decayTime, sustainLevel);
};


/**
 * The base frequency (in hertz) from which other notes' frequencies are
 * calculated.  A low 'A'.
 * @type {number}
 * @const
 * @private
 */
doodle.moog.Oscillator.BASE_FREQUENCY_ = 55;


/**
 * Frequency ratio of major sixth musical interval.
 * @type {number}
 * @const
 * @private
 */
doodle.moog.Oscillator.MAJOR_SIXTH_FREQUENCY_RATIO_ = 5 / 3;


/**
 * Frequency ratio of a three octave musical interval.
 * @type {number}
 * @const
 * @private
 */
doodle.moog.Oscillator.THREE_OCTAVE_FREQUENCY_RATIO_ = 8;


/**
 * The chromatic distance between keyboard notes (as passed to
 * getInstantaneousFrequency_) and low A.
 * @type {number}
 * @const
 * @private
 */
doodle.moog.Oscillator.NOTE_OFFSET_ = -4;


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setVolume = function(volume) {
  this.volume_ = volume;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setWaveForm = function(waveForm) {
  this.waveForm_ = waveForm;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setPitchBend = function(pitchBend) {
  this.pitchBend_ = pitchBend;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setRange = function(range) {
  this.range_ = range;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOnKeyboardPitchControl = function() {
  this.isAcceptingKeyboardPitch_ = true;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOffKeyboardPitchControl = function() {
  this.isAcceptingKeyboardPitch_ = false;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOnFrequencyModulation = function() {
  this.isFrequencyModulationOn_ = true;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOffFrequencyModulation = function() {
  this.isFrequencyModulationOn_ = false;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setModulatorLevel = function(modulatorLevel) {
  this.modulatorLevel_ = modulatorLevel;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOnGlide = function() {
  this.isGlideOn_ = true;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.turnOffGlide = function() {
  this.isGlideOn_ = false;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setGlideDuration = function(time) {
  this.glideDuration_ = time;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setActiveNote = function(note) {
  this.activeNote_ = note;
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setEnvelopeGeneratorAttackTime =
    function(attackTime) {
  this.envelopeGenerator.setAttackTime(attackTime);
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setEnvelopeGeneratorDecayTime =
    function(decayTime) {
  this.envelopeGenerator.setDecayTime(decayTime);
};


/** @inheritDoc */
doodle.moog.Oscillator.prototype.setEnvelopeGeneratorSustainLevel =
    function(sustainLevel) {
  this.envelopeGenerator.setSustainLevel(sustainLevel);
};


/**
 * Gets the instantaneous frequency that this oscillator ought to be generating.
 * @param {number} note Chromatic index of the note to be played relative to
 *     the beginning of the keyboard.
 * @return {number} The instantaneous frequency.
 * @private
 */
doodle.moog.Oscillator.prototype.getInstantaneousFrequency_ = function(note) {
  if (!this.isAcceptingKeyboardPitch_) {
    note = 0;
  }

  return doodle.moog.Oscillator.BASE_FREQUENCY_ *
      this.range_ *
      Math.pow(2, (note + doodle.moog.Oscillator.NOTE_OFFSET_) / 12);
};


/**
 * Gets the pitch bend that should be applied to this oscillator.
 * @return {number} The frequency ratio that should be applied to the base
 *     pitch.
 * @private
 */
doodle.moog.Oscillator.prototype.getPitchBend_ = function() {
  var pitchBendScale = doodle.moog.Oscillator.MAJOR_SIXTH_FREQUENCY_RATIO_;
  if (!this.isAcceptingKeyboardPitch_) {
    pitchBendScale = doodle.moog.Oscillator.THREE_OCTAVE_FREQUENCY_RATIO_;
  }
  var normalizedPitchBend =
      Math.abs(this.pitchBend_ * (pitchBendScale - 1)) + 1;
  return this.pitchBend_ >= 0 ? normalizedPitchBend : 1 / normalizedPitchBend;
};


/**
 * Gets the frequency this oscillator ought to generate after undergoing
 * optional glide.
 * @param {number} target The target frequency to move towards.
 * @return {number} The frequency this oscillator should generate with glide.
 * @private
 */
doodle.moog.Oscillator.prototype.getGlideFrequency_ = function(target) {
  if (!this.isGlideOn_ ||
      this.currentGlidePitch_ === null ||
      this.glideDuration_ <= 0 ||
      Math.abs(this.currentGlidePitch_ - target) <=
          Math.abs(this.glideDelta_)) {
    this.currentGlidePitch_ = this.targetGlidePitch_ = target;
    return target;
  }

  if (this.targetGlidePitch_ != target) {
    var glideDurationInSamples = this.glideDuration_ / this.SAMPLE_INTERVAL_;
    this.glideDelta_ =
        (target - this.currentGlidePitch_) / glideDurationInSamples;
    this.targetGlidePitch_ = target;
  }

  this.currentGlidePitch_ += this.glideDelta_;
  return this.currentGlidePitch_;
};


/**
 * Gets the frequency this oscillator ought to generate after undergoing
 * optional frequency modulation.
 * @param {number} baseFrequency The base frequency to modulate.
 * @param {Float32Array} modulatorSignal Modulator signal buffer to apply to
 *     this oscillator.  If null, no modulation should be applied.
 * @param {number} index Sample index of the modulation signal to apply.
 * @return {number} The frequency this oscillator should generate with
 *     modulation.
 * @private
 */
doodle.moog.Oscillator.prototype.getModulationFrequency_ = function(
    baseFrequency, modulatorSignal, index) {
  if (!modulatorSignal || !this.isFrequencyModulationOn_) {
    return baseFrequency;
  }
  // Linearly project modulation level [0..1] onto [0.5..2] (down/up an octave).
  // TODO: Re-evaluate this maximum frequency modulation range based on real
  // Moog behavior.
  return (modulatorSignal[index] * 0.75 + 1.25) * baseFrequency;
};


/**
 * Advances the oscillator's phase of play.  This helper function must be called
 * exactly once per sample.
 * @param {number} frequency The frequency being played.
 * @return {number} Progress made in the current cycle, projected on the range
 *     [0, 1].
 * @private
 */
doodle.moog.Oscillator.prototype.advancedPhase_ = function(frequency) {
  var cycleLengthInSeconds = 2 / frequency;
  if (this.phase_ > cycleLengthInSeconds) {
    this.phase_ -= cycleLengthInSeconds;
  }
  var progressInCycle = this.phase_ * frequency / 2;
  this.phase_ += this.SAMPLE_INTERVAL_;
  return progressInCycle;
};


/**
 * Fills the passed audio buffer with the tone represented by this oscillator.
 * @param {!AudioProcessingEvent} e The audio process event object.
 * @param {Float32Array} modulatorSignal Modulator signal buffer to apply to
 *     this oscillator.  If null, no modulation will be applied.
 * @param {!doodle.moog.OscillatorInterface.FillMode} fillMode How the
 *     oscillator should fill the passed audio buffer.
 * @param {number=} opt_mixDivisor Iff using FillMode.MIX, how much to mix down
 *     the buffer.  This should usually be the number of oscillators that have
 *     added data to the buffer.
 */
doodle.moog.Oscillator.prototype.fillAudioBuffer = function(
    e, modulatorSignal, fillMode, opt_mixDivisor) {
  var buffer = e.outputBuffer;
  var left = buffer.getChannelData(1);
  var right = buffer.getChannelData(0);

  if (this.IS_MODULATOR_ && !this.modulatorSignal) {
    this.modulatorSignal = new Float32Array(buffer.length);
  }

  var targetFrequency = this.getInstantaneousFrequency_(this.activeNote_);
  var pitchBend = this.getPitchBend_();
  var frequency = targetFrequency * pitchBend;

  var audioLevel, envelopeCoefficient, level, on, progressInCycle, ramp;
  for (var i = 0; i < buffer.length; ++i) {
    envelopeCoefficient =
        this.envelopeGenerator.getNextAmplitudeCoefficient();
    progressInCycle = this.advancedPhase_(
        pitchBend *
        this.getModulationFrequency_(
            this.getGlideFrequency_(targetFrequency), modulatorSignal, i));
    switch (this.waveForm_) {
      case doodle.moog.OscillatorInterface.WaveForm.TRIANGLE:
        level = 4 * ((progressInCycle > 0.5 ?
                      1 - progressInCycle : progressInCycle) - .25);
        break;
      case doodle.moog.OscillatorInterface.WaveForm.SAWANGLE:
        ramp = progressInCycle < 0.5;
        level = ramp ? (4 * progressInCycle - 1) : (-2 * progressInCycle + 1);
        break;
      case doodle.moog.OscillatorInterface.WaveForm.RAMP:
        level = 2 * (progressInCycle - 0.5);
        break;
      case doodle.moog.OscillatorInterface.WaveForm.REVERSE_RAMP:
        level = -2 * (progressInCycle - 0.5);
        break;
      case doodle.moog.OscillatorInterface.WaveForm.SQUARE:
        level = progressInCycle < 0.5 ? 1 : -1;
        break;
      case doodle.moog.OscillatorInterface.WaveForm.FAT_PULSE:
        level = progressInCycle < 1 / 3 ? 1 : -1;
        break;
      case doodle.moog.OscillatorInterface.WaveForm.PULSE:
        level = progressInCycle < 0.25 ? 1 : -1;
        break;
    }

    if (this.IS_MODULATOR_) {
      this.modulatorSignal[i] = level * this.modulatorLevel_;
    }

    audioLevel = level * this.volume_ * envelopeCoefficient;
    if (fillMode == doodle.moog.OscillatorInterface.FillMode.CLOBBER) {
      right[i] = audioLevel;
    } else if (fillMode == doodle.moog.OscillatorInterface.FillMode.ADD) {
      right[i] = right[i] + audioLevel;
    } else {  // Otherwise FillMode.MIX.
      right[i] = (right[i] + audioLevel) / opt_mixDivisor;

      // In older versions of Chrome, Web Audio API always created two
      // channels even if you have requested monaural sound. However, this
      // is not the case in the newer (dev/canary) versions. This should
      // cover both.
      if (left) {
        left[i] = right[i];
      }
    }
  }
};
