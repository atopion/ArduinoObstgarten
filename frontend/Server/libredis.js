"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r = require("redis");
const redis_host = process.env.REDIS_HOST || "localhost";
const redis_port = process.env.REDIS_PORT || "5000";
// TODO: Change before deployment
const redis_pass = process.env.REDIS_PASS || "H232AiMZy1LdXH5DMsrsHKfKRxJFxgzVq3tJd4Ic6OPUuDU88i2gHlroqYfg7PNqSArlMU62bEETokghAhcZGCn6gMYN6s5pH0RBhQPIuLScuLnMyI6EfnSUnbIaJeeh";
class RedisConnector {
    constructor() {
        this.client = r.createClient({
            port: parseInt(redis_port),
            host: redis_host,
            password: redis_pass,
        });
    }
    set(key, value) {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (err) => {
                if (err) {
                    console.error("Saving data error: ", err);
                    reject(err);
                }
                else
                    resolve();
            });
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => {
                if (err) {
                    console.error("Retrieving data error: ", err);
                    reject(err);
                }
                else {
                    resolve(value);
                }
            });
        });
    }
    delete(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, response) => {
                if (err)
                    reject();
                else if (response == 1)
                    resolve();
                else
                    reject();
            });
        });
    }
    exists(key) {
        return new Promise((resolve, reject) => {
            this.client.exists(key, (err, reply) => {
                if (err)
                    resolve(false);
                else if (reply === 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    }
    static redisTEST() {
        (async function () {
            let r = new RedisConnector();
            await r.set("TEST", "Hello World");
            console.log("Set.");
            console.log("Result: ", await r.get("TEST"));
        })();
    }
}
exports.RedisConnector = RedisConnector;
exports.users = new RedisConnector();
