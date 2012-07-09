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

goog.addDependency('../compound_audio_node.js', ['doodle.moog.CompoundAudioNode'], []);
goog.addDependency('../envelope_generator.js', ['doodle.moog.EnvelopeGenerator'], []);
goog.addDependency('../low_pass_filter.js', ['doodle.moog.LowPassFilter'], ['doodle.moog.CompoundAudioNode']);
goog.addDependency('../master_mixer.js', ['doodle.moog.MasterMixer'], ['doodle.moog.MasterMixerInterface']);
goog.addDependency('../master_mixer_interface.js', ['doodle.moog.MasterMixerInterface'], []);
goog.addDependency('../moog.js', ['doodle.moog.Moog'], ['doodle.moog.LowPassFilter', 'doodle.moog.MasterMixer', 'doodle.moog.Oscillator', 'doodle.moog.OscillatorInterface', 'doodle.moog.Synthesizer', 'doodle.moog.WideBandPassFilter', 'goog.Disposable']);
goog.addDependency('../oscillator.js', ['doodle.moog.Oscillator'], ['doodle.moog.EnvelopeGenerator', 'doodle.moog.OscillatorInterface']);
goog.addDependency('../oscillator_interface.js', ['doodle.moog.OscillatorInterface', 'doodle.moog.OscillatorInterface.FillMode', 'doodle.moog.OscillatorInterface.Range', 'doodle.moog.OscillatorInterface.WaveForm'], []);
goog.addDependency('../synthesizer.js', ['doodle.moog.Synthesizer'], ['doodle.moog.CompoundAudioNode', 'doodle.moog.OscillatorInterface', 'doodle.moog.SynthesizerInterface', 'goog.array', 'goog.userAgent']);
goog.addDependency('../synthesizer_interface.js', ['doodle.moog.SynthesizerInterface'], []);
goog.addDependency('../wide_band_pass_filter.js', ['doodle.moog.WideBandPassFilter'], ['doodle.moog.CompoundAudioNode']);
