responsive-menu-text
====================

JavaScript mini-framework for responsively resizing menu text. Accounts for padding, different width configurations and initial font sizes.

Common Usage: $('menuOLSelector').responsiveMenuText();

jQuery Usage expects markup in the form of ol > li > a
 
 You can also configure the selectors in the default config near the top of the script and add .initDefault() to the end of the script for a stand alone script. 
 
 I put some initial AMD support in, but I haven't tested it.
 
There is a debug flag at the top of the script to assist with debugging.
