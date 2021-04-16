// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
require('dotenv').config()
var request = require("request");
const cors = require('cors');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.enable('trust proxy')
app.use(cors())

var port = process.env.PORT || 9090;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilioNumber = process.env.TWILIO
const targetNumber = process.env.TARGET

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    console.log(req.ip)
    console.log(req.headers['x-forwarded-for'])

    request.get("http://ipinfo.io/" + req.headers['x-forwarded-for']+ "/json?token="+process.env.IPTOKEN, function(err, response, body) {
        console.log(response.body)
        console.log(body)

        client.messages
        .create({
            body: body,
            from: twilioNumber,
            to: targetNumber
        })
        .then(message => console.log("sent"));
    
    });


    res.status(404).send("404 Page Not Found")   
});

// more routes for our API will happen here

router.post('/report', function(req, res) {
    console.log(req.body)
    const ip = req.body.ip
    console.log("IP",ip)
    request.get("http://ipinfo.io/" + ip+ "/json?token="+process.env.IPTOKEN, function(err, response, body) {
        console.log(response.body)
        console.log(body)

        client.messages
        .create({
            body: body,
            from: twilioNumber,
            to: targetNumber
        })
        .then(message => console.log("sent"));
    });


    res.status(200).send("ip")   
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
