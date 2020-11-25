// NOTE: Any updates need to compile with browserify viz.js -o main.js
const Web3 = require("web3");

// Different contracts for each dev environment
network = "gorli"; // local ; gorli ; main
if (network === "local") {
  // Mainnet & Gorli have static addresses but local changes each deploy
  $.ajaxSetup({
    async: false,
  });
  // Get contract ABI and address
  $.getJSON("build/contracts/Piloto.json", function (build) {
    Piloto = build.networks[Object.keys(build.networks)[0]].address;
    PilotoAbi = build.abi;
    console.log("Piloto contract address: " + Piloto);
  });
  $.getJSON("build/contracts/EcoBux.json", function (build) {
    ECOBcontractAddress = build.networks[Object.keys(build.networks)[0]].address;
    EcobAbi = build.abi;
    console.log("EcoBux contract address: " + ECOBcontractAddress);
  });
  $.ajaxSetup({
    async: true,
  });
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));
} else if (network === "gorli") {
  // Network Configuration for Goerli Testnet
  Piloto = "0x3e701765201e0C8D821422f043EF5D8FD04210Ec";
  PilotoFuture = "0x9892aE2D3Ed2106e8E3E31896B48A1089909f9f6";
  ECOBcontractAddress = "0xcf9Fd40b3E65C9Cd151aca0508C101Ea09a9CAF4";

  var web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/" + INFURAKEY));
} else if (network === "main") {
  console.error("Main network not deployed yet, use gorli or local blockchain instead");
} else {
  console.error("Network name not recognized.");
}
// var web3 = new Web3(new GSNProvider("http://localhost:8546"));

// Setting admin wallet
// In production, this sould be kept very secret, and should never be sent to clients
web3.eth.accounts.wallet.add(ETHSECRET);

// Setting user address
web3.eth.accounts.wallet.create(5);
//web3.eth.accounts.wallet.create(1) // Create 1 wallet for user

accounts = [];
for (i = 0; i < web3.eth.accounts.wallet.length; i++) {
  accounts.push(web3.eth.accounts.wallet[i].address);
}

// Get hold of contract instance

var contract = new web3.eth.Contract(PilotoAbi, Piloto);
var future = new web3.eth.Contract(PilotoFutureAbi, PilotoFuture);
var ecob = new web3.eth.Contract(EcobAbi, ECOBcontractAddress);

// User functions

// Copy user ethereum address
$("#copyAddr").click(copyAddr);
function copyAddr() {
  // Put the selected user account into the clipboard
  var copyText = document.getElementById("label3");
  copyText.select();
  document.execCommand("copy");
}

// No paypal integrations yet
$("#buyEcobux").click(buyEcobux);
function buyEcobux() {
  var input = document.getElementById("buyEcobInput").value;
  // TODO: Make this interact with PayPal
  console.log(input);
}

// Approve Piloto contract to use ECOB
// Must be done to buy EcoBlocks
$("#apprEcob").click(apprEcob);
function apprEcob() {
  var to = Piloto;
  var amount = document.getElementById("apprEcobAmount").value;
  var from = $("#address").val();

  ecob.methods
    .approve(to, amount)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      ecob.methods
        .approve(to, amount)
        .send({ from: account, gas: gasAmount })
        .on("receipt", function (receipt) {
          console.log("Successfully approved " + amount + " EcoBux to the Piloto contract");
          console.log(receipt);
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// Buy an EcoBlock
// must approve Piloto contract to use user's ecobux before calling
$("#buyEcoBlock").click(buyEcoBlock);
function buyEcoBlock() {
  var amount = document.getElementById("buyBlockAmount").value;
  var account = $("#address").val();

  contract.methods
    .buyEcoBlocks(amount, account)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      contract.methods
        .buyEcoBlocks(amount, account)
        .send({ from: account, gas: gasAmount })
        .on("receipt", function (receipt) {
          console.log("Purchased EcoBlock(s)");
          console.log(receipt);
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// Buy a microaddon for an EcoBlock
// Not used yet
$("#buyAddon").click(buyAddon);
function buyAddon() {
  var allotId = document.getElementById("buyBlockAmount").value;
  console.log(allotId);
}

// Testing Functions

$("#mintEcob").click(mintEcob);
function mintEcob() {
  var addr = document.getElementById("mintEcobAddr").value;
  var amount = document.getElementById("mintEcobAmount").value;

  // Estimate gas cost
  ecob.methods
    .createEco(addr, amount)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      ecob.methods
        .createEco(addr, amount)
        .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
        .on("receipt", function (receipt) {
          console.log("Successfully given " + addr + " " + amount + " Ecobux");
          console.log(receipt);
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// Function while initializing contract to create all EcoBlocks
$("#createAllEcoBlock").click(createAllEcoBlock);
async function createAllEcoBlock() {
  $.getJSON("EcoBlocks.json", function (blocks) {
    const index = 50;
    // Estimate gas cost
    contract.methods
      .bulkCreateEcoBlocks(index)
      .estimateGas({ from: web3.eth.accounts.wallet[0].address })
      .then(async function (gasAmount) {
        for (i = 0; i < 2700 / 50 - 1; i++) {
          console.log(
            "Successfully created EcoBlocks " +
              i * 50 +
              "-" +
              (i + 1) * 50 +
              ", given to the Piloto contract"
          );
          // Only add first 50 EcoBlocks
          subBlocks = 50;

          await contract.methods
            .bulkCreateEcoBlocks(subBlocks)
            .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
            .on("receipt", function (receipt) {
              console.log(
                "Successfully created EcoBlocks " +
                  i * 50 +
                  "-" +
                  (i + 1) * 50 +
                  ", given to the Piloto contract"
              );
            })
            .on("error", function (error, receipt) {
              // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
              console.error(error);
            });
        }
      });
  });
}

// Function while initializing contract to load all EcoBlocks
// Call this if there are no more EcoBlocks for testing
$("#createEcoBlock").click(createEcoBlock);
function createEcoBlock() {
  $.getJSON("EcoBlocks.json", function (blockArray) {
    // Only add first 10 EcoBlocks
    blockArray = blockArray.slice(0, 10);

    // Estimate gas cost
    contract.methods
      .bulkCreateEcoBlocks(blockArray)
      .estimateGas({ from: web3.eth.accounts.wallet[0].address })
      .then(function (gasAmount) {
        contract.methods
          .bulkCreateEcoBlocks(blockArray)
          .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
          .on("receipt", function (receipt) {
            console.log("Successfully created 10 EcoBlocks, given to the Piloto contract");
          })
          .on("error", function (error, receipt) {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.error(error);
          });
      });
  });
}

// Function while initializing contract to load addons
$("#createAddon").click(createAddon);
function createAddon() {
  var price = document.getElementById("createAddonPrice").value;
  var purchasable = document.getElementById("createAddonPurchasable").value;

  // Estimate gas cost
  contract.methods
    .createMicro(price, purchasable)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      // Send transaction
      contract.methods
        .createMicro(price, purchasable)
        .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
        .on("receipt", function (receipt) {
          console.log("Successfully created microaddon");
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// Function while initializing contract to load all EcoBlocks
$("#giveFuture").click(giveFuture);
function giveFuture() {
  var amount = document.getElementById("giveFutureAmount").value;
  var account = document.getElementById("giveFutureAddr").value;

  // Estimate gas cost
  future.methods
    .giveFuture(amount, account)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      // Send transaction
      future.methods
        .giveFuture(amount, account)
        .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
        .on("receipt", function (receipt) {
          // Transaction Successful.
          console.log(`Successfully gave ${amount} Future`);
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// Function while initializing contract to load all EcoBlocks
$("#giveEcoBlock").click(giveEcoBlock);
function giveEcoBlock() {
  var amount = document.getElementById("giveBlockAmount").value;
  var account = document.getElementById("giveBlockAddr").value;

  // Estimate gas cost
  contract.methods
    .giveEcoBlocks(amount, account)
    .estimateGas({ from: web3.eth.accounts.wallet[0].address })
    .then(function (gasAmount) {
      // Send transaction
      contract.methods
        .giveEcoBlocks(amount, account)
        .send({ from: web3.eth.accounts.wallet[0].address, gas: gasAmount })
        .on("receipt", function (receipt) {
          // Transaction Successful.
          console.log(`Successfully gave ${amount} Ecoblocks`);
        })
        .on("error", function (error, receipt) {
          // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error);
        });
    });
}

// List all owned EcoBlocks
$("#ownedEcoBlocks").click(ownedEcoBlocks);
function ownedEcoBlocks() {
  var addr = document.getElementById("ownedBlockAddr").value;
  contract.methods
    .ownedEcoBlocks(addr)
    .call()
    .then(function (owned) {
      console.log(owned);
    });
}

// Non state modifiying functions
// Update labels every second
setInterval(function () {
  // Get the current active account
  var account = $("#address").val();

  // Account balance in Ether
  web3.eth.getBalance(account).then(function (weibal) {
    $("#label1").text(web3.utils.fromWei(weibal, "ether"));
  });

  // Block number
  web3.eth.getBlockNumber(function (error, result) {
    if (!error) {
      if ($("#label2").text() != result) $("#label2").text(result).effect("highlight");
    }
  });

  // Print account address (not state changing)
  $("#label3").val(account);

  // Check ecobucks balance: call (not state changing)
  ecob.methods
    .balanceOf(account)
    .call()
    .then(function (bal, ecobAllowed) {
      $("#label4-1").text(bal / 100 + " (Owned)   ");
    });
  ecob.methods
    .allowance(account, Piloto)
    .call()
    .then(function (allowed) {
      $("#label4-2").text(allowed / 100 + " (Approved to contract)");
    });
}, 10000);

$(document).ready(function () {
  var optionsAsString = "";
  for (var i = 0; i < accounts.length; i++) {
    optionsAsString += "<option value='" + accounts[i] + "'>User: " + i + "</option>";
  }
  $("select[name='address']").find("option").remove().end().append($(optionsAsString));
});
