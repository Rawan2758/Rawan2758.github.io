const LAT = 31.7683, LON = 35.2137;
const $ = s => document.querySelector(s);
const T = {
  en: {title:"Jerusalem Now", temp:"Temperature", wind:"Wind", clouds:"Cloud cover", hijri:"Hijri date", prayers:"Prayer times", sound:"Begin ambient wind", mute:"Mute wind", unmute:"Play wind", loading:"Loading live data…", ok:"Live from Jerusalem · updated ", err:"Couldn't load live data. Check your connection; retrying in 1 minute.", more:"Read more on Wikipedia", lang:"العربية", kmh:"km/h", names:{Fajr:"Fajr",Sunrise:"Sunrise",Dhuhr:"Dhuhr",Asr:"Asr",Maghrib:"Maghrib",Isha:"Isha"}, weather:"Weather"},
  ar: {title:"القدس الآن", temp:"الحرارة", wind:"الرياح", clouds:"الغيوم", hijri:"التاريخ الهجري", prayers:"أوقات الصلاة", sound:"ابدأ صوت الرياح", mute:"إيقاف الصوت", unmute:"تشغيل الصوت", loading:"جارٍ تحميل البيانات…", ok:"مباشر من القدس · آخر تحديث ", err:"تعذّر تحميل البيانات. سنعيد المحاولة بعد دقيقة.", more:"المزيد في ويكيبيديا", lang:"English", kmh:"كم/س", names:{Fajr:"الفجر",Sunrise:"الشروق",Dhuhr:"الظهر",Asr:"العصر",Maghrib:"المغرب",Isha:"العشاء"}, weather:"الطقس"}
};
const SITES = {
  aqsa: {en:"Al-Aqsa Mosque", ar:"المسجد الأقصى", wiki:{en:"Al-Aqsa_Mosque", ar:"المسجد_الأقصى"}},
  dome: {en:"Dome of the Rock", ar:"قبة الصخرة", wiki:{en:"Dome_of_the_Rock", ar:"قبة_الصخرة"}},
  sepulchre: {en:"Church of the Holy Sepulchre", ar:"كنيسة القيامة", wiki:{en:"Church_of_the_Holy_Sepulchre", ar:"كنيسة_القيامة"}},
  damascus: {en:"Damascus Gate (Bab al-Amud)", ar:"باب العامود", wiki:{en:"Damascus_Gate", ar:"باب_العامود"}},
  olives: {en:"Mount of Olives", ar:"جبل الزيتون", wiki:{en:"Mount_of_Olives", ar:"جبل_الزيتون"}}
};
const KEYS = { // [sky top, sky bottom, stone]
  night:["#070b1f","#1b2545","#7a6e5c"], dawn:["#3b4a7a","#e8907a","#d6a47e"],
  day:["#3f8fd6","#bfe3f5","#e2c9a0"], dusk:["#2e3a72","#f08a4b","#e0a070"]
};
let lang = "en", weather = null, prayer = null, audio = null, current = null, failed = false, updated = "";

const rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
const mix = (a,b,t) => "#" + rgb(a).map((v,i) => Math.round(v+(rgb(b)[i]-v)*t).toString(16).padStart(2,"0")).join("");
function skyAt(now, sr, ss) {
  const m = (now-sr)/6e4, s = (now-ss)/6e4; let a, b, t;
  if (m < -60 || s > 60) return KEYS.night;
  if (m < 0) { a=KEYS.night; b=KEYS.dawn; t=(m+60)/60; }
  else if (m < 60) { a=KEYS.dawn; b=KEYS.day; t=m/60; }
  else if (s < -60) return KEYS.day;
  else if (s < 0) { a=KEYS.day; b=KEYS.dusk; t=(s+60)/60; }
  else { a=KEYS.dusk; b=KEYS.night; t=s/60; }
  return a.map((c,i) => mix(c,b[i],t));
}

async function loadWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,cloud_cover,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FJerusalem&forecast_days=1`;
  const r = await fetch(url); if (!r.ok) throw new Error("weather");
  weather = await r.json();
}
async function loadPrayer() {
  const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${LAT}&longitude=${LON}`);
  if (!r.ok) throw new Error("prayer");
  prayer = (await r.json()).data;
}
async function refresh() {
  try {
    await Promise.all([loadWeather(), loadPrayer()]);
    failed = false; updated = new Date().toLocaleTimeString();
    applySky(); applyClouds(); tuneWind();
  } catch (e) { failed = true; console.error(e); }
  render();
}

function applySky() {
  const c = weather.current, d = weather.daily;
  const [top, bottom, stone] = skyAt(new Date(c.time), new Date(d.sunrise[0]), new Date(d.sunset[0]));
  const root = document.documentElement.style;
  root.setProperty("--top", top); root.setProperty("--bottom", bottom); root.setProperty("--stone", stone);
  const lum = rgb(top).reduce((a,b) => a+b, 0);
  $("#stars").style.opacity = Math.max(0, Math.min(1, (250-lum)/200));
}
function applyClouds() {
  const c = weather.current, box = $("#clouds"); box.innerHTML = "";
  const n = Math.round(c.cloud_cover / 12), dur = Math.max(30, 140 - c.wind_speed_10m * 3);
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div"); el.className = "cloud";
    el.style.top = (4 + Math.random()*30) + "vh";
    el.style.transform = `scale(${0.7 + Math.random()*1.3})`;
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = "-" + Math.random()*dur + "s";
    box.appendChild(el);
  }
}

function render() {
  const t = T[lang], c = weather && weather.current;
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("#title").textContent = t.title; $("#lang").textContent = t.lang;
  $("#sound").textContent = !audio ? t.sound : audio.ctx.state === "running" ? t.mute : t.unmute;
  $("#status").textContent = failed ? t.err : weather ? t.ok + updated : t.loading;
  if (c) $("#weather").innerHTML = `<h3>${t.weather}</h3>
    <p class="row"><span>${t.temp}</span><span>${c.temperature_2m}°C</span></p>
    <p class="row"><span>${t.wind}</span><span>${c.wind_speed_10m} ${t.kmh}</span></p>
    <p class="row"><span>${t.clouds}</span><span>${c.cloud_cover}%</span></p>`;
  if (prayer) {
    const h = prayer.date.hijri, nowMin = (d => d.getHours()*60 + d.getMinutes())(new Date(c.time));
    const order = ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];
    const mins = k => { const [H,M] = prayer.timings[k].slice(0,5).split(":"); return +H*60 + +M; };
    const next = order.find(k => mins(k) > nowMin) || "Fajr";
    $("#prayers").innerHTML = `<h3>${t.prayers}</h3>
      <p>${t.hijri}: ${h.day} ${lang === "ar" ? h.month.ar : h.month.en} ${h.year}</p>` +
      order.map(k => `<p class="row${k === next ? " next" : ""}"><span>${t.names[k]}</span><span>${prayer.timings[k].slice(0,5)}</span></p>`).join("");
  }
  document.querySelectorAll(".site").forEach(g => g.setAttribute("aria-label", SITES[g.dataset.key][lang]));
  if (current) showSite(current);
}

async function showSite(key) {
  current = key; const s = SITES[key], t = T[lang];
  $("#panel").hidden = false; $("#pTitle").textContent = s[lang]; $("#pText").textContent = "…"; $("#pImg").hidden = true;
  try {
    const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(s.wiki[lang])}`);
    if (!r.ok) throw new Error("wiki");
    const j = await r.json();
    if (current !== key) return;
    $("#pText").textContent = j.extract;
    if (j.thumbnail) { $("#pImg").src = j.thumbnail.source; $("#pImg").alt = s[lang]; $("#pImg").hidden = false; }
    $("#pLink").href = j.content_urls.desktop.page; $("#pLink").textContent = t.more;
  } catch (e) { $("#pText").textContent = t.err; $("#pLink").textContent = ""; }
}

function startWind() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass";
  const gain = ctx.createGain();
  src.connect(filter).connect(gain).connect(ctx.destination); src.start();
  audio = {ctx, filter, gain}; tuneWind();
}
function tuneWind() {
  if (!audio || !weather) return; const w = weather.current.wind_speed_10m, now = audio.ctx.currentTime;
  audio.filter.frequency.setTargetAtTime(150 + w*25, now, 1);
  audio.gain.gain.setTargetAtTime(Math.min(0.04 + w*0.006, 0.25), now, 1);
}

$("#lang").addEventListener("click", () => { lang = lang === "en" ? "ar" : "en"; render(); });
$("#sound").addEventListener("click", async () => {
  if (!audio) startWind(); else if (audio.ctx.state === "running") await audio.ctx.suspend(); else await audio.ctx.resume();
  render();
});
$("#close").addEventListener("click", () => { current = null; $("#panel").hidden = true; });
document.querySelectorAll(".site").forEach(g => {
  g.addEventListener("click", () => showSite(g.dataset.key));
  g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showSite(g.dataset.key); } });
});

render(); refresh(); setInterval(refresh, 60000);