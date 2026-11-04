// ===== EDIT THESE =====
const PLACE = "Hometown Soundscape";
const MOMENTS = [ // time in seconds, label, caption
  {img:"photo1.jpg", t:0,  label:"Call to Prayer", text:"The call to prayer rises over the quiet night."},
  {img:"photo2.jpg", t:20, label:"To the Mosque",  text:"People walk together and get ready to pray."},
  {img:"photo3.jpg", t:38, label:"Prayer",         text:"A moment of peace and prayer."},
  {img:"photo4.jpg", t:44, label:"Market",         text:"Music drifts through the busy market."},
  {img:"photo5.jpg", t:53, label:"Children",       text:"Children laugh and play."},
  {img:"photo6.jpg", t:56, label:"Family",         text:"Family gathers and talks."},
  {img:"photo7.jpg", t:66, label:"Home",           text:"Heading back home."}
];
// ======================
const $ = id => document.getElementById(id);
const audio = $("audio"), canvas = $("viz"), ctx = canvas.getContext("2d");
$("title").textContent = PLACE;
let actx, analyser, data, ripples = [];

function setup(){
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = actx.createAnalyser(); analyser.fftSize = 256;
    actx.createMediaElementSource(audio).connect(analyser);
    analyser.connect(actx.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
  } catch (err) { console.warn("Visualizer unavailable:", err); analyser = null; }
}
let current = null, layer = 0;
const layers = document.querySelectorAll(".photo");
function showMoment(m){
  current = m;
  $("caption").textContent = m.text;
  layers[layer].classList.remove("on");
  layer = 1 - layer;
  layers[layer].style.backgroundImage = `url("${m.img}"), linear-gradient(160deg,#27405e,#10151f)`;
  layers[layer].classList.add("on");
}
showMoment(MOMENTS[0]);
const fmt = s => Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");

async function startAudio(){
  setup();
  if (actx && actx.state === "suspended") await actx.resume();
  try { await audio.play(); } catch (err) { $("caption").textContent = "Audio error: " + err.message; }
}
$("play").onclick = () => audio.paused ? startAudio() : audio.pause();
audio.onerror = () => $("caption").textContent = "Can't load assets/soundscape.mp3 (check the file name and folder).";
audio.onplay  = () => $("play").textContent = "Pause";
audio.onpause = () => $("play").textContent = "Play";
audio.onended = () => $("play").textContent = "Replay";
$("vol").oninput = e => audio.volume = e.target.value;
$("seek").oninput = e => audio.currentTime = e.target.value/100*(audio.duration||0);
audio.ontimeupdate = () => {
  $("seek").value = audio.currentTime/(audio.duration||1)*100;
  $("time").textContent = fmt(audio.currentTime)+" / "+fmt(audio.duration||0);
  const m = [...MOMENTS].reverse().find(m => audio.currentTime >= m.t);
  if (m && m !== current) showMoment(m);
};
MOMENTS.forEach(m => {
  const b = document.createElement("button");
  b.textContent = m.label;
  b.onclick = () => { audio.currentTime = m.t; if (audio.paused) startAudio(); };
  $("moments").append(b);
});

// Mouse: parallax + ripples
addEventListener("pointermove", e => {
  const x = e.clientX/innerWidth-.5, y = e.clientY/innerHeight-.5;
  const s = document.documentElement.style;
  s.setProperty("--mx", -x*20+"px"); s.setProperty("--my", -y*20+"px");
  s.setProperty("--hue", x*60+"deg");
});
addEventListener("pointerdown", e => ripples.push({x:e.clientX,y:e.clientY,r:0,a:1}));

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

function draw(){
  requestAnimationFrame(draw);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let level = 0;
  if (analyser && !audio.paused){
    analyser.getByteFrequencyData(data);
    const bass = data.slice(0,8).reduce((a,b)=>a+b,0)/8/255;
    level = data.reduce((a,b)=>a+b,0)/data.length/255;
    const s = document.documentElement.style;
    s.setProperty("--pulse", 1.01+bass*.03);
    s.setProperty("--bright", .5+level*1.2);
    // radial frequency bars
    const cx = canvas.width/2, cy = canvas.height/2, base = Math.min(cx,cy)*.35;
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,179,71,.85)";
    data.forEach((v,i) => {
      const a = i/data.length*Math.PI*2, len = v/255*base*1.3;
      ctx.beginPath();
      ctx.moveTo(cx+Math.cos(a)*base, cy+Math.sin(a)*base);
      ctx.lineTo(cx+Math.cos(a)*(base+len), cy+Math.sin(a)*(base+len));
      ctx.stroke();
    });
  }
  ripples = ripples.filter(r => r.a > 0);
  ripples.forEach(r => {
    r.r += 4+level*10; r.a -= .015;
    ctx.strokeStyle = `rgba(255,255,255,${r.a})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.stroke();
  });
}
draw();
