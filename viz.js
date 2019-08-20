// NOTE: Need to compile with browserify viz.js -o main.js
var SolidityCoder = require("web3/lib/solidity/coder.js");

var PAJcontractAddress = '0x5D1E04C0783700B61D04D02215344EE32B38C6A9';
var ECOBcontractAddress = '0x394372eAE1E89C8D00DE8Bc1cb629fA24d1654aC';

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var accounts = web3.eth.accounts;
var account = accounts[0];


web3.eth.defaultAccount = account;

// Assemble function hashes

var functionHashes = getFunctionHashes(abiArray);

// Get hold of contract instance

var contract = web3.eth.contract(abiArray).at(PAJcontractAddress);
var ecob = web3.eth.contract(abiArrayEcob).at(ECOBcontractAddress);

function updateMap() {
  // TODO: Update map
  console.log('TODO');
}

// User functions
$('#copyAddr').click(copyAddr);
function copyAddr() {
  // Put the selected user account into the clipboard
  var copyText = document.getElementById("label3");
  copyText.select();
  document.execCommand('copy');
}


$('#buyEcobux').click(buyEcobux);
function buyEcobux() {
  var input = document.getElementById('buyEcobInput').value;
  // TODO: Make this interact with PayPal
  console.log(input);
}

$('#allowance').click(allowance);
function allowance() {
  var addr = document.getElementById('ownedAllotAddr').value;
  contract.ownedAllotments(addr, function(err, data) {
    console.log(err, data);
  });
}

$('#apprEcob').click(apprEcob);
function apprEcob() {
  var to = PAJcontractAddress;//document.getElementById('apprEcobTo').value;
  var amount = document.getElementById('apprEcobAmount').value;
  console.log(to, amount);
  
  ecob.approve(amount, to, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(err, txReceipt);
    var log = txReceipt.logs[0];
    var data = SolidityCoder.decodeParams(["address", "uint"], log.data.replace("0x", ""));
    console.log(data);
  });
}

$('#buyAllotment').click(buyAllotment);
function buyAllotment() {
  var to = document.getElementById('buyAllotTo').value;
  var amount = document.getElementById('buyAllotAmount').value;
  console.log(to, amount);
  
  contract.buyAllotments(amount, to, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(err, txReceipt);
    var log = txReceipt.logs[0];
    var data = SolidityCoder.decodeParams(["address", "uint"], log.data.replace("0x", ""));
    console.log(data);
    //updateMap();
  });
}

$('#buyAddon').click(buyAddon);
function buyAddon() {
  var allotId = document.getElementById('buyAllotAmount').value;
  console.log(allotId);
}

// Testing Functions



$('#mintEcob').click(mintEcob);
function mintEcob() {
  var addr = document.getElementById('mintEcobAddr').value;
  var amount = document.getElementById('mintEcobAmount').value;
  console.log(addr, amount);
  ecob.createEco(addr, amount, {from: accounts[0]}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(txReceipt);
  });
}

$('#createAllotment').click(createAllotment);
function createAllotment() {
  $.getJSON("contractAllotments.json", function(allotArray) {
    console.log(allotArray);
    contract.createAllotment(allotArray, {from: accounts[0]}, function(err, txHash) {
      console.log(err, txHash);
      let txReceipt = web3.eth.getTransactionReceipt(txHash);
      // txReceipt.logs contains an array of all events fired while calling your fxn
      console.log(err);
      var log = txReceipt.logs[0];
      console.log(log);
      //var data = SolidityCoder.decodeParams(["address", "uint", "uint[2][][]", "uint"], log.data.replace("0x", ""));
      //console.log(data);
    });
  
  });
  
}

$('#createAddon').click(createAddon);
function createAddon() {
  var price = document.getElementById('createAddonPrice').value;
  var purchasable = document.getElementById('createAddonPurchasable').value;

  contract.createMicro(price, purchasable, {from: accounts[0]}, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(txReceipt);
    var log = txReceipt.logs[0];
    var data = SolidityCoder.decodeParams(["uint", "uint", "bool"], log.data.replace("0x", ""));
    console.log(data);
  });

}

$('#ownedAllotments').click(ownedAllotments);
function ownedAllotments() {
  var addr = document.getElementById('ownedAllotAddr').value;
  contract.ownedAllotments(addr, function(err, data) {
    console.log(err, data);
  });
}


/*
MyContract.stateModifyingFunction(arg1, arg2, function(err, txHash){
  let txReceipt = web3.eth.getTransactionReceipt(txHash);
  // txReceipt.logs contains an array of all events fired while calling your fxn
});
*/
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
  var ecobBalance = ecob.balanceOf(account) / 100;
  $('#label4').text(ecobBalance);

  // Update allotment map
  //updateMap(); 
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
    console.log(item.name + '=' + hash);
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

// Map functions



// Load map
var geojson;

var mapboxAccessToken = "pk.eyJ1IjoibHVjYXNvYmUiLCJhIjoiY2p5cWdqeTI2MDA1YzNpcjNkdHkya3BieCJ9.1sPGdqMODcBf8w8gG0-KRw";
var map = L.map('leaflet-map').setView([9.315055, -79.134224], 3);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    maxZoom: 30,
    attribution: 'Map data &copy; ' +
      '<a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(map);

L.control.scale().addTo(map);

// Custom Info Control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Mamoni Valley Land Allotments</h4>' + 
      (props ? 'Allotment <b>#' + props.POLY_ID + 
      '</b><br />Current Owner: ' + 
      (
        props.owned === 0 ? 'Unowned' : 
        props.owned === 1 ? 'Owned by someone else' : 
        props.owned === 2 ? 'Owned by you' :
                            'Error.'
      ) 
      : 'Hover over an allotment');
};

info.addTo(map);

// Add colors to data
function getColor(d) {
    return d==0 ? '#45286b' : 
           d==1 ? '#67296B' :
           d==2 ? '#2E6C29' :
                  '#fff';console.log('Error in the owned allotments!')
}
function style(feature) {
    return {
        fillColor: getColor(feature.properties.OWNED),
        weight: 0.7,
        opacity: 0.8,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.2
    };
}
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function zoomToFeature(e) {
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds(), {padding: [150, 150]});
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Add geojson data to map
geojson = L.geoJson(mamoniData, {
  style: style, 
  onEachFeature: onEachFeature
}).addTo(map);
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
  
  setTimeout(function() {
    map.flyTo([9.315055, -79.134224], 19)
  }, 2000);
});
