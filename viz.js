// NOTE: Need to compile with browserify viz.js -o main.js
var SolidityCoder = require("web3/lib/solidity/coder.js");

network = "dev"

if (network === "ropsten") {
  var PAJcontractAddress = '0x4DF38642b0FfF8186549B066394091baB8F72583';
  var ECOBcontractAddress = '0x0e49059004513Aec9565317A4A2262ddd77A9c63';

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));
} else if (network === "dev") {
  var PAJcontractAddress = '0xBb11DdCF232f5C7Dc18a5BDBE8060D004a2eC5ef';
  var ECOBcontractAddress = '0x5c1e451495B2Cd0bfd060B38368F51648eeb9576';

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
} else {
  console.log("Unknown Network!")
}
var accounts = web3.eth.accounts;
var account = accounts[0];


web3.eth.defaultAccount = account;

// Assemble function hashes

var functionHashes = getFunctionHashes(abiArray);

// Get hold of contract instance

var contract = web3.eth.contract(abiArray).at(PAJcontractAddress);
var ecob = web3.eth.contract(abiArrayEcob).at(ECOBcontractAddress);


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
  
  ecob.approve(to, amount, function(err, txHash){
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

$('#buyAllotment').click(buyAllotment);
function buyAllotment() {
  //var to = document.getElementById('buyAllotTo').value;
  var amount = document.getElementById('buyAllotAmount').value;
  /*console.log(to, amount);
  
  if (ecob.allowance(account, PAJcontractAddress).toNumber() >= amount*1500) {
    contract.buyAllotments(amount, to, function(err, txHash){
      let txReceipt = web3.eth.getTransactionReceipt(txHash);
      // txReceipt.logs contains an array of all events fired while calling your fxn
      console.log(err, txReceipt);
      var log = txReceipt.logs[0];
      var data = SolidityCoder.decodeParams(
                  ["address", "uint"], log.data.replace("0x", "")
                 );
      console.log(data);
      updateMap();
    });

  // TODO: Remove
  /*console.log(PAJcontractAddress, account)
  console.log(ecob.allowance(account, PAJcontractAddress).toNumber())
    newAllots = getRandomAllotments(amount, 2)
    for (i = 0; i < amount; i++) {
      (function(index) {
        setTimeout(function() { 
          map.flyTo(mamoniData["features"][newAllots[index]]["geometry"]["coordinates"][0][0].reverse(), 20)
        }, i*10000);
      })(i);
    }*/
  } else {
    alert("Not enough ecobucks!")
  }
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
  $.getJSON("allotments.json", function(allotArray) {
    console.log(allotArray);
    allotArray = allotArray.slice(0,10)
    console.log(allotArray);
    contract.createAllotment(allotArray, {from: accounts[0], gas: 8000000}, function(err, txHash) {
      console.log(err, txHash);
      let txReceipt = web3.eth.getTransactionReceipt(txHash);
      // txReceipt.logs contains an array of all events fired while calling your fxn
      console.log(txReceipt);
      var log = txReceipt.logs[0];
      console.log(log);
      //var data = SolidityCoder.decodeParams(
      //            ["address", "uint", "uint[2][][]", "uint"], 
      //            log.data.replace("0x", "")
      //           );
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
    var data = SolidityCoder.decodeParams(
                ["uint", "uint", "bool"], log.data.replace("0x", "")
               );
    console.log(data);
  });

}

$('#ownedAllotments').click(ownedAllotments);
function ownedAllotments() {
  var addr = document.getElementById('ownedAllotAddr').value;
  console.log(contract.ownedAllotments(addr))
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
  var ecobAllowed = ecob.allowance(account, PAJcontractAddress) / 100;
  $('#label4').text(ecobAllowed + "-" + ecobBalance);

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

/*

// Load map
var geojson;

// TODO: Change this back to 3 in prod testing is 18
var map = L.map('leaflet-map').setView([9.315056, -79.134224], 18); 

//var mapboxAccessToken = "pk.eyJ1IjoibHVjYXNvYmUiLCJhIjoiY2p5cWdqeTI2MDA1YzNpcjNkdHkya3BieCJ9.1sPGdqMODcBf8w8gG0-KRw";
/*L.tileLayer('tiles/{z}/{x}/{y}.png', {
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
    this._div.innerHTML = '<h4>Mamoni Valley Allotments</h4>' + 
      (props ? 'Allotment <b>#' + (props.POLY_ID + 1) + 
      '</b><br />Current Owner: ' + 
      (
        props.owned === 0 ? 'Unowned' : 
        props.owned === 1 ? 'Another user' : 
        props.owned === 2 ? 'You' :
                            'Error.'
      ) 
      : 'Hover over an allotment');
};

info.addTo(map);

// Add colors to data
function getColor(d) {
    return d==0 ? '#7C7E82' : 
           d==1 ? '#020506' :
           d==2 ? '#F8F8F8' :
                  '#931621';console.log('Error in the owned allotments!')
}
// Add opacity to data
function getOpacity(d) {
    return d==0 ? '0.5' : 
           d==1 ? '0.35' :
           d==2 ? '0.15' :
                  '1';console.log('Error in the owned allotments!')
}
function ownedStyle(owned) {
    return {
        fillColor: '#292B2E',
        weight: 1,
        opacity: 1,
        color: getColor(owned),
        dashArray: '',
        fillOpacity: getOpacity(owned) 
    };
}
function style(feature) {
    return ownedStyle(feature.properties.owned);
}
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        color: getColor(layer.feature.properties.owned),
        dashArray: '',
        fillOpacity: 0.2
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function zoomToFeature(e) {
    console.log(e.target.getBounds())
    map.fitBounds(e.target.getBounds(), {padding: [50, 50]});
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Format geojson data from coin storage to correct values
// given the linear transition formula used
// old coord * range + min
latRange = 0.000000002472999993
latMin = -79.13447876

lngRange = 0.000000001404705343
lngMin = 9.314199281

for(i = 0; i < mamoniData["features"].length; ++i) {
  for(j=0; j < mamoniData["features"][i]["geometry"]["coordinates"][0].length;++j) {
    if (JSON.stringify(mamoniData["features"][i]["geometry"]["coordinates"][0][j]) == "[0,0]") {
      mamoniData["features"][i]["geometry"]["coordinates"][0].splice(j, 1);
      --j;
      continue
    }
    mamoniData["features"][i]["geometry"]["coordinates"][0][j][0] = mamoniData["features"][i]["geometry"]["coordinates"][0][j][0]*latRange+latMin;
    mamoniData["features"][i]["geometry"]["coordinates"][0][j][1] = mamoniData["features"][i]["geometry"]["coordinates"][0][j][1]*lngRange+lngMin;
    }
}

function updateMap() {
    for (i = 0; i < 3; ++i) {
      geojson.eachLayer(function(layer) {
        layer.setStyle(
          ownedStyle(layer.feature.properties.owned)
        );
        if (layer.feature.properties.owned == i) {
          layer.bringToFront();
        }
      });
    }
}
function rand(max) {
  return Math.floor(Math.random()*max)
}

// TODO: Delete this function once allotments can be bought
// Testing function to assign the allotments in demo
function getRandomAllotments(max, owned) {
  newAllots = [];
  for (i = 0;i<max;++i) {
    allotId = rand(2700)
    mamoniData["features"][allotId]["properties"]["owned"] = owned;
    newAllots.push(allotId);
  }
  updateMap()
  return newAllots
}
// Add geojson data to map
function refreshJSON() {
  geojson = L.geoJson(mamoniData, {
    style: style, 
    onEachFeature: onEachFeature
  }).addTo(map);
}

*/

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
  /*

  refreshJSON()
  var imageUrl = 'trees2.jpg';
  var imageBounds = [
    [9.314199280639645, -79.13447876220697], 
    [9.315603985982538, -79.13174062421352]
  ];

  L.imageOverlay(imageUrl, imageBounds).addTo(map);
  
  // TODO: Remove this once allotments can be bought properly
  getRandomAllotments(2000, 1)


  setInterval(function() {
    updateMap();
  }, 10000);

  setTimeout(function() {
   // TODO: FOR PROD UNCOMMENT
   //  map.flyTo([9.315055, -79.134224], 19)
  }, 10000);

  */
});
