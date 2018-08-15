const explorers = require("bitcore-explorers");
const insight = new explorers.Insight('testnet');
const seed_addr_csv = require('./seed-addr-csv');
const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');


function spendUtxo(mnemonic, num, toAddress, handleTx) {

    const testnet = bitcoin.networks.testnet;

    const seed = bip39.mnemonicToSeed(mnemonic);
    const privkey = bip32.fromSeed(seed, testnet).derivePath("m/44'/1'/0'/0/0").toWIF();
    const address = bitcoin.ECPair.fromWIF(privkey, testnet).getAddress();
    const user = bitcoin.ECPair.fromWIF(privkey, testnet);
    console.log(privkey);
    console.log(address);

    var txfee = 10000;

    insight.getUnspentUtxos(address, function(err, utxos){
        if(err) {
            console.log("error");
        } else {
            const txb = new bitcoin.TransactionBuilder(testnet, 12000);
            txb.setVersion(1);

            utxos = JSON.parse(JSON.stringify(utxos));
            amount =0;
            i=0;
            do {
                amount += utxos[i].amount;
                i++;
            } while(amount < (num + txfee)/100000000);
            var change = amount*100000000 - num - txfee; 
            console.log(i);
            for(var a=0; a<i; a++) {
                txb.addInput(utxos[a].txid,utxos[a].vout);
            }
            txb.addOutput(toAddress, num);
            txb.addOutput(address, change);
            for(var a=0; a<i; a++) {
                txb.sign(a, user);
            }
            
            console.log(txb.build().toHex());
            handleTx(txb.build().toHex());
        }
    })
}



// 根据助记词来得到余额, 在该app功能下，我们仅考虑第一个地址的余额
function mnemBalance(mnemonic, setBalance) {
    var address = seed_addr_csv.mnemonic_to_address(mnemonic, 0);
    getBalance(address, function(balance) {
        setBalance(balance);
    })
}

//根据地址得到未花费交易
function getUtxos(address, setUtxos)
{
    insight.getUnspentUtxos(address, function(err, utxos) {
        if(err){
            console.log("error");
        } else {
            setUtxos(utxos);
        }
    })
}

// 根据地址得到余额
function getBalance(address, setBalance) {
    console.log(address);
    insight.getUnspentUtxos(address, function(err, utxos) {
        if(err) {
            console.log("error");
        } else {
            var balance = 0;
            for(var i=0; i<utxos.length; i ++) {
                balance += utxos[i].satoshis;
            }
            setBalance(balance);
        }
    })
}

// 根据



module.exports = {
    getUtxos,
    getBalance,
    mnemBalance,
    spendUtxo
}