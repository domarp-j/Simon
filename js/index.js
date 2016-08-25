/***********************************************************************************************************/
// NOTES

/*
playSequence() required understanding of closures - see link below: 
http://brackets.clementng.me/post/24150213014/example-of-a-javascript-closure-settimeout-inside

FCC-provided sounds cannot keep up with color buttons at higher speeds 
Too large - need to be replaced with shorter, smaller sounds
*/

(function() {

  /*********************************************************************************************************/
  // VARIABLES

  // Colors
  var darkGreen = "#699864",
    lightGreen = "#BCED91",
    darkRed = "#B3432B",
    lightRed = "#FF3030",
    darkBlue = "#236B8E",
    lightBlue = "#33A1C9",
    darkYellow = "#EEDD82",
    lightYellow = "#FFFF7E";

  // Sounds 
  var greenSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'), // A
    redSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'), // D
    yellowSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'), // G
    blueSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'); // A, octave above 

  // Objects that correspond number with color button ID, dark color, & light color
  var numToButton = {
      0: "green",
      1: "red",
      2: "yellow",
      3: "blue"
    },
    numToDark = {
      0: darkGreen,
      1: darkRed,
      2: darkYellow,
      3: darkBlue
    },
    numToLight = {
      0: lightGreen,
      1: lightRed,
      2: lightYellow,
      3: lightBlue
    };

  // Game-tracking variables
  var sequence = [], // Array that stores color sequence as numbers
    step = 0, // Running index to compare player button choices to sequence array
    buttonsOff = false, // Are buttons disabled? 
    strictOn = false, // Is strict state enabled?
    goal = 20; // Number of sequence steps to match in order to win the game
  
  // Time variables (in milliseconds)
  var lightTime = 475, // Length of time that each color is lit
    delay = 475, // slight delay before every playthrough
    disableTime = 475, // length of time to disable color button after it is pressed
    flashTime = 200, // length of time for each flash when game is reset 
    startDelay = 1450; // delay before game is started 

  /*********************************************************************************************************/
  // FUNCTIONS

  // Update counter at center of board
  function updateCount() {
    document.getElementById("count").innerHTML =
      sequence.length < 10 ? "0" + sequence.length : sequence.length;
  }

  // Add a new color (number from 0 to 3) to the order array 
  function addColor() {
    sequence.push(Math.floor(Math.random() * 4));
  }

  // Iterate through sequence array to light up colors
  function playSequence() {
    updateCount();
    buttonsOff = true; // disable buttons so that player can not press them while sequence is being played
    document.getElementById("strictState").disabled = true; // disable strict switch as well
    for (var i = 0; i < sequence.length; i++) {
      setTimeout(function(x) { // self-invoking function (see the (i) at the end of it?)
        return function() { // returns function that executes desired code 
          document.getElementById(numToButton[sequence[x]]).style.backgroundColor = numToLight[sequence[x]];
          switch (sequence[x]) { // play sound depending on color
            case 0:
              greenSound.play();
              break;
            case 1:
              redSound.play();
              break;
            case 2:
              yellowSound.play();
              break;
            case 3:
              blueSound.play();
              break;
            default:
              alert("Error - see playSequence()");
              return;
          }
        };
      }(i), delay + 2 * lightTime  * i); // light for (lightTime) milliseconds 
      setTimeout(function(x) { // Darken buttons at certain intervals 
        return function() {
          document.getElementById(numToButton[sequence[x]]).style.backgroundColor = numToDark[sequence[x]];
          if (x == sequence.length - 1) {
            buttonsOff = false;
            document.getElementById("strictState").disabled = false;
          }
        };
      }(i), delay + 2 * lightTime * i + lightTime); // darken (lightTime) milliseconds after lighting
    }
  }

  // Order of functions to call when player presses a color button
  function pressColor(num) {
    document.getElementById(numToButton[num]).style.backgroundColor = numToLight[num];
    buttonsOff = true;
    setTimeout(function() { // darken & enable buttons after a period of time
      document.getElementById(numToButton[num]).style.backgroundColor = numToDark[num];
      buttonsOff = false;
    }, disableTime);
  }

  // Flash all four colors n times and display a 2-char message such as "!!", ":D", or ":("
  function flash(n, message) {
    buttonsOff = true;
    document.getElementById("strictState").disabled = true;
    for (var i = 0; i < n; i++) {
      setTimeout(function(x) {
        return function() {
          document.getElementById("count").innerHTML = message;
          document.getElementById(numToButton[0]).style.backgroundColor = numToLight[0];
          document.getElementById(numToButton[1]).style.backgroundColor = numToLight[1];
          document.getElementById(numToButton[2]).style.backgroundColor = numToLight[2];
          document.getElementById(numToButton[3]).style.backgroundColor = numToLight[3];
        };
      }(i), 2 * flashTime * i);
      setTimeout(function(x) {
        return function() {
          document.getElementById(numToButton[0]).style.backgroundColor = numToDark[0];
          document.getElementById(numToButton[1]).style.backgroundColor = numToDark[1];
          document.getElementById(numToButton[2]).style.backgroundColor = numToDark[2];
          document.getElementById(numToButton[3]).style.backgroundColor = numToDark[3];
          if (x == n - 1) {
            buttonsOff = false;
            document.getElementById("strictState").disabled = false;
          }
        };
      }(i), 2 * flashTime * i + flashTime);
    }
  }

  // Start (or reset) game by re-initializing certain parameters
  function start() {
    sequence = [];
    step = 0;
    buttonsOff = false;
    lightTime = 475; 
    delay = 475; 
    disableTime = 475;
    startDelay = 1450; 
  }

  // Given a button press as a number (0 to 3), check if it matches the sequence
  function check(num) {
    console.log(lightTime); 
    if (num != sequence[step]) { // misstep by player
      flash(3, ":(");
      step = 0;
      if (strictOn) {
        start();
        addColor();
      }
      setTimeout(playSequence, startDelay);
    } else { // correct step by player
      step++;
    }
    if (step == goal) { // goal reached - win!
      flash(8, ":D"); 
      start(); 
      addColor();
      setTimeout(playSequence, 3 * startDelay); // delay extended for longer flash
    } else if (step == sequence.length) { // player sequence matches computer sequence, but goal not reached
      step = 0;
      addColor();
      setTimeout(playSequence, startDelay);
    } 
    if (step == 0) { // speed up slightly after sequence is lengthened
      lightTime -= 6; 
      delay -= 6; 
      disableTime -= 6; 
    } 
  }

  /*********************************************************************************************************/
  // BUTTON PRESSES & SWITCH TOGGLES

  document.getElementById("green").onmousedown = function() { // green color pressed
    pressColor(0);
    greenSound.play();
    check(0);
  }

  document.getElementById("red").onmousedown = function() { // red color pressed
    if (buttonsOff) return;
    pressColor(1);
    redSound.play();
    check(1);
  }

  document.getElementById("yellow").onmousedown = function() { // yellow color pressed
    if (buttonsOff) return;
    pressColor(2);
    yellowSound.play();
    check(2);
  }

  document.getElementById("blue").onmousedown = function() { // blue color pressed
    if (buttonsOff) return;
    pressColor(3);
    blueSound.play();
    check(3);
  }

  document.getElementById("startButton").onclick = function() { // start button pressed
    if (buttonsOff) return;
    start();
    greenSound.play(); // good, flat "let's start" tone
    flash(4, "!!");
    addColor();
    setTimeout(playSequence, 500 + startDelay);
  }

  document.getElementById("strictState").onchange = function() { // strict switch toggle
    strictOn = document.getElementById("strictState").checked;
    start();
    greenSound.play();
    flash(4, "!!");
    addColor();
    setTimeout(playSequence, 500 + startDelay);
  }

}());