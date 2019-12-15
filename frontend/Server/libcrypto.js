"use strict";
/*
 *  Crypto library for our version of Diffie-Hellman.
 *  Used for save key storage and transmission.
 *
 *  created by Timon Vogt, 13.12.19
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
/* Fixed parameters */
exports.P = 0x241c4bb10f639324a55b4633ae586a5d0d79c78d66bdf2602dd3333595f2980cb3ea346c002963839457ffab71f2068f827b027afc4de487eb47ec52962b92d81dfd947775412d835eacd02e6c609c9c36faea0aa50acc009369efc549ee7b3da7388d4529d37460a477d6952ba97287bf09955db4a0d33c12564da7c43196b2057ed8ed7985a349122676392d10480f84c01d1254a125fd618436c5792c3fe5d422ea001b6c42efd72018e7d6de496586c91935818b287d2258634781692bc8a7d4b4882a395c9a1aa62386b7e1f90824d5ab0fe0e887575cb6784dbd9bf3cac0ba67357264b139782e357fe748fc32cb909aef85be91dc876394f27d4046874ed6f38ec95e408c4381ff15df8c77c69fa8924c2c4107d4255ef2fabae018d4897d421a02e71a6d3b9ff25b9a389d01b67c7e0d0926b4525f027facf2c7f504bb4759f3b803a3fb6e5ab6face06a9ef5d6ea967e628e35c405994d64a16e75ee423e8dde8589199b42873970e9a884ca3d12b1e90f9277138efa7da02dd0977a1355f2df4dada8f38cf68fcd0baddead81c7a3450be0314a0a00dbd0264ca4ff2ddcff600a6896e12fb2ac84c418a9030b7527d0c7499ab59972cad9e5a5bf799c6e02dc9d3024c4da1b810e3ffbb4d2981c02c9be4d74a9bab29a9791ff2c3b626689043afc6878dd26a9d79d08fc22cd672dcc7bfe278f9dde83a87f70012d0f534b725a1e38bd8b6f81d7f632d346832ef399eb46957088f5bfa3a010313e79f6c3c610fa554e44f9da33e1ce8f8e17cc4db63d0bcf5845fbb296489be68ff1972d792d7056fdbc18200461f8c63f091d82c20a1fc4990aa37f7f6d3c71553ad7542cf6d72294da9e63b8889ca2d514b97f1469d29bf26227dbf38d722abb402ae803f6da335facd3ef738daff78cbf3dec7cf1c42c2d76d92991e9c686fe455681df93811cb4aff74d5ae24f98c6ca2d6b219136f7d782f632bfff085c7780948d906334d4290d689bcbf9a6f36b6365b1e4bb2c7eb767459086911985aaf9ae3525860e8cab905346eb26b9f861901d32cfde97c240292bb7b67a8a95764f156149f0657d588b401d3e4e00e51b59ad243fdd2909c47330b2509b7ea6af0cf7baa1355a27a2a48991d26ae987a000329ccb7ef6d90a769e8666c1a5c9fa240017e981cf146b112bd9d157c21e733fe219b96473f06e5d06d335c31baf5eacbe79d169769a663f547bdc3c3b2fc367e8903b68dce9b16b4b3df87e1c205cf8a65a61ffc66ad0c2e2dae26ff2361a0c6743f38cdd1e08ce5c69370e9c186dbf6ac125a039a7849e25983fe47d6dfd1ecca405f3d5b322132e62ff30bf840f4fdb9f86af0cd0d15e64e65127ed122dc4b905f4a3671ae06d41f615fa679f0a956d5b50198efee8b3baf1f6d05335ad7d52ec06749cd632d63b2f00c888a41n;
exports.G = 0x120e25d887b1c99252ada319d72c352e86bce3c6b35ef93016e9999acaf94c0659f51a360014b1c1ca2bffd5b8f90347c13d813d7e26f243f5a3f6294b15c96c0efeca3bbaa096c1af56681736304e4e1b7d75055285660049b4f7e2a4f73d9ed39c46a294e9ba30523beb4a95d4b943df84caaeda50699e092b26d3e218cb5902bf6c76bcc2d1a489133b1c96882407c2600e892a5092feb0c21b62bc961ff2ea1175000db62177eb900c73eb6f24b2c3648c9ac0c5943e912c31a3c0b495e453ea5a44151cae4d0d5311c35bf0fc84126ad587f07443abae5b3c26decdf9e5605d339ab932589cbc171abff3a47e1965c84d77c2df48ee43b1ca793ea02343a76b79c764af204621c0ff8aefc63be34fd44926162083ea12af797d5d700c6a44bea10d01738d369dcff92dcd1c4e80db3e3f0684935a292f813fd67963fa825da3acf9dc01d1fdb72d5b7d670354f7aeb754b3f31471ae202cca6b250b73af7211f46ef42c48ccda1439cb874d442651e8958f487c93b89c77d3ed016e84bbd09aaf96fa6d6d479c67b47e685d6ef56c0e3d1a285f018a505006de81326527f96ee7fb005344b7097d95642620c548185ba93e863a4cd5accb9656cf2d2dfbcce37016e4e9812626d0dc0871ffdda694c0e0164df26ba54dd594d4bc8ff961db13344821d7e343c6e9354ebce847e1166b396e63dff13c7ceef41d43fb8009687a9a5b92d0f1c5ec5b7c0ebfb1969a3419779ccf5a34ab8447adfd1d008189f3cfb61e3087d2aa7227ced19f0e747c70be626db1e85e7ac22fdd94b244df347f8cb96bc96b82b7ede0c100230fc631f848ec161050fe24c8551bfbfb69e38aa9d6baa167b6b914a6d4f31dc444e516a8a5cbf8a34e94df93113edf9c6b9155da0157401fb6d19afd669f7b9c6d7fbc65f9ef63e78e21616bb6c94c8f4e3437f22ab40efc9c08e5a57fba6ad7127cc636516b590c89b7bebc17b195fff842e3bc04a46c8319a6a1486b44de5fcd379b5b1b2d8f25d963f5bb3a2c843488cc2d57cd71a92c3074655c829a375935cfc30c80e9967ef4be1201495dbdb3d454abb278ab0a4f832beac45a00e9f2700728dacd6921fee9484e2399859284dbf5357867bdd509aad13d15244c8e93574c3d000194e65bf7b6c853b4f433360d2e4fd12000bf4c0e78a358895ece8abe10f399ff10cdcb239f8372e83699ae18dd7af565f3ce8b4bb4d331faa3dee1e1d97e1b3f4481db46e74d8b5a59efc3f0e102e7c532d30ffe3356861716d7137f91b0d0633a1f9c66e8f04672e349b874e0c36dfb56092d01cd3c24f12cc1ff23eb6fe8f665202f9ead9910997317f985fc207a7edcfc357866868af32732893f68916e25c82fa51b38d7036a0fb0afd33cf854ab6ada80cc77f7459dd78fb68299ad6bea976033a4e6b196b1d97806444520n;
/* Helpers */
function bufToBn(buf) {
    let hex = [];
    let u8 = Uint8Array.from(buf);
    u8.forEach(function (i) {
        var h = i.toString(16);
        if (h.length % 2) {
            h = '0' + h;
        }
        hex.push(h);
    });
    return BigInt('0x' + hex.join(''));
}
function modPow(base, exponent, modulus) {
    if (modulus === 1n)
        return 0n;
    //Assert :: (modulus - 1) * (modulus - 1) does not overflow base
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n == 1n)
            result = (result * base) % modulus;
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}
function generate_small_a() {
    try {
        let buf = Uint8Array.from(crypto.randomBytes(256));
        return bufToBn(buf);
    }
    catch (ex) {
        console.error("Could not create random bytes: ", ex);
        return BigInt(0);
    }
}
exports.generate_small_a = generate_small_a;
function calculate_big_a(small_a) {
    return modPow(exports.G, small_a, exports.P);
    //return (G ** small_a) % P;
    //return BigInt(bigInt(G.toString(10)).modPow(small_a.toString(10), P.toString(10)).toString(16));
}
exports.calculate_big_a = calculate_big_a;
function calculate_big_b(small_b) {
    return modPow(exports.G, small_b, exports.P);
    //return (G ** small_b) % P;
    //return BigInt(bigInt(G.toString(10)).modPow(small_b.toString(10), P.toString(10)).toString(16));
}
exports.calculate_big_b = calculate_big_b;
function calculate_key_from_big_a(big_a, small_b) {
    return modPow(big_a, small_b, exports.P);
    //return (big_a ** small_b) % P;
    //return BigInt(bigInt(big_a.toString(10)).modPow(small_b.toString(10), P.toString(10)).toString(16));
}
exports.calculate_key_from_big_a = calculate_key_from_big_a;
function calculate_key_from_big_b(big_b, small_a) {
    return modPow(big_b, small_a, exports.P);
    //return (big_b ** small_a) % P;
    //return BigInt(bigInt(big_b.toString(10)).modPow(small_a.toString(10), P.toString(10)).toString(16));
}
exports.calculate_key_from_big_b = calculate_key_from_big_b;
/* Cryptographically strong comparing algorithm, constant timed
*
*  compare(..) ensures that its computation time does only depend on the
*  test_key and not on the saved_key, to protect against time attacks.
*/
function compare(test_key, saved_key) {
    let result = true;
    let t = test_key.toString(16);
    let s = saved_key.toString(16);
    for (let i = 0; i < t.length; i++)
        if (t.charAt(i) !== s.charAt(i))
            result = false;
    return result;
}
exports.compare = compare;
