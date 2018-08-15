const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
var csv = require("fast-csv")
const fs = require("fs")
const path = require("path")
const csvStream = csv.format({headers: true});

// 根据batch数来产生地址
function batch_addresses(phrase ,batch, num, bit_type, folder_path)
{
    const start = (batch - 1) * num;
    const stop = batch * num;
    bit_type = 0;

    csvStream
        .pipe(fs.createWriteStream(path.resolve(folder_path, "batch" + batch + "_" + start + "to" + stop +".csv")))
        .on("end", process.exit);

    for(let i = start; i< stop; i++)
    {
        key_path = 'm/44' + '\'' + '/' + bit_type +'\'/' + '0' + '\'' + '/' + '0' + '/' + i ;
        address = btc_mnemonic_toaddress(phrase, i);
        csvStream.write([["batch", batch],["bit_type", bit_type],["id", i],["address", address],["key_path", key_path]]);
    }

    csvStream.end();
}

// 根据助记词来生成所有的地址
function btc_mnemonic_to_address(mnem, index) {
    // show the bip32 root key
    console.log("---------------------------root key-------------------------------------")
    let seedBuffer = bip39.mnemonicToSeed(mnem)
    let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer)
    console.log(masterNode.toBase58())

    // Deriving the first account based on BIP44
    console.log("-------------------------------xpub------------------------------------")
    let account0 = masterNode.derivePath("m/44'/0'/0'")
    let xpubString = account0.neutered().toBase58()
    console.log(xpubString)

    // from priv and from the Xpub
    console.log("\n")
    console.log("-----------------------------from the priv and from the xpub------------------------------")
    let key0 = account0.derivePath("0/0").keyPair
    let key0FromXpub = account0.neutered().derive(0).derive(index).keyPair
    //console.log(key0)
    //console.log(key0FromXpub)
    //let address0 = key0.getAddress()
    let address0FromXpub = key0FromXpub.getAddress() 
    return address0FromXpub;
}

// 通过xpub来产生助记词
function btc_xpub_to_address(xpub, index) {
    let address0FromXpub = bitcoin.HDNode.fromBase58(xpub);
    let address = address0FromXpub.derive(0).derive(index).keyPair.getAddress();
    return address;
}


// 通过助记词产生xpub
function mnemonic_to_xpub(mnem) {
    let seedBuffer = bip39.mnemonicToSeed(mnem)
    let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer)

    let account0 = masterNode.derivePath("m/44'/0'/0'")
    let xpubString = account0.neutered().toBase58()   
    return xpubString;
}


module.exports = {
    batch_addresses,
    btc_mnemonic_to_address,
    btc_xpub_to_address,
    mnemonic_to_xpub
}