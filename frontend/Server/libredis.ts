import r = require("redis");

const redis_host = process.env.REDIS_HOST || "redis";
const redis_port = process.env.REDIS_PORT || "5000";
// TODO: Change before deployment
const redis_pass = process.env.REDIS_PASS || "r1bu3hnw3wt88gutatdc0qo6rmx19u50p1vnqzgpysytbtx9d8cw3rr3obixf7suczizq6xwxqpzck79";

export class RedisConnector
{
    private client = r.createClient({
        port    : parseInt(redis_port),
        host    : redis_host,
        password: redis_pass,
    });

    set(key: string, value: any)
    {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (err) => {
                if(err)
                {
                    console.error("Saving data error: ", err);
                    reject(err);
                }
                else
                    resolve();
            });
        });
    }

    get(key: string)
    {
        return new Promise<string>((resolve, reject) => {
            this.client.get(key, (err, value) => {
                if(err)
                {
                    console.error("Retrieving data error: ", err);
                    reject(err);
                }
                else
                {
                    resolve(value);
                }
            });
        });
    }

    delete(key: string)
    {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, response) => {
                if(err)
                    reject();
                else if(response == 1)
                    resolve();
                else
                    reject();
            })
        });
    }

    exists(key: string)
    {
        return new Promise<boolean>((resolve, reject) => {
            this.client.exists(key, (err, reply) => {
                if(err)
                    resolve(false);
                else if(reply === 1)
                    resolve(true);
                else
                    resolve(false);
            })
        })
    }

    static redisTEST()
    {
        (async function() {
            let r = new RedisConnector();
            await r.set("TEST", "Hello World");
            console.log("Set.");
            console.log("Result: ", await r.get("TEST"));
        })();
    }
}

export const users = new RedisConnector();
