// NOTE: Any updates need to compile with browserify viz.js -o main.js
const Web3 = require("web3");

// Different contracts for each dev environment 
network = "gorli" // local ; gorli ; main
if (network === "local") {
  // Mainnet will have a static address but the ABI file will still need to be loaded
  $.ajaxSetup({
      async: false
  });
  // Get contract ABI and address
  $.getJSON("build/contracts/Piloto.json", function(build) {
    Piloto = build.networks[Object.keys(build.networks)[0]].address;
    PilotoAbi = build.abi;
    console.log("Piloto contract address: " + Piloto);
  })
  $.getJSON("build/contracts/EcoBux.json", function(build) {
    ECOBcontractAddress = build.networks[Object.keys(build.networks)[0]].address;
    EcobAbi = build.abi;
    console.log("EcoBux contract address: " + ECOBcontractAddress);
  })
  $.ajaxSetup({
      async: true
  });
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));
} else if (network==="gorli") {

  Piloto = "0x2537e4F98C462766851b66986c913Cc4d9338362"
  ECOBcontractAddress = "0xC1122117A777eC07286ecaa353A6fEb36B08AeAf"

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));

} else if (network==="main") {
  console.error("Main network not deployed yet, use gorli or local blockchain instead")
} else {
  console.error("Network name not recognized.")
}
// var web3 = new Web3(new GSNProvider("http://localhost:8546"));

// Setting user address
web3.eth.getAccounts((err, res) => {
  accounts = res
  account = accounts[0];
  web3.eth.defaultAccount = account;
})

// Get hold of contract instance

var contract = new web3.eth.Contract(PilotoAbi, Piloto);
var ecob = new web3.eth.Contract(EcobAbi, ECOBcontractAddress);

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
  
  ecob.methods.approve(to, amount).send({from: account}).on('receipt', function(receipt){
    console.log("Successfully approved " + amount + " EcoBux to the Piloto contract");
    console.log(receipt)
  })
  .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.error(error)  
  });
}

// Buy an EcoBlock
// must approve Piloto contract to use user's ecobux before calling
$('#buyEcoBlock').click(buyEcoBlock);
function buyEcoBlock() {
  var amount = document.getElementById('buyBlockAmount').value;
  var account = $('#address').val();
  
  contract.methods.buyEcoBlocks(amount, account).send({from: account}).on('receipt', function(receipt){
    console.log("Purchased EcoBlock(s)") 
    console.log(receipt)
  })
  .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.error(error)  
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

$('#mintEcob').click(mintEcob);
function mintEcob() {
  var addr = document.getElementById('mintEcobAddr').value;
  var amount = document.getElementById('mintEcobAmount').value;

  ecob.methods.createEco(addr, amount).send({from: accounts[0]}).on('receipt', function(receipt) {
    console.log("Successfully given " + addr + " " + amount + " Ecobux");
    console.log(receipt);
  })
  .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.error(error)  
  });
}

// Function while initializing contract to load all EcoBlocks
$('#createEcoBlock').click(createEcoBlock);
function createEcoBlock() {
  $.getJSON("EcoBlocks.json", function(blockArray) {
    // Only add first 10 EcoBlocks 
    blockArray = blockArray.slice(0,10)

    contract.methods.bulkCreateEcoBlocks(blockArray).send({from: accounts[0]}).on('receipt', function(receipt) {
      console.log("Successfully created 10 EcoBlocks, given to the Piloto contract");
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.error(error)  
    });
  });
}

// Function while initializing contract to load addons
$('#createAddon').click(createAddon);
function createAddon() {
  var price = document.getElementById('createAddonPrice').value;
  var purchasable = document.getElementById('createAddonPurchasable').value;

  contract.methods.createMicro(price, purchasable).send({from: accounts[0]}).on('receipt', function(receipt) {
    console.log("Successfully created microaddon");
  })
  .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.error(error)  
  });
}

// Function while initializing contract to load all EcoBlocks
$('#giveEcoBlock').click(giveEcoBlock);
function giveEcoBlock() {
  var amount = document.getElementById('giveBlockAmount').value;
  var account = document.getElementById('giveBlockAddr').value;
  
  // 1500 is cost (in decimals) of one EcoBlock
  contract.methods.giveEcoBlocks(amount, account).send({from: accounts[0]}).on('receipt', function(receipt) {
    console.log(`Successfully gave ${amount} Ecoblocks`);
  })
  .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.error(error)  
  });
}

// List all owned EcoBlocks
$('#ownedEcoBlocks').click(ownedEcoBlocks);
function ownedEcoBlocks() {
  var addr = document.getElementById('ownedBlockAddr').value;
  contract.methods.ownedEcoBlocks(addr).call().then(function(owned) {
    console.log(owned);
  });
}

// Non state modifiying functions
// Update labels every second
setInterval(function() {
  // Get the current active account
  var account = $('#address').val();
  
  // Account balance in Ether
  web3.eth.getBalance(account).then(function(weibal) {
    $('#label1').text(web3.utils.fromWei(weibal, 'ether'));
  });

  // Block number
  web3.eth.getBlockNumber(function(error, result){
    if (!error) {
      if ($('#label2').text() != result)
        $('#label2').text(result).effect("highlight");
    }
  });
  
  // Print account address (not state changing)
  $('#label3').val(account);
  
  // Check ecobucks balance: call (not state changing)
  ecob.methods.balanceOf(account).call().then(function(bal, ecobAllowed) {
    $('#label4-1').text(bal / 100+ " (Owned)   ");
  })
  ecob.methods.allowance(account, Piloto).call().then(function(allowed) {
    $('#label4-2').text(allowed / 100 + " (Approved to contract)");
  })


}, 1000);

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
