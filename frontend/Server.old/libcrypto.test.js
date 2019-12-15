const crypto = require('crypto');
const bigintCryptoUtils = require('bigint-crypto-utils');

const num = BigInt('0x241c4bb10f639324a55b4633ae586a5d0d79c78d66bdf2602dd3333595f2980cb3ea346c002963839457ffab71f2068f827b027afc4de487eb47ec52962b92d81dfd947775412d835eacd02e6c609c9c36faea0aa50acc009369efc549ee7b3da7388d4529d37460a477d6952ba97287bf09955db4a0d33c12564da7c43196b2057ed8ed7985a349122676392d10480f84c01d1254a125fd618436c5792c3fe5d422ea001b6c42efd72018e7d6de496586c91935818b287d2258634781692bc8a7d4b4882a395c9a1aa62386b7e1f90824d5ab0fe0e887575cb6784dbd9bf3cac0ba67357264b139782e357fe748fc32cb909aef85be91dc876394f27d4046874ed6f38ec95e408c4381ff15df8c77c69fa8924c2c4107d4255ef2fabae018d4897d421a02e71a6d3b9ff25b9a389d01b67c7e0d0926b4525f027facf2c7f504bb4759f3b803a3fb6e5ab6face06a9ef5d6ea967e628e35c405994d64a16e75ee423e8dde8589199b42873970e9a884ca3d12b1e90f9277138efa7da02dd0977a1355f2df4dada8f38cf68fcd0baddead81c7a3450be0314a0a00dbd0264ca4ff2ddcff600a6896e12fb2ac84c418a9030b7527d0c7499ab59972cad9e5a5bf799c6e02dc9d3024c4da1b810e3ffbb4d2981c02c9be4d74a9bab29a9791ff2c3b626689043afc6878dd26a9d79d08fc22cd672dcc7bfe278f9dde83a87f70012d0f534b725a1e38bd8b6f81d7f632d346832ef399eb46957088f5bfa3a010313e79f6c3c610fa554e44f9da33e1ce8f8e17cc4db63d0bcf5845fbb296489be68ff1972d792d7056fdbc18200461f8c63f091d82c20a1fc4990aa37f7f6d3c71553ad7542cf6d72294da9e63b8889ca2d514b97f1469d29bf26227dbf38d722abb402ae803f6da335facd3ef738daff78cbf3dec7cf1c42c2d76d92991e9c686fe455681df93811cb4aff74d5ae24f98c6ca2d6b219136f7d782f632bfff085c7780948d906334d4290d689bcbf9a6f36b6365b1e4bb2c7eb767459086911985aaf9ae3525860e8cab905346eb26b9f861901d32cfde97c240292bb7b67a8a95764f156149f0657d588b401d3e4e00e51b59ad243fdd2909c47330b2509b7ea6af0cf7baa1355a27a2a48991d26ae987a000329ccb7ef6d90a769e8666c1a5c9fa240017e981cf146b112bd9d157c21e733fe219b96473f06e5d06d335c31baf5eacbe79d169769a663f547bdc3c3b2fc367e8903b68dce9b16b4b3df87e1c205cf8a65a61ffc66ad0c2e2dae26ff2361a0c6743f38cdd1e08ce5c69370e9c186dbf6ac125a039a7849e25983fe47d6dfd1ecca405f3d5b322132e62ff30bf840f4fdb9f86af0cd0d15e64e65127ed122dc4b905f4a3671ae06d41f615fa679f0a956d5b50198efee8b3baf1f6d05335ad7d52ec06749cd632d63b2f00c888a41');

console.log((num / 2n).toString(16));


/* Bytes to hex String */
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function bufToBn(buf) {
  var hex = [];
  u8 = Uint8Array.from(buf);

  u8.forEach(function (i) {
    var h = i.toString(16);
    if (h.length % 2) { h = '0' + h; }
    hex.push(h);
  });

  return BigInt('0x' + hex.join(''));
}

const generate_random = function() {
    try {
        let buf = crypto.randomBytes(1024);
        const res = bufToBn(buf);
        return res;
    } catch (ex) {
        console.error("Could not create random bytes: ", ex);
	return 0;
    }
}

const test_prime = async function() {
    for(let i = 0; i < 100000; i++) {
	const num = generate_random();
	if(num === 0n)
	    continue;

	console.log("Testing number: ", i, "\r");
	if(await bigintCryptoUtils.isProbablyPrime(num)) {
	    console.log("Found: ", num.toString(16));
	    break;
	}
    }
}

//test_prime();
	
