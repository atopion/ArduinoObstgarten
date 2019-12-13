const express = require('express');
const compression = require("compression");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const fs = require('fs');

const app = express();

const PORT = 3000;
const FOLDER_LOGIN = '../Login/www';
const FOLDER_PAGE  = '../ArduinoObstgarten/www';

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(cookieParser);

var sessions = new Map();

function isLoggedIn(req) {
    if(!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return false;
    let hit = false;
    sessions.forEach((value, key, map) => {
        if(value === req.cookies["SESSION"])
            hit = true;
    });
    return hit;
}

function generateSession() {
    let res = '';
    for(let i = 1; i <= 48; i++)
        res += (Math.floor(Math.random() * 16)).toString(16) + (i % 8 === 0 && i !== 48 ? '-' : '');
    return res;
}

function sessionsAsString() {
    let arr = [];
    sessions.forEach((value, key, map) => {
        arr.push({username: key, sessionID: value});
    });
    return JSON.stringify(arr);
}

app.get('*.*', (req, res) => {
    let folder = isLoggedIn(req) ? FOLDER_PAGE : FOLDER_LOGIN;
    if(fs.existsSync(folder + req.path))
        res.status(200).sendFile(req.path, {root: folder});
    else
        res.status(404).send("Not found");
    console.log(req.path);
});

app.get('*', (req, res) => {
    let folder = isLoggedIn(req) ? FOLDER_PAGE : FOLDER_LOGIN;
    res.status(200).sendFile('/', {root: folder});
});

app.post('/usr', (req, res) => {
    // TODO Authenticate
    
    let usr = req.body.user;
    if(sessions.has(usr)) {
        res.cookie("SESSION", sessions.get(usr), { maxAge: 1800000 });
        console.log("HAS");
        res.redirect(303, '/');
        return;
    }

    let ses = generateSession();
    sessions.set(usr, ses);
    console.log("HAS NOT: ", ses);
    res.cookie("SESSION", ses, { maxAge: 1800000 });
    
    res.redirect(303, '/');
});

app.post('/local', (req, res) => {
    if(!req.connection.remoteAddress.endsWith('127.0.0.1')) {
        res.status(405).send("Forbidden");
        return;
    }
    else {
        res.status(200).send(sessionsAsString());
    }
});

app.listen(PORT, () => {
    console.log("Node Express server for " + app.name + " listening on http://localhost:" + PORT);
});
