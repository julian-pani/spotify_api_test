var axios = require('axios');

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 4000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// setInterval(heartbeat, 33);

// function heartbeat() {
//   io.sockets.emit('heartbeat', blobs);
// }

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);

    socket.on('start',
      function(data) {
        console.log("starting client: " + socket.id + " with username: " + data.name);
        fetchSongs();
      }
    );

    socket.on('token',
      function(data) {
        console.log("fetching songs for user: " + socket.id + " with username: " + data.name + " and token: " + data.token);
        fetchSongs(data.token);
      }
    );

  });

function fetchSongs(token) {
  // var token = "BQCxaKpz0E8Y-cixvurr3tiBS-PVwMbrTXHcPgMhIEFFp0fJmqjsuqQrfiPy8MZ9L3rBr_Y_8HkhA17gfjD7z8t65jDIuMVqfpUkBCaOJackzgALE0dqjbGgDD-dg1-X0KjW3DVjorM9_tO5Xc6JbdbDEr-7xFi8YkNAxOS5ash4ckGgWZcoZP_1kDta7es4FFu-f8sr_CzgZDmeXMdjNoCRwGNSI52ym0kSyRlBD7G2wO-QYQg_a76caAnF-10qWeJcEYvMe3s"
  console.log("Fetching songs... ")

  // GET request for remote image
  axios({
    method:'get',
    url:'https://api.spotify.com/v1/me/top/artists?limit=10',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
    .then(response => {
      console.log("response.data = " + JSON.stringify(response.data.items));
      io.sockets.emit('top10artists', response.data.items);
  })
    .catch(error => {
      console.log(error);
  });
}

