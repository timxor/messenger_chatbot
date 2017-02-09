'use strict';
const bodyParser = require('body-parser');
const request = require('request');
const botBuilder = require('claudia-bot-builder');
var path    = require("path");
var greeting = require('greeting');
var randomFact = require('huh');
var port = process.env.PORT || 8000;

var express = require('express');
var app = express();
var open = require('open');
var dotenv = require('dotenv').load();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(port, () => {
    console.log('Expressheroku l server listening on port %d in %s mode', server.address().port, app.settings.env);
    open('http://127.0.0.1:5000');
});

app.get('/', function (req, res) {
    res.send("Hello from /. ");
})

// page https://www.facebook.com/Comedy-Bot-144000482774878/
// app https://developers.facebook.com/apps/1342241162503801/messenger/
/* For Facebook Validation */
app.get('/messenger_chatbot', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'comedybot') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
      res.send("Hello from  /messenger_chatbot/ 403 status.");
      res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/messenger_chatbot', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
            sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

function sendMessage(event) {
    let sender = event.sender.id;
    let userInputText = event.message.text;
    let response = greeting.random() + '! ' + randomFact.get() + '';

    console.log('*** RECEIVED ***');
    console.log(event);
    console.log("user input:   ", userInputText);

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: {text: response}
        }
    }, function (error, response) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.get('/ula', (req, res) => {
    res.sendFile(path.join(__dirname+'/ula.html'));
});
