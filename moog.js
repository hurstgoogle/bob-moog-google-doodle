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
 * @fileoverview Main module for the Dr. Robert Moog Synthesizer doodle.
 */
goog.provide('doodle.moog.Moog');

goog.require('doodle.moog.LowPassFilter');
goog.require('doodle.moog.MasterMixer');
goog.require('doodle.moog.Oscillator');
goog.require('doodle.moog.OscillatorInterface');
goog.require('doodle.moog.Synthesizer');
goog.require('doodle.moog.WideBandPassFilter');
goog.require('goog.Disposable');



/**
 * The Moog doodle manager.
 * @constructor
 * @extends {goog.Disposable}
 */
doodle.moog.Moog = function() {
  goog.base(this);

  /**
   * The set of available synthesizers.
   * @type {!Array.<!doodle.moog.SynthesizerInterface>}
   * @private
   */
  this.synthesizers_ = [];

  /**
   * A reference to a master mixer instance.
   * @type {!doodle.moog.MasterMixerInterface}
   * @private
   */
  this.masterMixer_;

  /**
   * @private
   */
  this.isWebAudioEnabled_ = typeof webkitAudioContext === 'function';


  if (this.isWebAudioEnabled_) {
    this.initializeWebAudio_();
  }
};
goog.inherits(doodle.moog.Moog, goog.Disposable);


/** @inheritDoc */
doodle.moog.Moog.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.turnOffAudio();
};


/**
 * Initializes the Moog doodle on WebAudio-compatible browsers.
 * @private
 */
doodle.moog.Moog.prototype.initializeWebAudio_ = function() {
  try {
    // Audio context creation can throw an error if the user is missing sound
    // drivers, etc.
    var audioContext = new webkitAudioContext();
  } catch(e7) {
    // Abort the initialization sequence like we do with flash.
    return;
  }
  var oscillators = [
    new doodle.moog.Oscillator(
        audioContext, 0.46, doodle.moog.OscillatorInterface.WaveForm.SQUARE,
        doodle.moog.OscillatorInterface.Range.R16, 0, true, false, false, 0,
        true, 0.05, 0, 0.4, 1),
    new doodle.moog.Oscillator(
        audioContext, 0.82, doodle.moog.OscillatorInterface.WaveForm.SQUARE,
        doodle.moog.OscillatorInterface.Range.R4, 0, true, false, false, 0,
        true, 0.05, 0, 0.4, 1),
    new doodle.moog.Oscillator(
        audioContext, 0.46, doodle.moog.OscillatorInterface.WaveForm.SQUARE,
        doodle.moog.OscillatorInterface.Range.R32, 0, true, false, true, 0.6,
        true, 0.05, 0, 0.4, 1)
  ];
  var lowPassFilter = new doodle.moog.LowPassFilter(
      audioContext, 2100, 7, 0, .8, 0);
  this.synthesizers_.push(new doodle.moog.Synthesizer(
      audioContext, oscillators, lowPassFilter, 0.82));

  var wideBandPassFilter = new doodle.moog.WideBandPassFilter(
      audioContext, 20, 20000);
  this.masterMixer_ = new doodle.moog.MasterMixer(
      audioContext, this.synthesizers_, wideBandPassFilter);
};


/**
 * Turns on the audio pipeline.
 */
doodle.moog.Moog.prototype.turnOnAudio = function() {
  if (this.masterMixer_) {
    this.masterMixer_.turnOn();
  }
};


/**
 * Turns off the audio pipeline.
 */
doodle.moog.Moog.prototype.turnOffAudio = function() {
  if (this.masterMixer_) {
    this.masterMixer_.turnOff();
  }
};
