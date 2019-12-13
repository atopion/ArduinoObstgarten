const express = require('express');
const compression = require("compression");
const bodyParser = require("body-parser");

const app = express();

const PORT = 3000;
const FOLDER_LOGIN = '../Login/www';
const FOLDER_PAGE  = '../ArduinoObstgarten/www';

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var loggedIn = false;
var staticServer = express.static(FOLDER_LOGIN, {maxAge: '1y'});
var control = (req, res, next) => {
    if(loggedIn)
        staticServer = express.static(FOLDER_PAGE, {maxAge: '1y'});
    else
        staticServer = express.static(FOLDER_LOGIN, {maxAge: '1y'});
    next();
}

app.use(control);

app.get('*.*', staticServer);

app.get('*', (req, res) => {
    if(loggedIn)
        res.status(200).sendFile(`/`, {root: FOLDER_PAGE});
    else
        res.status(200).sendFile(`/`, {root: FOLDER_LOGIN});
});

app.post('/usr', (req, res) => {
    loggedIn = !loggedIn;
});

app.listen(PORT, () => {
    console.log("Node Express server for " + app.name + " listening on http://localhost:" + PORT);
});
