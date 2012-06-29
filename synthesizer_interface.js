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
 * @fileoverview A moog-like audio synthesizer built on top of the HTML5 Web
 * Audio API.
 */
goog.provide('doodle.moog.SynthesizerInterface');



/**
 * A Moog-like synthesizer built on top of the HTML5 Web Audio API.
 * @interface
 */
doodle.moog.SynthesizerInterface = function() {};


/**
 * Signals that a key on the synthesizer has been pressed.
 * @param {number} note Chromatic index of the note to be played relative to
 *     the beginning of the keyboard.
 */
doodle.moog.SynthesizerInterface.prototype.setKeyDown = function(note) {};


/**
 * Binds a callback to a key down event.
 * @param {function(number)} callback The function called when a key is pressed.
 */
doodle.moog.SynthesizerInterface.prototype.setKeyDownCallback =
    function(callback) {};


/**
 * Signals that a key on the synthesizer has been released.  Since the
 * synthesizer is monophonic, no note parameter is necessary.
 */
doodle.moog.SynthesizerInterface.prototype.setKeyUp = function() {};


/**
 * Increases/decreases the output gain.
 * @param {number} volume The output volume level.  A number in the range
 *     [0..1].
 */
doodle.moog.SynthesizerInterface.prototype.setVolume = function(volume) {};


/**
 * Proxy to the synthesizer's low-pass filter setCutoffFrequency.
 * @param {number} cutoffFrequency The cutoff frequency above which the
 *     frequencies are attenuated.
 */
doodle.moog.SynthesizerInterface.prototype.setLpCutoffFrequency =
    function(cutoffFrequency) {};


/**
 * Proxy to the synthesizer's low-pass filter setContour.
 * @param {number} contour Amount of contour to apply to the filter envelope.
 */
doodle.moog.SynthesizerInterface.prototype.setLpContour =
    function(contour) {};


/**
 * Proxy to the synthesizer's low-pass filter setContourAttackTime.
 * @param {number} time Duration of the attack phase in seconds.
 */
doodle.moog.SynthesizerInterface.prototype.setLpContourAttackTime =
    function(time) {};


/**
 * Proxy to the synthesizer's low-pass filter setContourDecayTime.
 * @param {number} time Duration of the decay phase in seconds.
 */
doodle.moog.SynthesizerInterface.prototype.setLpContourDecayTime =
    function(time) {};


/**
 * Proxy to the synthesizer's low-pass filter setContourSustainLevel.
 * @param {number} level The sustain level, a number in the range [0, 1].
 */
doodle.moog.SynthesizerInterface.prototype.setLpContourSustainLevel =
    function(level) {};
