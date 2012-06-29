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
 * @fileoverview Master mixer interface for all doodle Web Audio sources.
 */
goog.provide('doodle.moog.MasterMixerInterface');



/**
 * Master mixer for the multiple virtual synthesizers that may play back
 * simultaneously via the Sequencer.
 * @interface
 */
doodle.moog.MasterMixerInterface = function() {};


/**
 * Turns on the mixer.
 */
doodle.moog.MasterMixerInterface.prototype.turnOn = function() {};


/**
 * Turns off the mixer.
 */
doodle.moog.MasterMixerInterface.prototype.turnOff = function() {};
