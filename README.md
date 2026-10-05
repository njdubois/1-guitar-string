Guitar Strings 101!

This is a React app written mainly for string instrument musicians, but it could be used for any western instrument.

This app allows the user to add/remove strings from the top or the bottom of the guitar neck.  Once a string has been added, the user can change the strings tuning, and then clicking on an individual note will toggle whether that note is in the current "scale."

To practice a run, choose a key and scale, then click **Practice runs**. Choose two outlined root notes in different octaves, or click **Suggest a run** for a one-octave example. The board shows the notes in playing order with numbered markers, and the tab below shows the exact strings and frets. Follow the tab left to right, use **Previous** and **Next** to focus on individual notes, and use **Reverse run** to play the same fingering backwards. The interval row marks the root with **R**. **Edit scale** returns to normal note selection.

Runs use the selected scale notes in pitch order and favor nearby frets and adjacent-string crossings. They are generated fingerings, not transcriptions of existing songs. If a gradual route does not fit the visible frets, show more frets or pick another root. Changing the scale, key, tuning, strings, or fret window resets the current run. Tuning includes octave information, starting from standard E4–B3–G3–D3–A2–E2 (top to bottom); added strings start on the nearest A above or below the edge string.

Choose **Learn CAGED** to see the five movable major-chord shapes in the current key. The lesson explains the shape/chord distinction, labels roots and chord intervals, and shows which roots connect neighboring shapes. **Next up the neck** follows the repeating C–A–G–E–D sequence; **Show shape in view** brings the current shape back into the fret window. You can add nearby major-pentatonic notes or launch a major-pentatonic practice run in that position. This introductory lesson uses standard six-string tuning and includes a link to Wolf Marshall’s CAGED reference. Custom tunings remain available in **Explore & practice**.

Choose **Triads** to view major, minor, diminished, or augmented triads in the selected key. Pick any three adjacent strings and filter by root position, first inversion, or second inversion. **Lower position** and **Higher position** move between compact, close-position voicings through fret 24. The diagram labels chord intervals, and the note list gives the exact string, fret, and note for each tone. These shapes are calculated from the current tuning; at least three strings are required. Click a note to identify it, or use **Show triad in view** after moving the fret window.

Choose **Note game** to memorize the fretboard. A blank marker appears at a random position among the visible frets and open strings, with four shuffled note choices. Pick a note to turn the marker and your answer green or red; the correct note is revealed, and a new question appears automatically after one second. The game follows your current tuning, string count, and fret window, scrolls the marker into view, and avoids repeating the same position immediately. Change the fret range to focus on a part of the neck. The score counts correct answers in the current session.

Above the board, the readout shows the current key, CAGED form or triad voicing, and visible fret range. Changes briefly highlight the updated values and show the previous and new selection. Changing a CAGED form keeps the same key. Moving the fret window smoothly pans the notes and both fret-number rows together, with the open strings and tuning controls fixed at the left. Reduced-motion preferences skip the animation.

First, you need to have NPM installed, install NPM from here: https://www.npmjs.com/get-npm
Once Npm is installed globaly, you need to CD into this projects root directiory and run

npm install

Once that is finished, you can start the application by running

npm start
