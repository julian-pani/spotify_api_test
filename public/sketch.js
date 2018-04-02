var mySound;
var currentMousePos;

var songData;

var currentToken = ''; // 'BQAWw4ox8R7t7X0Gys_HeXA4OEJEepyjCT2oKanBVwF0m9-FXbcAUt1oleVID4OQXrkemSmYgz5Ee8SEfQ1FXgdXuEcDfse1GgnO5axqdKKf6tsBKaptIGCGm6aVY66pId-HIVqIpgpHgk1FAVK0TjUNpTnfoVu_piQYkvLp8AdOGpQsis5o0p_24wmQf3avdlyr-I1ngc1d_Wg62FyRm1S6IMjiOsu0jZvBEATtqCf-9VI-y_ExkHaC2aDhf6H7_aHstCsvaag';

var topArtists = [];

// Keep track of our socket connection
var socket;

function Genre(pos, r, name) {
	this.pos = pos;
	this.r = r;
	this.name = name;
	this.sameDirectionFor = 5;
	this.directionX = random([-1, 1]);
	this.directionY = random([-1, 1]);

	var moveSpeed = 0.05;

	this.move = function() {

		// change direction if not changed for too long:
		if(this.sameDirectionFor >= 500) {
			// chose new direction
			this.directionX = random([-1, 1]);
			this.directionY = random([-1, 1]);
			// and reset counter
			this.sameDirectionFor = 0;
		}
		this.sameDirectionFor++;
		
		var newX = this.pos.x + this.directionX * moveSpeed;
		var newY = this.pos.y + this.directionY * moveSpeed;
		
		// if passing borders, change to opposite direction?
		if (newX < r || newX > width - r)  {
			newX = this.pos.x + (this.directionX * (-1)) * moveSpeed;
			this.sameDirectionFor = 0;
		}
		if (newY < r || newY > height - r)  {
			newY = this.pos.y + (this.directionY * (-1)) * moveSpeed;
		}

		this.pos = createVector(newX, newY);
	}

	this.show = function() {
		fill(255, 255, 255);
		ellipse(this.pos.x, this.pos.y, r);
		
		textAlign(CENTER, CENTER);
		fill(0,0,0);
		text(name, this.pos.x - (r / 2.4), this.pos.y, r * 0.9);
	}
}

function preload() {
	mySound = loadSound("assets/tequila.mp3");
}

function setup() {
	createCanvas(window.innerWidth * 0.8, window.innerHeight * 0.8, 50);
  	background(153);
	currentMousePos = createVector(0, 0);

	// Start a socket connection to the server
  	// Some day we would run this server somewhere else
  	socket = io.connect('http://' + window.location.hostname + ':4000');

  	var data = {
  		name: 'julian'
  	}
  	socket.emit('start', data);

  	socket.on('top10artists', function(data) {
  		console.log("received top10artists: " + data);
  		console.log(JSON.stringify(data));
  		saveTopArtists(data);
  	});

  	// update token
	var tokenInputField = createInput('enter token');
  	tokenInputField.input(function() { currentToken = this.value() });
	var tokenButton = createButton('send token');
  	tokenButton.mousePressed(sendToken);
  	// var reuseTokenButton = createButton('use existing token');
  	// reuseTokenButton.mousePressed(sendToken());
}

function sendToken() {
	if(currentToken != '') {
		var data = {
			name: 'julian',
			token: currentToken
		};

		socket.emit('token', data);
	}
}

function draw() {
	background(0);
	
	if(topArtists != null) {
		drawTopArtists();
	}

	// show current mouse position
	fill(255, 255, 255);
	textSize(12);
	text('x: ' + round(mouseX) + ", y: " + round(mouseY), mouseX, mouseY);
}

function saveTopArtists(data) {
	for (var i = data.length - 1; i >= 0; i--) {
		var artistName = data[i].name;
		var genre = new Genre(createVector(100 + random(width - 200), 100 + random(height - 200)), 100, artistName);
		// genre.show();
		topArtists.push(genre);
	}
}

function drawTopArtists() {
	for (var i = topArtists.length - 1; i >= 0; i--) {
		topArtists[i].move();
		topArtists[i].show();

		if(i < topArtists.length - 1) { // if it's not the first one, draw line to previous one.
			stroke(255);
			line(topArtists[i].pos.x, topArtists[i].pos.y, topArtists[i+1].pos.x, topArtists[i+1].pos.y);

		}
	}
}

function round(number) {
  var factor = Math.pow(10, 2);
  return Math.round(number * factor) / factor;
}
