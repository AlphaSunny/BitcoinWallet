const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')
var csv = require("fast-csv")
const fs = require("fs")
const path = require("path")
const csvStream = csv.format({headers: true});

//======================================
// 函数: 根据助记词来打印地址
// 参数: xpub            母公钥 
//      batch           批次
//      num             数量
//      bit_type        币的种类
//      folder_path     文件夹路径
// 返回：该母公钥对应的余额
//======================================
function mnemonic_print_addresses(phrase ,batch, num, bit_type, folder_path)
{
    const start = (batch - 1) * num;
    const stop = batch * num;

    csvStream
        .pipe(fs.createWriteStream(path.resolve(folder_path, "batch" + batch + "_" + start + "to" + (stop-1).toString() +".csv")))
        .on("end", process.exit);

    for(let i = start; i< stop; i++)
    {
        key_path = 'm/44' + '\'' + '/' + bit_type +'\'/' + '0' + '\'' + '/' + '0' + '/' + i ;
        address = mnemonic_to_address(phrase, i);
        csvStream.write([["batch", batch],["bit_type", bit_type],["id", i],["address", address],["key_path", key_path]]);
    }
}

//======================================
// 函数: 根据xpub来打印地址
// 参数: xpub            母公钥 
//      batch           批次
//      num             数量
//      bit_type        币的种类
//      folder_path     文件夹路径
// 返回：该母公钥对应的余额
//======================================
function xpub_print_addresses(xpub ,batch, num, bit_type, folder_path)
{
    const start = (batch - 1) * num;
    const stop = batch * num;

    csvStream
        .pipe(fs.createWriteStream(path.resolve(folder_path, "batch" + batch + "_" + start + "to" + (stop-1).toString() +".csv")))
        .on("end", process.exit);

    for(let i = start; i< stop; i++)
    {
        key_path = 'm/44' + '\'' + '/' + bit_type +'\'/' + '0' + '\'' + '/' + '0' + '/' + i ;
        address = xpub_to_address(xpub, i);
        csvStream.write([["batch_id", batch],["bit_type", bit_type],["id", i],["bit_address", address],["key_path", key_path]]);
    }
}

// 根据助记词来生成所有的地址
function mnemonic_to_address(mnem, index) {
    let seedBuffer = bip39.mnemonicToSeed(mnem)
    let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer, bitcoin.networks.testnet);
    let account0 = masterNode.derivePath("m/44'/1'/0'")
    let key0FromXpub = account0.neutered().derive(0).derive(index).keyPair
    let address0FromXpub = key0FromXpub.getAddress() 
    return address0FromXpub;
}





// 根据xpub来生成addresses
function xpub_to_address(xpub, index) {
    let address0FromXpub = bitcoin.HDNode.fromBase58(xpub, bitcoin.networks.testnet);
    let address = address0FromXpub.derive(0).derive(index).keyPair.getAddress();
    return address;
}

// 通过助记词产生xpub
function mnemonic_to_xpub(mnem) {
    let seedBuffer = bip39.mnemonicToSeed(mnem)
    let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer, bitcoin.networks.testnet)
    let account0 = masterNode.derivePath("m/44'/1'/0'")
    let xpubString = account0.neutered().toBase58()   
    return xpubString;
}

module.exports = {
    mnemonic_print_addresses,
    xpub_print_addresses,
    mnemonic_to_address,
    xpub_to_address,
    mnemonic_to_xpub
}