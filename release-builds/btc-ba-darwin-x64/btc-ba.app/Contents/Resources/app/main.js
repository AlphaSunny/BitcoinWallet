const electron = require('electron');
const path = require('path');
const url = require('url');
const request = require('request');
const seed_addr_csv = require('./libs/seed-addr-csv');
const tx = require('./libs/transaction');
process.env.NODE_ENV = 'development';
const explorers = require("bitcore-explorers");
const insight = new explorers.Insight('testnet');



const {app, BrowserWindow, Menu, ipcMain} = electron;
let mainWindow = null;
let mnemonicMainWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 项目的入口
app.on('ready', () => {
  mainWindow = new BrowserWindow();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', () => { mainWindow = null; });
});

ipcMain.on('mnemonicModel', function(e) {
    mainWindow.close();
    mnemonicMainWindow = new BrowserWindow({});
    mnemonicMainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'views/mnemonicIndex.html'),
      protocol: 'file:',
      slashes:true
    }));

    // 只要该窗口关闭，app即结束
    mnemonicMainWindow.on('closed', function(){
      app.quit();
    });

    // 自定义的菜单栏
    const mainMenu = Menu.buildFromTemplate(mnemonicMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
})

ipcMain.on('xpubModel', function(e) {
    mainWindow.close();
    xpubMainWindow = new BrowserWindow({});
})

ipcMain.on('trezorModel', function(e) {
    mainWindow.close();
    trezorMainWindow = new BrowserWindow({});
})


//------------------------------------------------------助记词模式----------------------------------------------------

let mnemonic ='';
let xpub;
let receiveWindow;
let sendWindow;
let mnemonicSeedWindow;
let mnemonicPrintWindow;

// 打开添加种子窗口的功能
function createAddSeedWindow(){
    mnemonicSeedWindow = new BrowserWindow({
        width: 900,
        height:200,
        title:'Add seed here'
    });
    mnemonicSeedWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/addSeed.html'),
        protocol: 'file:',
        slashes:true
    }));
    // Handle garbage collection
    mnemonicSeedWindow.on('close', function(){
        mnemonicSeedWindow = null;
    });  
}

// 打开打印地址的窗口
function print_batch_address() {
    mnemonicPrintWindow = new BrowserWindow({
        width:400,
        height:200,
        title:'Print the address'
    });
    mnemonicPrintWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/printAddress.html'),
        protocol: 'file:',
        slashes: true
    }));
    mnemonicPrintWindow.on('close', function() {
        mnemonicPrintWindow = null; 
    })
}

//======================================
// 函数: 获取该母公钥下的btc余额
// 参数: xpub            母公钥
//      window          需要将余额发送给的窗口
// 返回：该母公钥对应的余额
//======================================
// to do
  
// 接收index.html发送的seed
ipcMain.on('item:seed', function(e, item){
    mnemonic = item;
    xpub = seed_addr_csv.mnemonic_to_xpub(mnemonic);
    tx.mnemBalance(mnemonic, function(balance) {
        mnemonicMainWindow.webContents.send("item:balance", balance);
        console.log("the balance is:" + balance);
    });
    mnemonicSeedWindow.close(); 
});

//接受mnemonic模式下，打印地址的需求
ipcMain.on('item:print', function(e, item) {
    seed_addr_csv.xpub_print_addresses(xpub, item.batch, 100, 1, './data');
    mnemonicPrintWindow.close();
})

// 收到receive的指令后，创建收款的窗口
ipcMain.on('action:receive', function(e){
  if(mnemonic === '') {
    mnemonicMainWindow.webContents.send("alert:noMnemonic");
  } else {
    receiveWindow = new BrowserWindow({
      width:400,
      height: 400,
      title:'receive bitcoin'
    });
    receiveWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/receiveBtc.html'),
        protocol: 'file:',
        slashes: true
    }))
  
    receiveWindow.on('close', function() {
      receiveWindow = null;
    })       
  }
})
// 收到send的指令后，创建send的窗口
ipcMain.on('action:send', function(e) {
  if(mnemonic === '') {
    mnemonicMainWindow.webContents.send("alert:noMnemonic");
  } else {
    sendWindow = new BrowserWindow({
      width:400,
      height: 400,
      title: 'send bitcoin'
    });
    sendWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'views/sendBtc.html'),
      protocol: 'file:',
      slashes: true
    }))
    sendWindow.on('close', function() {
      sendWindow = null;
    })
  }
})

// 收到打款的指令
ipcMain.on('item:send', function(e, item) {
  console.log("address:" + item["sendAddress"]);
  console.log("value:" + item["value"]*100000000);
  tx.spendUtxo(mnemonic, item["value"]*100000000, item["sendAddress"], function(data) {
    console.log(data);
    insight.broadcast(data, function(err, returnTxhash) {
      if(err) {
        console.log("error");
      } else {
        //sendWindow.webContents.send("item:txhash", returnTxhash);
        console.log("The tx hash is:" + returnTxhash);
      }
    })
  })
})

// 收到端口发送地址的请求
ipcMain.on('action:return-address', function(e) {
    console.log("have receive the urge of return address");
    let address = seed_addr_csv.mnemonic_to_address(mnemonic,0);
    receiveWindow.webContents.send("item:address", address);  
})

// 收到指令后，timer开启
ipcMain.on('action:timer', function(e) {
  setInterval(()=> {
    tx.mnemBalance(mnemonic, function(balance) {
      mnemonicMainWindow.webContents.send("item:balance", balance);
      console.log("the balance is:" + balance);
    });  
  }, 1000*10);
})





//助记词模式下的菜单栏
const mnemonicMenuTemplate =  [
    {
      label: 'File',
      submenu:[
        {
          label:'Add mnenomic',
          click(){
            createAddSeedWindow();
          }
        },
        {
          label: 'Print',
          accelerator:process.platform == 'darwin' ? 'Command+P' : 'Ctrl+P',
          click(){
            print_batch_address();
          }
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function() { app.quit(); }
        }]   
      }, {
        label: 'Edit',
        submenu: [{
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        }, {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        }, {
          type: 'separator'
        }, {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        }, {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        }, {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        }, {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'   
        }
      ]
    }
  ];
  
// 在osx环境下，调整菜单栏
if(process.platform == 'darwin'){
  mnemonicMenuTemplate.unshift({});
}

//在生产环境下，
if(process.env.NODE_ENV !== 'production'){
  mnemonicMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}

//------------------------------------------------------助记词模式----------------------------------------------------
