
/*
 *  Crypto library for our version of Diffie-Hellman.
 *  Used for save key storage and transmission.
 *
 *  created by Timon Vogt, 13.12.19
 */

const crypto = require('crypto');

/* Fixed parameters */
const G = 1209345791241242839408234n;
const P = 12058333479012874023984733n;


const generate_small_a = function() {
    try {
        let buf = crypto.randomBytes(1024);
        const small_a = 0;
        return small_a;
    } catch (ex) {
        console.error("Could not create random bytes: ", ex);
    }

