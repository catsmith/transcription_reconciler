Introduction
---

This offline transcription editor is designed to highlight the differences between two transcriptions of New Testament manuscripts.
It works with plain text transcriptions and XML transcriptions that follow the IGNTP specifications (see http://epapers.bham.ac.uk/1676/ and http://epapers.bham.ac.uk/1892/). It is only designed to compare differences within a biblical verse although verse order is compared and reported separately.


Requirements
---

The transcription reconciler runs in a web browser and has no other requirements. It is only tested in the Firefox browser and will not work in Chrome. Javascript must be enabled in your browser.



Installation and Start up
---

Download the zip file and extract the files or clone the repository to your local machine.

Open the ```reconciler.html``` file with Firefox.


User Guide
---

### Starting a new reconciliation
To start a new reconciliation in the **Create New Reconciliation** section use the browse button to select the first file you want to compare. The selected file will appear next to the *File 1* label. Repeat the process to select the second file you want to compare. This file will appear next to the *File 2* label. If you make an mistake with the file selection the red delete button to the right of the filename can be used to remove the file and a replacement can be selected. The files to be compared should be of the same transcription type (plain text or XML).

When the two files have been selected use the **options** section to ignore any features you do not want to show up as differences and select whether you want the results to be displayed in Biblical order or the other of one of the files (using Biblical order can be useful when dealing with lectionaries). Some of the options do not work when using XML files.

When the options have been selected click the *Compare* button to start the reconciliation.

### Viewing the results

When the comparison is completed a summary will display below the *Compare* button.

The summary will tell you which files have been compared and each is highlighted in a colour. These are the colours that are used to represent each file in the comparisons display. The summary says how many differences exist in the structure (the order of the verses) and the text within the verses themselves.

If the summary says that the files have different structures then it is probably best to fix this first and rerun the reconciliation. If there are differences in the structures you can see the details by clicking on the *Show Structure Results* link.

The summary will also tell you how many of the Biblical verses have differences in the two files. To see the full details click on the *Show Text Results* link. This will show you the differences within each of the verses. There is a space at the top of each verse if you want to record notes/observations. These are saved when saving a reconciliation and will be reloaded into the editor when the saved version is reloaded but they will not be present in the text output. There is also a checkbox next to each verse. As you reconcile each verse you can check this box and the verse you have checked can be hidden using the *Hide checked verses* link. They are still saved when you save a reconciliation and are available to see again using the *Show checked verses* link which will appear when they are hidden. Again this has no impact on the text output which always shows all verses.


### Saving a reconciliation

To save the current state of a reconciliation use the *save* button in the **Save Current State** in the right hand column of the top section of the page. Due to security risks the browser cannot access your computers file system directly so a pop-up window will appear with the text to be saved. Copy all of the text in this window, ideally you should use the select all feature to ensure all of the text is copied. Paste the text into a file and save to your computer with a ```.txt``` extension.

This will save the reconciliation exactly as it appears on the screen including any comments and checks you have made in the interface.

### Loading a saved reconciliation

To load a saved reconciliation into the system use the *Browse* button in the **Upload Saved Reconciliation** section to select a saved file. This must be a file that was saved following the process described in the section above.

The saved data should then be available for you to continue using the reconciler as though you had just started a new reconciliation.


### The Text output

The *Save Text* button in the **Save as Text** section provides an interpretation of the differences between the two files which looks more like a traditional apparatus. Again this will open in a pop-up window and will need to be copied into a text file on your computer. This format is provided as output only and cannot be reloaded into the reconciler.



Referencing
---

To cite the offline transcription reconciler please use the DOI: [![DOI](https://zenodo.org/badge/174542045.svg)](https://zenodo.org/badge/latestdoi/174542045)
