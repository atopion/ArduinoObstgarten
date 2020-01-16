import express = require("express");

import compression = require("compression");
import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import fs = require('fs');
import http = require('http');
import https = require('https');

import libcrypto = require("./libcrypto");
import redis = require("./libredis");

const app: express.Application = express();
const intern: express.Application = express();

const PORT = 3000;
const SSL_PORT = 3043;
const INTERN_PORT = 3030;
const FOLDER_LOGIN = '/dist/Login/www';
const FOLDER_PAGE  = '/dist/ArduinoObstgarten/www';
const SSL_FOLDER = '/cert';

const SSL_ACTIVE = process.env.SSL_ACTIVE || "0";

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

var sessions: Map<string, string> = new Map();

let credentials = null;
/* SSL ? */
if(SSL_ACTIVE === "1") {
    const privateKey  = fs.readFileSync(SSL_FOLDER + '/privkey1.pem', 'utf8');
    const certificate = fs.readFileSync(SSL_FOLDER + '/fullchain1.pem', 'utf8');

    credentials = {key: privateKey, cert: certificate};
}

/* Helpers */

function isLoggedIn(req: express.Request): boolean {
    if(!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return false;
    let hit: boolean = false;
    sessions.forEach((value, key, map) => {
        if(value === req.cookies["SESSION"])
            hit = true;
    });
    return hit;
}

function getUserForSession(req: express.Request): string | null {
    if(!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return null;
    sessions.forEach((value, key) => {
        if(value === req.cookies["SESSION"])
            return key;
    });
    return null;
}

function generateSession(): string {
    let res: string = '';
    for(let i = 1; i <= 48; i++)
        res += (Math.floor(Math.random() * 16)).toString(16) + (i % 8 === 0 && i !== 48 ? '-' : '');
    return res;
}

function sessionLogout(req: express.Request): boolean {
    if(!req.cookies["SESSION"] || req.cookies["SESSION"] === "")
        return false;
    let k: string | null = null;
    sessions.forEach((value, key, map) => {
        if(value === req.cookies["SESSION"])
            k = key;
    });
    if(!k)
        return false;
    sessions.delete(k);
    return true;
}

function sessionsAsString(): string {
    let arr: Array<{username: string, sessionID: string}> = [];
    sessions.forEach((value, key) => {
        arr.push({username: key, sessionID: value});
    });
    return JSON.stringify(arr);
}

function user_exists_check(user: string, res: express.Response, cb?: (val: boolean) => void) {
    redis.users.exists(user).then(val => {
        if(!val) {
            res.status(404).send("User not found");
        } else {
            res.status(200).send("User found");
        }
        if(cb)
            cb(val);
    }).catch(e => {
        res.status(500).send("Server error");
    });
}

function user_exists_generate(user: string, res: express.Response, cb: (small_a: bigint, big_a: bigint) => void) {
    redis.users.exists(user).then(val => {
        if(val) {
            res.status(401).send("Forbidden");
            return;
        }

        let small_a: bigint = libcrypto.generate_small_a();
        let big_a: bigint = libcrypto.calculate_big_a(small_a);

        redis.users.set(user, {
            small_a: small_a.toString(16),
            big_a: big_a.toString(16),
            k: ""
        }).then(val => {
            cb(small_a, big_a);
        }).catch(e => {
            res.status(500).send("Server error");
        })
    })
}

function user_exists_get(user: string, res: express.Response, cb: (val: string) => void) {
    redis.users.exists(user).then(val => {
        if(!val) {
            res.status(401).send("Forbidden");
            return;
        }
        redis.users.get(user).then(val => {
            if(!val) {
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
app.use(function (req: express.Request, res: express.Response, next) {
    console.log(
        "[", new Date(Date.now()).toUTCString(),
        "]: Request from", req.connection.remoteAddress,
        ", Method:", req.method,
        ", Path:", req.path,
        req.method.toLowerCase() === "post" ? ", Post parameters:" : "", req.method.toLowerCase() === "post" ? req.body : "",
        ", Session: ", req.cookies["SESSION"]);
    next();
});

/* Server code */
app.get('*.*', (req: express.Request, res: express.Response) => {
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

app.options('/create', (req: express.Request, res: express.Response) => {
    if(!req || !req.query || !req.query.user) {
        res.status(401).send("Forbidden");
        return;
    }
    let user = req.query.user;

    if(req.query.try) {
        user_exists_check(user, res);
    } else {
        user_exists_generate(user, res, ((small_a, big_a) => {
            res.status(201).json({
                small_a: small_a.toString(10),
                big_a: big_a.toString(10),
                G: libcrypto.G.toString(10),
                P: libcrypto.P.toString(10)
            });
        }))
    }
});

app.post('/create', (req: express.Request, res: express.Response) => {
    if(!req || !req.body || !req.body.user || !req.body.pass) {
        res.status(401).send("Forbidden");
        return;
    }

    let user = req.body.user;
    let pass = req.body.pass;

    user_exists_get(user, res, (val: string) => {
        let v: any = JSON.parse(val);
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

app.post('/usr', (req: express.Request, res: express.Response) => {
    if(!req || !req.body || !req.body.user || !req.body.pass) {
        res.status(401).send("Forbidden");
        return;
    }
    let usr: string = req.body.user;
    let pass: bigint = BigInt("0x" + req.body.pass);

    user_exists_get(usr, res, (val: string) => {
        let v: any = JSON.parse(val);
        let small_a: bigint = BigInt("0x" + v.small_a);
        let k: bigint = BigInt("0x" + v.k);

        let passkey: bigint = libcrypto.calculate_key_from_big_b(pass, small_a);

        if(libcrypto.compare(passkey, k)) {
            let ses;
            if(sessions.has(usr)) {
                ses = sessions.get(usr);
            } else {
                ses = generateSession();
                sessions.set(usr, ses);
            }
            res.cookie("SESSION", ses, { maxAge: 1800000, expires: new Date(Date.now() + 1800000) });
            res.redirect(303, '/');
        } else {
            res.status(401).send("Forbidden");
        }
    })
});

app.post('/logout', (req: express.Request, res: express.Response) => {
    if(!isLoggedIn(req)) {
        res.status(401).send("Forbidden");
    } else if(sessionLogout(req)) {
        res.status(200).send("Logged out");
    } else {
        res.status(401).send("Forbidden");
    }
});

app.options('/usr', (req: express.Request, res: express.Response) => {
    res.status(200).json({P: libcrypto.P.toString(16), G: libcrypto.G.toString(16)});
});

if(SSL_ACTIVE === "1" && credentials != null) {
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(PORT);
    httpsServer.listen(SSL_PORT);
}
else {
    if(SSL_ACTIVE === "0") {
        app.listen(PORT, () => {
            console.log("External Express server listening on http://localhost:" + PORT);
        });
    }
    else {
        console.log("SSL Server failed to initialize certificates.");
        app.listen(PORT, () => {
            console.log("External Express server listening on http://localhost:" + PORT);
        });
    }
}

intern.get('/sessions', (req: express.Request, res: express.Response) => {
    res.status(200).send(sessionsAsString());
});

intern.listen(INTERN_PORT, () => {
    console.log("Internal Express server listening on http://localhost:" + INTERN_PORT);
});
