// NOTE: Any updates need to compile with browserify viz.js -o main.js
var SolidityCoder = require("web3/lib/solidity/coder.js");

network = "dev"

// Different contracts for each dev environment 
// Mainnet will have a static address but the ABI file will still need to be loaded
$.ajaxSetup({
    async: false
});
// Get contract ABI and address
$.getJSON("../EcoBux/build/contracts/Piloto.json", function(build) {
  Piloto = build.networks[Object.keys(build.networks)[0]].address;
  pilotoAbi = build.abi;
  console.log("Piloto contract address: " + Piloto);
})
$.getJSON("../EcoBux/build/contracts/EcoBux.json", function(build) {
  ECOBcontractAddress = build.networks[Object.keys(build.networks)[0]].address;
  ecobAbi = build.abi;
  console.log("EcoBux contract address: " + ECOBcontractAddress);
})
$.ajaxSetup({
    async: true
});
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var accounts = web3.eth.accounts;
// Setting user address
var account = accounts[0];

web3.eth.defaultAccount = account;

// Assemble function hashes

var functionHashes = getFunctionHashes(pilotoAbi);

// Get hold of contract instance

var contract = web3.eth.contract(pilotoAbi).at(Piloto);
var ecob = web3.eth.contract(ecobAbi).at(ECOBcontractAddress);

// User functions

// Copy user ethereum address
$('#copyAddr').click(copyAddr);
function copyAddr() {
  // Put the selected user account into the clipboard
  var copyText = document.getElementById("label3");
  copyText.select();
  document.execCommand('copy');
}

// No paypal integrations yet
$('#buyEcobux').click(buyEcobux);
function buyEcobux() {
  var input = document.getElementById('buyEcobInput').value;
  // TODO: Make this interact with PayPal
  console.log(input);
}

// Approve Piloto contract to use ECOB
// Must be done to buy EcoBlocks
$('#apprEcob').click(apprEcob);
function apprEcob() {
  var to = Piloto;
  var amount = document.getElementById('apprEcobAmount').value;
  var from = $('#address').val();
  
  ecob.approve(to, amount, {from: from}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(err, txReceipt);
    var log = txReceipt.logs[0];
    var data = SolidityCoder.decodeParams(
                ["address", "uint"], log.data.replace("0x", "")
               );
    console.log(data);
  });
}

// Buy an EcoBlock
// must approve Piloto contract to use user's ecobux before calling
$('#buyEcoBlock').click(buyEcoBlock);
function buyEcoBlock() {
  var amount = document.getElementById('buyBlockAmount').value;
  var account = $('#address').val();
  
  // 1500 is cost (in decimals) of one EcoBlock
  contract.buyEcoBlocks(amount, account, {from:account,gas:8000000}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(err, txReceipt);
    var log = txReceipt.logs[3];
    var data = SolidityCoder.decodeParams(
                ["address", "address", "uint"], log.data.replace("0x", "")
               );
    console.log(data);
    console.log("Purchased EcoBlock(s)") 
  });
}

// Buy a microaddon for an EcoBlock
// Not used yet
$('#buyAddon').click(buyAddon);
function buyAddon() {
  var allotId = document.getElementById('buyBlockAmount').value;
  console.log(allotId);
}

// Testing Functions

// This should be called after user pays with paypal
$('#mintEcob').click(mintEcob);
function mintEcob() {
  var addr = document.getElementById('mintEcobAddr').value;
  var amount = document.getElementById('mintEcobAmount').value;
  console.log(addr, amount);

  ecob.createEco(addr, amount, {from: accounts[0]}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired
    console.log(txReceipt);
  });
}

// Function while initializing contract to load all EcoBlocks
$('#createEcoBlock').click(createEcoBlock);
function createEcoBlock() {
  $.getJSON("allotments.json", function(blockArray) {
    // Only add first 10 allotments
    blockArray = blockArray.slice(0,10)

    contract.bulkCreateEcoBlocks(blockArray, {from: accounts[0], gas: 8000000}, function(err, txHash) {
      let txReceipt = web3.eth.getTransactionReceipt(txHash);
      // txReceipt.logs contains an array of all events fired
      var log = txReceipt.logs[0];
      if (txReceipt.status == 1) {
        console.log("Successfully created 10 EcoBlocks, given to the Piloto contract");
      } else {
        console.log(err);
      }
    });
  });
}

// Function while initializing contract to load addons
$('#createAddon').click(createAddon);
function createAddon() {
  var price = document.getElementById('createAddonPrice').value;
  var purchasable = document.getElementById('createAddonPurchasable').value;

  contract.createMicro(price, purchasable, {from: accounts[0]}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(txReceipt);
    var log = txReceipt.logs[0];
    var data = SolidityCoder.decodeParams(
                ["uint", "uint", "bool"], log.data.replace("0x", "")
               );
    console.log(data);
  });

}

$('#ownedEcoBlocks').click(ownedEcoBlocks);
function ownedEcoBlocks() {
  var addr = document.getElementById('ownedBlockAddr').value;
  console.log(contract.ownedEcoBlocks(addr))
}


// Non state modifiying functions
// Update labels every second
setInterval(function() {
  // Get the current active account
  var account = $('#address').val();
  
  // Account balance in Ether
  var balanceWei = web3.eth.getBalance(account).toNumber();
  var balance = web3.fromWei(balanceWei, 'ether');
  $('#label1').text(balance);

  // Block number
  var number = web3.eth.blockNumber;
  if ($('#label2').text() != number)
    $('#label2').text(number).effect("highlight");
  
  // Print account address (not state changing)
  $('#label3').val(account);
  
  // Check ecobucks balance: call (not state changing)
  var ecobAllowed = ecob.allowance(account, Piloto) / 100;
  var ecobBalance = ecob.balanceOf(account) / 100;
  $('#label4').text(ecobBalance + " (Owned)   " + ecobAllowed + " (Approved to contract)");

}, 1000);

// Get function hashes
// TODO: also extract input parameter types for later decoding

function getFunctionHashes(abi) {
  var hashes = [];
  for (var i=0; i<abi.length; i++) {
    var item = abi[i];
    if (item.type != "function") continue;
    var signature = item.name + "(" + item.inputs.map(function(input) {
      return input.type;
    }).join(",") + ")";
    var hash = web3.sha3(signature);
    hashes.push({name: item.name, hash: hash});
  }
  return hashes;
}

function findFunctionByHash(hashes, functionHash) {
  for (var i=0; i<hashes.length; i++) {
    if (hashes[i].hash.substring(0, 10) == functionHash.substring(0, 10))
      return hashes[i].name;
  }
  return null;
}

$( document ).ready(function() {
  var optionsAsString = "";
  for(var i = 0; i < accounts.length; i++) {
    optionsAsString += "<option value='" + accounts[i] + "'>User: " +
                       i + "</option>";
  }
  $("select[name='address']").find('option')
                             .remove()
                             .end()
                             .append($(optionsAsString));
});
