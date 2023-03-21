
var express    = require('express');        
var app        = express();                
var bodyParser = require('body-parser');
require('dotenv').config()
var request = require("request");
const cors = require('cors');
const { default: axios } = require('axios');
const { head } = require('request');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.enable('trust proxy')
app.use(cors())

var port = process.env.PORT || 9090;        



var router = express.Router();              
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilioNumber = process.env.TWILIO
const targetNumber = process.env.TARGET


router.get('/', function(req, res) {
    console.log(req.ip)
    console.log(req.headers['x-forwarded-for'])

    request.get("http://ipinfo.io/" + req.headers['x-forwarded-for']+ "/json?token="+process.env.IPTOKEN, function(err, response, body) {
        console.log(response.body)
        console.log(body)

        // client.messages
        // .create({
        //     body: body,
        //     from: twilioNumber,
        //     to: targetNumber
        // })
        // .then(message => console.log("sent"));
        // res.status(500).send("NOT SENDING to phone")   

    });


    res.status(404).send("404 Page Not Found")   
});


router.post('/report', function(req, res) {
    console.log(req.body)
    const ip = req.body.ip
    console.log("IP",ip)
    request.get("http://ipinfo.io/" + ip+ "/json?token="+process.env.IPTOKEN, function(err, response, body) {
        console.log(response.body)
        console.log(body)

        // client.messages
        // .create({
        //     body: body,
        //     from: twilioNumber,
        //     to: targetNumber
        // })
        // .then(message => console.log("sent"));
        // res.status(500).send("NOT SENDING to phone")   
    });


    res.status(500).send("ip")   
});


router.post('/question', function(req, res) {
    console.log(req.body)
    let query = req.body.query.trim()
    const filename = "file-djCM7uennenItAHwgK1XOpIe"
    const url = "https://api.openai.com/v1/answers"
    var header = {'Authorization': "Bearer " + process.env.OPENAIKEY,'Content-Type': "application/json"};
    data = {
        search_model:"ada",
        model:"davinci",
        question:query,
        file:filename,
        examples_context:"In 2017, U.S. life expectancy was 78.6 years.",
        examples:[["What is human life expectancy in the United States?", "78 years."]],
        max_rerank:10,
        max_tokens:40,
        stop:["\n", "<|endoftext|>"]
    }
    if (query.length > 150) res.status(400).send("Query too long")
    axios.post(url,data,{headers:header}).then((response) => {
        console.log(response.data)
        res.status(200).send({response:response.data.answers[0]})
    }).catch((e) => {
        console.log(e)
        res.status(500).send({response:"Sorry, I don't know"})
    })
});


app.use('/', router);


app.listen(port);
console.log('Magic happens on port ' + port);
