"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const libcrypto = require("./libcrypto");
const redis = require("./libredis");
const app = express();
const intern = express();
const PORT = 3000;
const INTERN_PORT = 3030;
const FOLDER_LOGIN = '/dist/Login/www';
const FOLDER_PAGE = '/dist/ArduinoObstgarten/www';
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
var sessions = new Map();
/* Helpers */
function isLoggedIn(req) {
    if (!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return false;
    let hit = false;
    sessions.forEach((value, key, map) => {
        if (value === req.cookies["SESSION"])
            hit = true;
    });
    return hit;
}
function getUserForSession(req) {
    if (!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return null;
    sessions.forEach((value, key) => {
        if (value === req.cookies["SESSION"])
            return key;
    });
    return null;
}
function generateSession() {
    let res = '';
    for (let i = 1; i <= 48; i++)
        res += (Math.floor(Math.random() * 16)).toString(16) + (i % 8 === 0 && i !== 48 ? '-' : '');
    return res;
}
function sessionLogout(req) {
    if (!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return false;
    let k = null;
    sessions.forEach((value, key, map) => {
        if (value === req.cookies["SESSION"])
            k = key;
    });
    if (!k)
        return false;
    sessions.delete(k);
    return true;
}
function sessionsAsString() {
    let arr = [];
    sessions.forEach((value, key) => {
        arr.push({ username: key, sessionID: value });
    });
    return JSON.stringify(arr);
}
function user_exists_check(user, res, cb) {
    redis.users.exists(user).then(val => {
        if (!val) {
            res.status(404).send("User not found");
        }
        else {
            res.status(200).send("User found");
        }
        if (cb)
            cb(val);
    }).catch(e => {
        res.status(500).send("Server error");
    });
}
function user_exists_generate(user, res, cb) {
    redis.users.exists(user).then(val => {
        if (val) {
            res.status(401).send("Forbidden");
            return;
        }
        let small_a = libcrypto.generate_small_a();
        let big_a = libcrypto.calculate_big_a(small_a);
        redis.users.set(user, {
            small_a: small_a.toString(16),
            big_a: big_a.toString(16),
            k: ""
        }).then(val => {
            cb(small_a, big_a);
        }).catch(e => {
            res.status(500).send("Server error");
        });
    });
}
function user_exists_get(user, res, cb) {
    redis.users.exists(user).then(val => {
        if (!val) {
            res.status(401).send("Forbidden");
            return;
        }
        redis.users.get(user).then(val => {
            if (!val) {
                res.status(401).send("Forbidden");
                return;
            }
            cb(val);
        }).catch(e => {
            console.error(e);
            res.status(500).send("Server error");
        });
    });
}
/* Logger */
app.use(function (req, res, next) {
    console.log("[", new Date(Date.now()).toUTCString(), "]: Request from", req.connection.remoteAddress, ", Method:", req.method, ", Path:", req.path, req.method.toLowerCase() === "post" ? ", Post parameters:" : "", req.method.toLowerCase() === "post" ? req.body : "", ", Session: ", req.cookies["SESSION"]);
    next();
});
/* Server code */
app.get('*.*', (req, res) => {
    let folder = isLoggedIn(req) ? FOLDER_PAGE : FOLDER_LOGIN;
    if (fs.existsSync(folder + req.path))
        res.status(200).sendFile(req.path, { root: folder });
    else
        res.status(404).send("Not found");
    console.log(req.path);
});
app.get('*', (req, res) => {
    let folder = isLoggedIn(req) ? FOLDER_PAGE : FOLDER_LOGIN;
    res.status(200).sendFile('/', { root: folder });
});
app.options('/create', (req, res) => {
    if (!req || !req.query || !req.query.user) {
        res.status(401).send("Forbidden");
        return;
    }
    let user = req.query.user;
    if (req.query.try) {
        user_exists_check(user, res);
    }
    else {
        user_exists_generate(user, res, ((small_a, big_a) => {
            res.status(201).json({
                small_a: small_a.toString(10),
                big_a: big_a.toString(10),
                G: libcrypto.G.toString(10),
                P: libcrypto.P.toString(10)
            });
        }));
    }
});
app.post('/create', (req, res) => {
    if (!req || !req.body || !req.body.user || !req.body.pass) {
        res.status(401).send("Forbidden");
        return;
    }
    let user = req.body.user;
    let pass = req.body.pass;
    user_exists_get(user, res, (val) => {
        let v = JSON.parse(val);
        redis.users.set(user, {
            small_a: v.small_a.toString(16),
            big_a: v.big_a.toString(16),
            k: pass
        }).then(val => {
            res.redirect(303, '/');
            return;
        }).catch(e => {
            res.status(500).send("Server error");
            return;
        });
    });
});
app.post('/usr', (req, res) => {
    if (!req || !req.body || !req.body.user || !req.body.pass) {
        res.status(401).send("Forbidden");
        return;
    }
    let usr = req.body.user;
    let pass = BigInt("0x" + req.body.pass);
    user_exists_get(usr, res, (val) => {
        let v = JSON.parse(val);
        let small_a = BigInt("0x" + v.small_a);
        let k = BigInt("0x" + v.k);
        let passkey = libcrypto.calculate_key_from_big_b(pass, small_a);
        if (libcrypto.compare(passkey, k)) {
            let ses;
            if (sessions.has(usr)) {
                ses = sessions.get(usr);
            }
            else {
                ses = generateSession();
                sessions.set(usr, ses);
            }
            res.cookie("SESSION", ses, { maxAge: 1800000, expires: new Date(Date.now() + 1800000) });
            res.redirect(303, '/');
        }
        else {
            res.status(401).send("Forbidden");
        }
    });
});
app.post('/logout', (req, res) => {
    if (!isLoggedIn(req)) {
        res.status(401).send("Forbidden");
    }
    else if (sessionLogout(req)) {
        res.status(200).send("Logged out");
    }
    else {
        res.status(401).send("Forbidden");
    }
});
app.options('/usr', (req, res) => {
    res.status(200).json({ P: libcrypto.P.toString(16), G: libcrypto.G.toString(16) });
});
app.listen(PORT, () => {
    console.log("External Express server listening on http://localhost:" + PORT);
});
intern.get('/sessions', (req, res) => {
    res.status(200).send(sessionsAsString());
});
intern.listen(INTERN_PORT, () => {
    console.log("Internal Express server listening on http://localhost:" + INTERN_PORT);
});
