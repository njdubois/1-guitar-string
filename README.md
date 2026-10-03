Guitar Strings 101!

This is a React app written mainly for string instrument musicians, but it could be used for any western instrument.

This app allows the user to add/remove strings from the top or the bottom of the guitar neck.  Once a string has been added, the user can change the strings tuning, and then clicking on an individual note will toggle whether that note is in the current "scale."

To practice a run, choose a key and scale, then click **Practice runs**. Choose two outlined root notes in different octaves, or click **Suggest a run** for a one-octave example. The board shows the notes in playing order with numbered markers, and the tab below shows the exact strings and frets. Follow the tab left to right, use **Previous** and **Next** to focus on individual notes, and use **Reverse run** to play the same fingering backwards. The interval row marks the root with **R**. **Edit scale** returns to normal note selection.

Runs use the selected scale notes in pitch order and favor nearby frets and adjacent-string crossings. They are generated fingerings, not transcriptions of existing songs. If a gradual route does not fit the visible frets, show more frets or pick another root. Changing the scale, key, tuning, strings, or fret window resets the current run. Tuning includes octave information, starting from standard E4–B3–G3–D3–A2–E2 (top to bottom); added strings start on the nearest A above or below the edge string.

First, you need to have NPM installed, install NPM from here: https://www.npmjs.com/get-npm
Once Npm is installed globaly, you need to CD into this projects root directiory and run

npm install

Once that is finished, you can start the application by running

npm start
