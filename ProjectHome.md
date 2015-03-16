# About This Project #

This project contains most of the [Web Audio](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html) pipeline from the Bob Moog Doodle that ran on the Google homepage on May 23rd, 2012.  You can see the Doodle at: https://www.google.com/doodles/robert-moogs-78th-birthday

The intention of this open source project is to provide a moderately complex example of how one might use the Web Audio API to make a digital synthesizer on the web.  The Doodle's Flash Audio pipeline and user interface code are not being open sourced at this time.

If you're new to Web Audio and would like to learn more about it, the following resources are recommended:
  * http://www.html5rocks.com/en/tutorials/webaudio/intro/
  * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
  * http://html5audio.org/
  * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html

Some parting notes on the implementation:
  * Javascript in this project was written with Closure Compiler in mind.  You can learn more about Closure Compiler and its type annotations here: https://developers.google.com/closure/compiler/
  * There are some minor uses of Closure Library code too.  You can learn more about Closure Library here: https://developers.google.com/closure/library/
  * In the month since the Doodle was launched, both the Web Audio specification and its implementation in Chrome have undergone rapid changes.  While this project's code should still work with the latest versions of Web Audio capable browsers, some of the code might be better structured to take advantage of new Web Audio features (e.g., the Oscillator interface).
  * The "interface" files included in this project provide a common API between the Flash Audio and Web Audio pipelines in the Doodle.  These are slightly silly in the context of this open source project (where there is only one implementation of each interface).

# About The [Doodle](https://www.google.com/doodles/robert-moogs-78th-birthday) #

In the mid-1960s, Dr. Robert Moog unleashed a new universe of sounds into musicdom with his invention of the electronic analog Moog Synthesizer. The timbre and tones of these keyboard instruments (true works of art in and of themselves) would come to define a generation of music, featuring heavily in songs by The Beatles, The Doors, Stevie Wonder, Kraftwerk and many others.

When people hear the word “synthesizer” they often think “synthetic”—fake, manufactured, unnatural. In contrast, Bob Moog’s synthesizers produce beautiful, organic and rich sounds that are, nearly 50 years later, regarded by many professional musicians as the epitome of an electronic instrument. “Synthesizer,” it turns out, refers to the synthesis embedded in Moog’s instruments: a network of electronic components working together to create a whole greater than the sum of the parts.

With his passion for high-tech toolmaking in the service of creativity, Bob Moog is something of a patron saint of the nerdy arts and a hero to many of us at Google. So on 2012/05/23 on our homepage, we launched an interactive, playable logo inspired by the instruments with which Moog brought musical performance into the electronic age. You can use your mouse or computer keyboard to control the mini-synthesizer’s keys and knobs to make nearly limitless sounds. Keeping with the theme of 1960s music technology, we patched the keyboard into a 4-track tape recorder so you can record, play back and share songs via short links or Google+.

Much like the musical machines Bob Moog created, this doodle was synthesized from a number of smaller components to form a unique instrument. When experienced with [Google Chrome](https://www.google.com/chrome/), sound is generated natively using the [Web Audio API](http://www.html5rocks.com/en/tutorials/webaudio/intro/)—a doodle first (for other browsers the Flash plugin is used). This doodle also takes advantage of [JavaScript](http://en.wikipedia.org/wiki/JavaScript), [Closure libraries](https://developers.google.com/closure/), [CSS3](http://en.wikipedia.org/wiki/Cascading_Style_Sheets#CSS_3) and tools like [Google Web Fonts](http://www.google.com/webfonts#HomePlace:home), the [Google+ API](https://developers.google.com/+/api/), the [Google URL Shortener](http://goo.gl/) and [App Engine](https://developers.google.com/appengine/).

Special thanks to engineers Reinaldo Aguiar and Rui Lopes and doodle team lead Ryan Germick for their work, as well as the Bob Moog Foundation and Moog Music for their blessing.

--Joey Hurst