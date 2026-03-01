let audioCtx, analyser, source;
let freqData, timeData;

let baseline = [];
let mu = null, sigma = null;

let mode = "idle";
let calibrationCount = 0;

const CALIBRATION_WINDOWS = 30;

const canvas = document.getElementById("viz");
const ctx = canvas.getContext("2d");

function mean(a){ return a.reduce((x,y)=>x+y)/a.length; }
function std(a){ let m=mean(a); return Math.sqrt(mean(a.map(x=>(x-m)**2))); }

async function initAudio(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();

    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    source = audioCtx.createMediaStreamSource(stream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);

    loop();
}

function extractFeatures(){

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    // RMS
    let sumSq = 0;
    for(let i=0;i<timeData.length;i++){
        let v = (timeData[i]-128)/128;
        sumSq += v*v;
    }
    let rms = Math.sqrt(sumSq/timeData.length);

    // Zero Crossing Rate
    let zcr = 0;
    for(let i=1;i<timeData.length;i++){
        if((timeData[i-1]-128)*(timeData[i]-128) < 0) zcr++;
    }
    zcr /= timeData.length;

    // Spectral Centroid
    let weighted = 0, total = 0;
    for(let i=0;i<freqData.length;i++){
        weighted += i * freqData[i];
        total += freqData[i];
    }
    let centroid = total ? weighted/total : 0;

    // Spectral Bandwidth
    let bw = 0;
    for(let i=0;i<freqData.length;i++){
        bw += ((i-centroid)**2)*freqData[i];
    }
    bw = total ? Math.sqrt(bw/total) : 0;

    // Spectral Flux
    let flux = 0;
    for(let i=1;i<freqData.length;i++){
        flux += Math.abs(freqData[i]-freqData[i-1]);
    }
    flux /= freqData.length;

    return [rms, zcr, centroid, bw, flux];
}

function computeStats(data){
    const cols = data[0].map((_,i)=>data.map(r=>r[i]));
    mu = cols.map(c=>mean(c));
    sigma = cols.map(c=>std(c)+1e-6);
}

function computeRisk(f){
    const z = f.map((x,i)=>(x-mu[i])/sigma[i]);
    const rmsZ = Math.sqrt(mean(z.map(v=>v*v)));
    return Math.min((rmsZ/4)*100,100);
}

function updateUI(risk){
    document.getElementById("fill").style.width = risk+"%";
    document.getElementById("riskText").innerText = "Risk: "+risk.toFixed(1)+"%";

    let status = document.getElementById("status");

    if(risk > 70){
        status.innerText = "⚠ ENGINE FAULT";
        status.style.color = "#ff3b3b";
    }else if(risk > 40){
        status.innerText = "⚡ WARNING";
        status.style.color = "#ffaa00";
    }else{
        status.innerText = "✔ Normal";
        status.style.color = "#00ffc8";
    }
}

function draw(){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    analyser.getByteFrequencyData(freqData);

    let barWidth = canvas.width/freqData.length;
    for(let i=0;i<freqData.length;i++){
        let h = freqData[i]/2;
        ctx.fillStyle="rgb(0,"+(h+100)+",200)";
        ctx.fillRect(i*barWidth,canvas.height-h,barWidth,h);
    }
}

function loop(){
    requestAnimationFrame(loop);
    draw();

    if(mode==="calibrating"){
        let f = extractFeatures();
        baseline.push(f);
        calibrationCount++;

        document.getElementById("status").innerText =
            "Calibrating... "+calibrationCount+"/"+CALIBRATION_WINDOWS;

        if(calibrationCount>=CALIBRATION_WINDOWS){
            computeStats(baseline);
            mode="ready";
            document.getElementById("monitor").disabled=false;
            document.getElementById("status").innerText="Calibration Complete";
        }
    }

    else if(mode==="monitoring"){
        let f = extractFeatures();
        let risk = computeRisk(f);
        updateUI(risk);
    }
}

document.getElementById("calibrate").onclick = async ()=>{
    await initAudio();
    baseline=[];
    calibrationCount=0;
    mode="calibrating";
};

document.getElementById("monitor").onclick = ()=>{
    mode="monitoring";
    document.getElementById("status").innerText="Monitoring...";
};