// NOTE: Need to compile with browserify viz.js -o main.js
var SolidityCoder = require("web3/lib/solidity/coder.js");

var PAJcontractAddress = '0x7d9fAEaBaEBF84573030f2c07c073Eb8D91a2459';
var ECOBcontractAddress = '0x92AeD884A2aAf1eb25a4dd479ad8406A9dFF86c4';

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var account = web3.eth.accounts[0];

web3.eth.defaultAccount = account;

// Assemble function hashes

var functionHashes = getFunctionHashes(abiArray);

// Get hold of contract instance

var contract = web3.eth.contract(abiArray).at(PAJcontractAddress);
var ecob = web3.eth.contract(abiArrayEcob).at(ECOBcontractAddress);

// Setup filter to watch transactions
/*
var filter = web3.eth.filter('latest');

filter.watch(function(error, result){
  if (error) return;
  
  var block = web3.eth.getBlock(result, true);
  console.log('block #' + block.number);

  console.dir(block.transactions);

  for (var index = 0; index < block.transactions.length; index++) {
    var t = block.transactions[index];

    // Decode from
    var from = t.from==account ? "me" : t.from;

    // Decode function
    var func = findFunctionByHash(functionHashes, t.input);

    if (func == 'sellEnergy') {
      // This is the sellEnergy() method
      var inputData = SolidityCoder.decodeParams(["uint256"], t.input.substring(10));
      console.dir(inputData);
      $('#transactions').append('<tr><td>' + t.blockNumber + 
        '</td><td>' + from + 
        '</td><td>' + "ApolloTrade" + 
        '</td><td>sellEnergy(' + inputData[0].toString() + ')</td></tr>');
    } else if (func == 'buyEnergy') {
      // This is the buyEnergy() method
      var inputData = SolidityCoder.decodeParams(["uint256"], t.input.substring(10));
      console.dir(inputData);
      $('#transactions').append('<tr><td>' + t.blockNumber + 
        '</td><td>' + from + 
        '</td><td>' + "ApolloTrade" + 
        '</td><td>buyEnergy(' + inputData[0].toString() + ')</td></tr>');
    } else {
      // Default log
      $('#transactions').append('<tr><td>' + t.blockNumber + '</td><td>' + from + '</td><td>' + t.to + '</td><td>' + t.input + '</td></tr>')
    }
  }
});
*/

// User functions
$('#buyEcobux').click(buyEcobux);
function buyEcobux() {
  var input = document.getElementById('buyEcobInput').value;
  // TODO: Make this interact with PayPal
  console.log(input);
}

$('#buyAllotment').click(buyAllotment);
function buyAllotment() {
  var input = document.getElementById('buyAllotInput').value;
  console.log(input);
}

$('#buyAddon').click(buyAddon);
function buyAddon() {
  var input = document.getElementById('buyAddonInput').value;
  console.log(input);
}

// Testing Functions



$('#mintEcob').click(mintEcob);
function mintEcob() {
  var addr = document.getElementById('mintEcobAddr').value;
  var amount = document.getElementById('mintEcobAmount').value;
  console.log(addr, amount);
  ecob.createEco(addr, amount, function(err, txHash){
    let txReceipt = web3.eth.getTransactionReceipt(txHash);
    // txReceipt.logs contains an array of all events fired while calling your fxn
    console.log(txReceipt);
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

  // Account balance in Ether
  var balanceWei = web3.eth.getBalance(account).toNumber();
  var balance = web3.fromWei(balanceWei, 'ether');
  $('#label1').text(balance);

  // Block number
  var number = web3.eth.blockNumber;
  if ($('#label2').text() != number)
    $('#label2').text(number).effect("highlight");

  // Print account address (not state changing)
  $('#label3').text(account);

  // Check ecobucks balance: call (not state changing)
  var ecobBalance = ecob.balanceOf(account) / 100;
  $('#label4').text(ecobBalance);

}, 1000);

// Get function hashes
// TODO: also extract input parameter types for later decoding

function getFunctionHashes(abi) {
  var hashes = [];
  for (var i=0; i<abi.length; i++) {
    var item = abi[i];
    if (item.type != "function") continue;
    var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
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
  setTimeout(function() {
    map.flyTo([9.315055, -79.134224], 19)
  }, 2000);
});
