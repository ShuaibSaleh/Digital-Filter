
var $canvas = $("#zplane_polezero2");
var canvasOffset = $canvas.offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top; 
var scrollX = $canvas.scrollLeft();
var scrollY = $canvas.scrollTop();

const conjugateTag = document.getElementById("conjugate");
const allPassEffect = document.getElementById("allPassEffect");
const sidebar = document.querySelector('.sidebar');
const style = getComputedStyle(sidebar);
let pad = document.getElementById("track_pad");

var startX;
var startY;
var zeros = new Array();     
var poles = new Array();      
var allPass = new Array();
var zerosNum = 0;
var polesNum = 0;
var allPassNum = 0;
var selectedPoint = -1;
let index = 0;
let itrator = 0;
let x_value = [];
let x_length = 0;
let input_signal = [];
let output_signal=[];
let update_flag = true;


// variables for mag and phase responses
var Z = new Array(100);
var freqAxis = new Array(100);

for (let i = 0; i < 100; i++) {
Z[i] = math.complex(
    math.cos(math.PI * (i / 100)),
    math.sin(math.PI * (i / 100))
);
freqAxis[i] = Math.PI * (i / 100);
}




// plot signal 
pad.addEventListener("mousemove", function (e) {
      itrator++;
      x_value.push(itrator);
      input_signal.push(100 - (e.y - 30) + 100);
      if(itrator>300){
        x_length=itrator-300
      }
      plot();
      send();
  });

  
function makePlotly_trackpad(x, y1, xrange, yrange, place) {
let traces = [
    {
    x: x,
    y: y1,
    name: " input",
    xaxis: "time ",
    yaxis: "magintude",
    line: {
        color: "#080a49f1",
        width: 3,
    },
    },
];
let layout = {
    // title: title,
    yaxis: {
    range: yrange,
    },
    margin: {
    // autoexpand: false,
    b: 15,
    r: 0,
    // l: 0,
    t: 28,
    },

    xaxis: {
    range: xrange,
    },
    plot_bgcolor: "wight",
    paper_bgcolor: "transparent",
};

let config = {
    responsive: true,
};

Plotly.newPlot(place, traces, layout, config);
}
    
    

function plot() {
makePlotly_trackpad( x_value, input_signal, [x_length, x_length + 300], null, "input_plot");
makePlotly_trackpad( x_value, output_signal, [x_length, x_length + 300], null, "output_plot"  );
}


function send(){

    let data = {
        zeros:zeros,
        poles:poles,
        inputSignal:input_signal
    };
    $.ajax({
        type: 'POST',
        url: '/processing',
        data: JSON.stringify(data),

        contentType: "application/json",
        success: function (backEndData) {
        var responce = JSON.parse(backEndData)
        output_signal = responce.output_signal;
        }
    
    })
    
    }
    



// plot signal 

function ExportZeroesPole(){

    let dataExportZeroesPole= {
        zeros:zeros,
        poles:poles
       
    };
    $.ajax({
        type: 'POST',
        url: '/ExportZeroesPole',
        data: JSON.stringify(dataExportZeroesPole),
        contentType: "application/json",
        
    
    }) }




function importFilter(){

var upload_filter = document.getElementById("uploaded_filter")
var upload_filter_path = upload_filter.value


let pathData= {
    path:upload_filter_path
   
};
$.ajax({
    type: 'POST',
    url: '/importZeroesPole',
    data: JSON.stringify(pathData),
    contentType: "application/json",

    success: function (backEndData) {
        var responce = JSON.parse(backEndData)
        zeros = responce.zeros;
        poles = responce.poles;
        
        setZplane(poles, zeros)
       
    }

})

}


//  addNewPole in the center  
function addNewPole() {
points = document.getElementById("poles");
var div = document.createElement("div");
div.id = "pole" + polesNum + "_polezero2";
points.appendChild(div);
poles.push([0, 0]);
polesNum = polesNum + 1;

setZplane(poles, zeros);

}

function addNewZero() {
points = document.getElementById("zeros");
var div = document.createElement("div");
div.id = "zero" + zerosNum + "_polezero2";
points.appendChild(div);
zeros.push([0, 0]);
zerosNum = zerosNum + 1;
setZplane(poles, zeros);

}

function clearAllPoints() {
poles = [];
zeros = [];
polesNum = 0;
zerosNum = 0;
setZplane(poles, zeros);
}




// /////////////////////////////////////// handel
function handleMouseDown(e) {
e.preventDefault();
if(style.width != "0px"){
startX = parseInt(e.clientX - offsetX) - 220;
}
else{
startX = parseInt(e.clientX - offsetX);
}
startY = parseInt(e.clientY - offsetY);
totalLength = polesNum + zerosNum;
// Put your mousedown stuff here
for (var i = 0; i < totalLength; i++) {
    if (pointHittest((startX + 70) / 100, -(startY - 150) / 100, i)) {
    selectedPoint = i;
    }
}
}

// handle mousemove events
// calc how far the mouse has been dragged since
// the last mousemove event and move the selected text
// by that distance
function handleMouseMove(e) {
if (selectedPoint < 0) {
    return;
}
e.preventDefault();
if(style.width != "0px"){
mouseX = parseInt(e.clientX - offsetX) - 220;
}
else{
mouseX = parseInt(e.clientX - offsetX);  
}
mouseY = parseInt(e.clientY - offsetY);
var dx = (mouseX - startX) / 100;
var dy = -(mouseY - startY) / 100;
startX = mouseX;
startY = mouseY;

if (selectedPoint >= poles.length) {
    zeros[selectedPoint - poles.length][0] += dx;
    zeros[selectedPoint - poles.length][1] += dy;
} else if (selectedPoint < poles.length) {
    poles[selectedPoint][0] += dx;
    poles[selectedPoint][1] += dy;
}
setZplane(poles, zeros);
}

// done dragging
function handleMouseUp(e) {
e.preventDefault();
selectedPoint = -1;
}

function handleMouseOut(e) {
e.preventDefault();
selectedPoint = -1;
}

// clicked pole or zero -> delete it
function handleMouseClick(e) {
if(style.width != "0px"){
startX = parseInt(e.clientX - offsetX) - 220;
}
else{
startX = parseInt(e.clientX - offsetX);
}
startY = parseInt(e.clientY - offsetY);
totalLength = polesNum + zerosNum;
for (var i = 0; i < totalLength; i++) {
    if (pointHittest((startX + 70) / 100, -(startY - 150) / 100, i)) {
    if (i >= polesNum) {
        zeros.splice(i - polesNum, 1);
        zerosNum = zerosNum - 1;
    } else if (i < polesNum) {
        poles.splice(i, 1);
        polesNum = polesNum - 1;
    }
    }
}
setZplane(poles, zeros);
}

// test if x,y is inside the bounding box of texts[textIndex]
function pointHittest(x, y, textIndex) {
if (textIndex >= polesNum) {
    return (
    x >= zeros[textIndex - polesNum][0] - 0.2 &&
    x <= zeros[textIndex - polesNum][0] + 0.2 &&
    y >= zeros[textIndex - polesNum][1] - 0.2 &&
    y <= zeros[textIndex - polesNum][1] + 0.2
    );
}
if (textIndex < polesNum) {
    return (
    x >= poles[textIndex][0] - 0.05 &&
    x <= poles[textIndex][0] + 0.05 &&
    y >= poles[textIndex][1] - 0.05 &&
    y <= poles[textIndex][1] + 0.05
    );
}
}

// listen for mouse events
$("#zplane_polezero2").mousedown(function (e) {
handleMouseDown(e);
});
$("#zplane_polezero2").mousemove(function (e) {
handleMouseMove(e);
});
$("#zplane_polezero2").mouseup(function (e) {
handleMouseUp(e);
});
$("#zplane_polezero2").mouseout(function (e) {
handleMouseOut(e);
});
$("#zplane_polezero2").contextmenu(function (e) {
handleMouseClick(e);
});





///////////////////////////////////////////////////


// add new all pass 
  function addNew() {
    let target = document.getElementById("allpass_lib");
    let input = document.getElementById("NewAllPassValue").value;
    target.innerHTML +=
      '<li><a href="#" onclick="showZplaneForAllPass(\'' +
      input +
      "')\" ondblclick=\"addNewAllPass('" +
      input +
      '\')"><i class="lni lni-inbox" style="color:#ffffffff"></i><span style="color:#ffffffff">a = ' +
      input +
      '</span></a>\
        <input type="checkbox" id="flag" onclick="addOrRemove(this, \'' +
      input +
      "')\"></li>";
  }



  function addNewAllPass(a) {
    allPass.push(math.complex(a));
    allPassNum = allPassNum + 1;
    setZplane(poles, zeros);
  }

  function removeAllPassFilter(a) {
    allPass = allPass.filter(function (value, index, arr) {
      return !math.equal(value, math.complex(a));
    });
    allPassNum = allPassNum - 1;
    setZplane(poles, zeros);
  }

  function addOrRemove(cb, a) {
    if (cb.checked) {
      addNewAllPass(a);
    } else {
      removeAllPassFilter(a);
    }
  }

//  start setzpalen 
function setZplane(poles, zeros) {
  var radius = 100; // radius of unit circle
  var pSize = 4; // size of pole and zero graphic
  var zSize = 4;
  
  var c = document.getElementById("zplane_polezero2");
  var ctx = c.getContext("2d");
  
  ctx.clearRect(0, 0, c.width, c.height);
  
  var pad = (c.width - 2 * radius) / 2; // padding on each side
  
  // unit circle
  ctx.beginPath();
  ctx.strokeStyle = "cyan";
  //  arc(x, y, radius, startAngle, endAngle)
  ctx.arc(radius + pad, radius + pad, radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  
  // y axis line 
  ctx.beginPath();
  ctx.strokeStyle = "lightgray";
  ctx.moveTo(radius + pad, 0);
  ctx.lineTo(radius + pad, c.height);
  
  // data on y axis 
  ctx.font = "italic 8px sans-serif";
  ctx.fillStyle = "#04a877fd";
  ctx.fillText("Im", radius + pad + 2, pad - 42);
  
  //  x axis line 
  ctx.moveTo(0, radius + pad);
  ctx.lineTo(c.width, radius + pad);
  ctx.fillText("Real", radius + radius + pad + 30, radius + pad - 2); // Draw it
  
  ctx.stroke();  // draw the lines 
  
  
  
  //  add poles
  ctx.strokeStyle = "red";
  var idx;
  for (idx = 0; idx < poles.length; idx++) {
      let x = radius + Math.round(radius * poles[idx][0]);
      let y = radius - Math.round(radius * poles[idx][1]);
  
      ctx.beginPath();
      ctx.moveTo(x - pSize + pad, y - pSize + pad);
      ctx.lineTo(x + pSize + pad, y + pSize + pad);
      ctx.moveTo(x - pSize + pad, y + pSize + pad);
      ctx.lineTo(x + pSize + pad, y - pSize + pad);
      ctx.stroke();
  
      if (conjugateTag.checked) {
      let x = radius + Math.round(radius * poles[idx][0]);
      let y = radius + Math.round(radius * poles[idx][1]);
      ctx.beginPath();
      ctx.moveTo(x - pSize + pad, y - pSize + pad);
      ctx.lineTo(x + pSize + pad, y + pSize + pad);
      ctx.moveTo(x - pSize + pad, y + pSize + pad);
      ctx.lineTo(x + pSize + pad, y - pSize + pad);
      ctx.stroke();
      }
  }
  
  // zeros
  ctx.strokeStyle = "blue";
  for (idx = 0; idx < zeros.length; idx++) {
      let x = radius + Math.round(radius * zeros[idx][0]);
      let y = radius - Math.round(radius * zeros[idx][1]);
      ctx.beginPath();
      ctx.arc(x + pad, y + pad, zSize, 0, 2 * Math.PI);
      ctx.stroke();
      if (conjugateTag.checked) {
      let x = radius + Math.round(radius * zeros[idx][0]);
      let y = radius + Math.round(radius * zeros[idx][1]);
      ctx.beginPath();
      ctx.arc(x + pad, y + pad, zSize, 0, 2 * Math.PI);
      ctx.stroke();
      }
  }
  

  if (allPassEffect.checked) {
      // allpass poles
      for (idx = 0; idx < allPass.length; idx++) {
        let x = radius + Math.round(radius * allPass[idx].re);
        let y = radius - Math.round(radius * allPass[idx].im);
        ctx.beginPath();
        ctx.moveTo(x - pSize + pad, y - pSize + pad);
        ctx.lineTo(x + pSize + pad, y + pSize + pad);
        ctx.moveTo(x - pSize + pad, y + pSize + pad);
        ctx.lineTo(x + pSize + pad, y - pSize + pad);
        ctx.stroke();
      }
  
      // allpass zeros
      for (idx = 0; idx < allPass.length; idx++) {
        let tempVar = math.divide(1, math.conj(allPass[idx]));
        let x = radius + Math.round(radius * tempVar.re);
        let y = radius - Math.round(radius * tempVar.im);
        ctx.beginPath();
        ctx.arc(x + pad, y + pad, zSize, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  
  drawResponses();
  }
  
  //  done setzpalen 
  
  // start draw respons 
  function drawResponses() {
  let magResponse = [];
  let phaseResponse = [];
  
  for (let i = 0; i < 100; i++) {
      let magPoint = math.complex(1, 0);
      let phasePoint = math.complex(1, 0);
  
  
      for (let j = 0; j < zeros.length; j++) {
          let temp = math.subtract(Z[i], math.complex(zeros[j][0], zeros[j][1]));
          magPoint *= temp.abs();
          phasePoint *= temp.arg();
      }
  
      for (let j = 0; j < poles.length; j++) {
          let temp = math.subtract(Z[i], math.complex(poles[j][0], poles[j][1]));
          magPoint /= temp.abs();
          phasePoint /= temp.arg();
      }
  
  // ///////////////////////
      if (allPassEffect.checked) {
          for (let j = 0; j < allPass.length; j++) {
              let temp = math.subtract(Z[i], math.divide(1, math.conj(allPass[j])));
              phasePoint *= temp.arg();
              temp = math.subtract(Z[i], allPass[j]);
              phasePoint /= temp.arg();
          }
      }
  // 
      magResponse.push(magPoint);
      phaseResponse.push(phasePoint);
  }
  
  // normalize
  var maxMag = Math.max(...magResponse);
  var maxPhase = Math.max(...phaseResponse);
  for (let i = 0; i < magResponse; i++) {
      magResponse[i] /= maxMag;
      phaseResponse[i] /= maxPhase;
  }
  let magData = [];
  let phaseData = [];
  for (let i = 0; i < 100; i++) {
      magData.push([freqAxis[i], magResponse[i]]);
      phaseData.push([freqAxis[i], phaseResponse[i]]);
  }
  // plot mag_response
  var container = document.getElementById("mag_response");
  // this graph take div as contianer and magData 
  graph = Flotr.draw(container, [magData], {
      
      yaxis: { max: 10, min: 0, color: "white" },
      xaxis: { color: "white" },
  
  });

  // plot phase_response
  var container = document.getElementById("phase_response");
  graph = Flotr.draw(container, [phaseData], {
      yaxis: { max: 4, min: -4, color: "white" },
      xaxis: { color: "white" },
  });
  

  input_signal.length = 0
  output_signal.length = 0
  x_value.length = 0
  x_length = 0
  itrator = 0
  
  }
  





  // show all pass filter 
  function showZplaneForAllPass(a) {

    if (a != "") {
      let zero = math.divide(math.complex(1, 0), math.conj(math.complex(a)));
      let pole = math.complex(a);
      var radius = 50; // radius of unit circle
      var pSize = 4; // size of pole and zero graphic
      var zSize = 4;

      var c = document.getElementById("allpass_zplane_polezero2");
      var ctx = c.getContext("2d");

      ctx.clearRect(0, 0, c.width, c.height);
      
      var pad = (c.width - 2 * radius) / 2; // padding on each side

      // unit circle
      ctx.beginPath();
      ctx.strokeStyle = "cyan";
      // (x,y ,r, 0,)
      ctx.arc(radius + pad, radius + pad, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // y axis
      ctx.beginPath();
      //ctx.lineWidth="1";
      ctx.strokeStyle = "white";
      ctx.moveTo(radius + pad, 0);
      ctx.lineTo(radius + pad, c.height);
      ctx.font = "italic 8px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Im", radius + pad + 2, pad - 2);

      // x axis
      ctx.moveTo(0, radius + pad);
      ctx.lineTo(c.width, radius + pad);
      ctx.fillText("Real", radius + radius + pad + 2, radius + pad - 2);
      ctx.stroke(); // Draw it


      // pole
      ctx.strokeStyle = "red";
      let x = radius + Math.round(radius * pole.re);
      let y = radius - Math.round(radius * pole.im);
      ctx.beginPath();
      ctx.moveTo(x - pSize + pad, y - pSize + pad);
      ctx.lineTo(x + pSize + pad, y + pSize + pad);
      ctx.moveTo(x - pSize + pad, y + pSize + pad);
      ctx.lineTo(x + pSize + pad, y - pSize + pad);
      ctx.stroke();

      // zero
      ctx.strokeStyle = "blue";
      x = radius + Math.round(radius * zero.re);
      y = radius - Math.round(radius * zero.im);
      ctx.beginPath();
      ctx.arc(x + pad, y + pad, zSize, 0, 2 * Math.PI);
      ctx.stroke();

      drawResponseOfAllPass(a);
    }
  }

  function drawResponseOfAllPass(a) {
    let zero = math.divide(1, math.conj(math.complex(a)));
    let pole = math.complex(a);
    let phaseResponse = [];

    for (let i = 0; i < 100; i++) {
      let phasePoint = math.complex(1, 0);
      let temp = math.subtract(Z[i], math.complex(zero.re, zero.im));
      // measure destace from orgin to  point 
      phasePoint *= temp.arg();
      temp = math.subtract(Z[i], math.complex(pole.re, pole.im));

      phasePoint /= temp.arg();
      phaseResponse.push(phasePoint);
    }

    // normalize
    var maxPhase = Math.max(...phaseResponse);
    for (let i = 0; i < phaseResponse; i++) {
      phaseResponse[i] /= maxPhase;
    }

    let phaseData = [];

    for (let i = 0; i < 100; i++) {
      phaseData.push([freqAxis[i], phaseResponse[i]]);
    }

    // plot phase_response
    var container = document.getElementById("allpass_phase_response");
    graph = Flotr.draw(container, [phaseData], {
      yaxis: { max: 5, min: -5, color: "white" },
      xaxis: { color: "white" },
    });
  }

setZplane(poles, zeros);


