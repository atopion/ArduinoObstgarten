const express = require('express');
const app = express();
const router = express.Router();
const Influx = require('influxdb-nodejs');
const fs = require('fs');
require('dotenv/config');
const path = JSON.parse(fs.readFileSync('./DB_path.json'))
console.log(path.DB_path)
const client = new Influx(path.DB_path);
const request = require("request");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const https = require('https');
const cors = require("cors");
const use_path = require('path')
const {spawn} = require('child_process')
/**
 * Run python script, pass in `-u` to not buffer console output 
 * @return {ChildProcess}
 */

app.use(cors());

var redis_connector;

const PORT = 3001;
const SSL_PORT = 3000;

const SSL_FOLDER = '/cert';

const SSL_ACTIVE = process.env.SSL_ACTIVE || "0";
const NO_SSL_ACTIVE = process.env.NO_SSL_ACTIVE || "0";


// give redis DB time to establish
setTimeout(function() {
    const RedisConnector = require('./libredis.js');    // this path is only valid for container in deployment. Does not fit git directory structure
    redis_connector = new RedisConnector.RedisConnector();
}, 10000);

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
  });

app.use(cookieParser());

/* Logger */
app.use(function (req, res, next) {
    console.log(
        "[", new Date(Date.now()).toUTCString(),
        "]: Request from", req.connection.remoteAddress,
        ", Method:", req.method,
        ", Path:", req.path,
        req.method.toLowerCase() === "post" ? ", Post parameters:" : "", req.method.toLowerCase() === "post" ? req.body : "",
        ", Session: ", req.cookies["SESSION"]);
    next();
});

// create DB, if already existing do not override
setTimeout(function() {
    client.createDatabase().catch(err => {
        console.error('create database fail err:', err); 
    });
}, 10000);


let credentials = null;
/* SSL ? */
if(SSL_ACTIVE === "1") {
    const privateKey  = fs.readFileSync(SSL_FOLDER + '/privkey1.pem', 'utf8');
    const certificate = fs.readFileSync(SSL_FOLDER + '/fullchain1.pem', 'utf8');

    credentials = {key: privateKey, cert: certificate};
}


const users = JSON.parse(fs.readFileSync("./users.json", "utf-8")); // read data of known users

const tagSchema = {
    spdy: ['speedy', 'fast', 'slow'],
    method: '*',
    // http stats code: 10x, 20x, 30x, 40x, 50x
    type: ['1', '2', '3', '4', '5'],
};
// define schema of DB entries
client.schema('http', {
    user: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    sensor: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
}, tagSchema, { stripUnknown: true });

client.schema('https', {
    user: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    sensor: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
}, tagSchema, { stripUnknown: true });


function postToDB(req, res, next) {
    // search user belonging to device key
    //console.log("EXPORT: ", req);
    const device_key = req.body.key;
    var user_name = "dummy"
    for (u in users) {
        for(i=0; i<users[u].length; i++) {
            if (users[u][i] == device_key) {
                user_name = u;
            }
        }
    }
    if (user_name == "dummy") {
        console.log("Could not find passed device key");
        res.status(404).send("Device key not found");
        return;
    }

    // post as entry to DB
    const post = {
        user: user_name,
        type: req.body.type,
        sensor: req.body.sensor,
        value: req.body.value
    };

    // make entry in DB
    client.write(user_name)
          .field(post)
          .then(() => console.info('write point success'))
          .catch(console.error);
  
    res.status(200).send("Alles ok");
    next();

    console.log("POST: ", post);
  };

  
function postNodes(req, res) {
    
    const cookie = req.cookies["SESSION"];  // session id
    var req_username = "dummy";
    let session_found = false;
    // request session ids
    request("http://server:3030/sessions", function (error, response, body) {

        sessions = JSON.parse(body);
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.


        
        // Find username of matching session id
        for (s in sessions) {
            //console.info(sessions[s].sessionID);
            if (sessions[s].sessionID == cookie) {
                req_username = sessions[s].username
                session_found = true;
            }
        }
    
        console.info("Method", req.method);
        const method = req.method;

        if(method === "GET" && session_found === true) {
            redis_connector.get(req_username).then(val => res.status(200).send(val));
        
        }
        else if(method === "POST" && session_found === true) {
            var post = req.body;
            console.info("POST: ", post);
            redis_connector.set(req_username, post);
            // take coordinates and post to redis DB
            /*
            for (node in post) {
                console.info(post[node].name, post[node].x, post[node].y)
                redis_connector.set(req_username, (post[node].name, post[node].x, post[node].y))
            }
            */
            res.status(200).send("Alles ok");
        }
        else {
            res.status(401).send("Forbidden");
        }

        
    });
        
    
    //console.log("Posted Nodes");

};

function createMap(data){
    return spawn('python', [ 
      use_path.join("./", 'heatmapper.py'),
      data
    ]);
  }

app.get("/usr", (req, res) => {
    // check if request, cookies and session id are provided
    if(!req || !req.cookies || !req.cookies["SESSION"]) {
        res.status(401).send("Forbidden");
        return;
    }

    const cookie = req.cookies["SESSION"];  // session id

    // request valid session ids
    request("http://server:3030/sessions", function (error, response, body) {

        valid_sessions = JSON.parse(body);
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.

        var session_found = false; // indicating whether given cookie session id is valid

        // check if session id is in list of valid ids
        for (s in valid_sessions) {
            if (valid_sessions[s].sessionID == cookie) {
                req_username = valid_sessions[s].username
                session_found = true;
            }
        }

        if(session_found) 
            res.status(200).send(req_username);
        else
            res.status(401).send("Forbidden");
    });
});

function provideOutput(output, nodes, username) {
    sensor_number = output["results"][0]["series"][0]["values"][0][1]
    value = output["results"][0]["series"][0]["values"][0][4]

    var i = output["results"][0]["series"][0]["values"].length -1;
    var output_len = output["results"][0]["series"][0]["values"].length;

    data = new Array();
    while (i >= output_len-nodes.length) {
        sensor_number = output["results"][0]["series"][0]["values"][i][1]
        value = output["results"][0]["series"][0]["values"][i][4]
        var x = -1;
        var y = -1;
        for (j in nodes) {
            console.info("Node in iteration: ", nodes[j]["name"])
            console.info("Real Node: Node"+sensor_number)
            if (nodes[j]["name"] === "Node"+sensor_number) {
                x = nodes[j]["x"]
                y = nodes[j]["y"]
                data.push({"x": x, "y": y, "val": value})
                console.info(x)
                console.info(y)
                break;
            }
        }
        i = i-1;
    }
    var currentDate = new Date();
    var minutes = currentDate.getMinutes();
    var hours = currentDate.getHours();
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var timestamp = year +"-"+ (month+1) +"-"+ date +" "+ hours + ":" + minutes;

    json_res = {"time": timestamp, "user": username, "data": data}
    return json_res;
}

app.get("/query", (req, res) => {

    // check if request, cookies and session id are provided
    if(!req || !req.cookies || !req.cookies["SESSION"]) {
        res.status(401).send("Forbidden");
        return;
    }

    var output;

    console.log("Session key of requester:", req.cookies["SESSION"]);
    const cookie = req.cookies["SESSION"];  // session id
    const sensor_type = req.query.type; //sensor type (sunlight,wind,humidity)
    //console.log(sensor_type);

    // request valid session ids
    request("http://server:3030/sessions", function (error, response, body) {

        valid_sessions = JSON.parse(body);
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.

        var session_found = false; // indicating whether given cookie session id is valid

        // check if session id is in list of valid ids
        for (s in valid_sessions) {
            if (valid_sessions[s].sessionID == cookie) {
                req_username = valid_sessions[s].username
                session_found = true;
            }
        }
        if (session_found == true) {
            console.log("Cookie is valid");
        }
        else {
            console.log("Invalid Session ID");
            res.status(401).send("Forbidden");
            return;
        }

        console.log("Username belonging to Session key:", req_username);
        if (sensor_type === "forecast") {

            redis_connector.get(req_username)

            .then(nodes => {
                output = JSON.parse(nodes)
                console.info("Nodes: ", output)
            })
            client.query(req_username)
            // request all entries
            .then(val => {
                output = JSON.stringify(val, null, 4);
                console.info(output)
                // write data to file
                const filename = './' + req_username + '_forecast.dat'
                fs.writeFileSync(filename, output)
                //createMap(filename)   
            }).then(
                    nodes = redis_connector.get(req_username))
                    console.info(nodes)
            .catch(console.error); 
        }
        
        // specified query about sensor type
        else {
            var nodes;
            var json_output;

            client.query(req_username)
        
            .where('type', sensor_type)
            .then(val => {
                nodes = redis_connector.get(req_username)
                output = JSON.stringify(val, null, 4);
                console.info("Output: ", output)
            })
            .then(positions => {
                console.info(nodes)
                json_output = provideOutput(JSON.parse(output), positions, req_username)
                console.info(json_output)
                // write data to file
                const filename = './' + req_username + '_' + sensor_type + '.json'
                fs.writeFileSync(filename, json_output)
            });
            
            
        }
    });
});

router.get("/values", function(req,res){})
router.get("/nodes", function(req,res){})
app.use(bodyParser.json());
app.use("/values", postToDB);
app.use("/nodes", postNodes);

//app.listen(3000, () => console.log('Server Started'))



if (NO_SSL_ACTIVE === "1") {
    const httpServer = http.createServer(app);
    httpServer.listen(PORT);
    console.log("External NO_SSL express server listening on http://localhost:" + PORT);
}
else if (SSL_ACTIVE === "0") {
    console.log("External NO_SSL express server disabled.");
}
if (SSL_ACTIVE === "1" && credentials != null) {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(SSL_PORT);
    console.log("External SSL express server listening on https://localhost:" + SSL_PORT);
}
else if (SSL_ACTIVE === "0") {
    console.log("External SLL express server disabled.");
}
else {
    console.log("External SSL express server failed to initialize certificates.");
    console.log("External SSL express server disabled.");
}