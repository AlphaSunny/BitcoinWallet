const electron = require('electron');
const path = require('path');
const url = require('url');
const request = require('request');
const seed_addr_csv = require('./libs/seed-addr-csv');
const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')
var csv = require("fast-csv")
const fs = require("fs")
const tx = require('./libs/transaction');
const csvStream = csv.format({headers: true});



/*
mnem = 'praise you muffin lion enable neck grocery crumble super myself license ghost';

let seedBuffer = bip39.mnemonicToSeed(mnem)
let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer, bitcoin.networks.testnet)
let account0 = masterNode.derivePath("m/44'/1'/0'")
let xpubString = account0.neutered().toBase58()   
console.log(xpubString);

//tx.mnemBalance("praise you muffin lion enable neck grocery crumble super myself license ghost");
*/

const explorers = require("bitcore-explorers");
const insight = new explorers.Insight('testnet');

var utxos_get;
/*
insight.getUnspentUtxos("n1TuHT1aAvuYhzMC9RUqmWiHv2xfUZ1Pft", function(err, utxos){
        if(err) {
            console.log(err);
        } else {
            utxos_get = JSON.parse(JSON.stringify(utxos));
        }
    }
)
*/




//console.log(utxos_get);



/*
let seedBuffer = bip39.mnemonicToSeed("praise you muffin lion enable neck grocery crumble super myself license ghost")
console.log(seedBuffer);
let masterNode = bitcoin.HDNode.fromSeedBuffer(seedBuffer, bitcoin.networks.testnet);

let account0 = masterNode.derivePath("m/44'/1'/0'").toBase58();
console.log(account0);
let keyPair = account0.neutered().derive(0).derive(1).toBase58();
*/

//得到私钥的代码
const mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
const seed = bip39.mnemonicToSeed(mnemonic)
const node = bip32.fromSeed(seed).derivePath("m/44'/1'/0'/0/0").toWIF();
//console.log(node)

/*
const string = node.toBase58()
console.log(string)
const restored = bip32.fromBase58(string)
console.log(restored)



//assert.equal(getAddress(node), getAddress(restored)) // same public key
//assert.equal(node.toWIF(), restored.toWIF()) // same private key

//console.log(keyPair);

//console.log(keyPair)


const node = bip32.fromBase58(xpriv, bitcoin.networks.testnet)
let address0FromXpub = key0FromXpub.getNetwork.
return address0FromXpub;
*/

//mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
tx.spendUtxo(mnemonic, 129500000, "2MxSUDocbGV6LU31KtwbCbM52Tuv8LenCN7", function(data) {
    console.log(data);
});

/*
tx.getUtxos("n2qGdjfjmFyvAXqbErrtXpfypXhtbNWruM", function(data) {
    console.log(data);
})

*/