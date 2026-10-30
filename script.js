const output = document.getElementById("output");
const promptEl = document.getElementById("prompt");
const input = document.getElementById("input");
const inputLine = document.getElementById("input-line");

const scareVoice = new Audio("voice.mp3");
scareVoice.volume = 0.9;

const dreadAudio = new Audio("dread.mp3");
dreadAudio.volume = 0.2;

function playScare() {
    scareVoice.currentTime = 0;
    scareVoice.play();
}

function playBulbOn() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(120, now+0.8);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.03, now + 0.1);
    g.gain.linearRampToValueAtTime(0.02, now = 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.4);

    //swritch click
    playKeyClick();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function glitchScreen(duration = 900) {
    const term = document.getElementById("terminal");
    term.classList.add("glitch");
    await sleep(duration);
    term.classList.remove("glitch");
}

async function typeLine(text, className = "", speed = 45) {
    const line = document.createElement("div");
    if (className) line.className = className;
    output.appendChild(line);

    for (const char of text ) {
        line.textContent += char;
        await sleep(speed);
    }
    return line;
}

function addLine(text, className = "") {
    const line = document.createElement("div");
    line.textContent = text;
    if (className) line.className = className;
    output.appendChild(line);
    return line;
}

function scrollToBottom() {
    const term = document.getElementById("terminal");
    term.scrollTop = term.scrollHeight;
}

let audioCtx = null;
let humGain = null;

//f u broswer 

function startAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    //pls get scared
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 55;
    filter.type = "lowpass";
    filter.frequency.value = 177;
    gain.gain.value = 0.07;
    humGain = gain;

    osc.connect(filter).connect(gain).connect(audioCtx.destination);
    osc.start();
}


//for those who dont have mechanical keyboard(me)
function playKeyClick() {
    if (!audioCtx) return;
    const duration = 0.02;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 -1) * (1 - i / data.length);
    }

    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.07;
    source.buffer = buffer;
    source.connect(gain).connect(audioCtx.destination);
    source.start();
}


let subjectName = localStorage.getItem("subject-name");

function waitForInput() {
    return new Promise((resolve) => {
        function onKey(e) {
            if (e.key === "Enter") {
                const value = input.value.trim();
                input.value = "";
                input.removeEventListener("keydown", onKey);
                resolve(value);
            } else {
                playKeyClick();
            }
        }
        input.addEventListener("keydown", onKey);
        input.focus();
    });
}
async function intro() {
    document.addEventListener("click", startAudio, {once: true});
    document.addEventListener("keydown", startAudio, {once:true});

    await sleep(800);
    
    await typeLine("Welcome Back.", "", 60);
        await glitchScreen(900);
        await sleep(2500);
        await typeLine("wait... you are not him.", "error", 50);
        await sleep(800);

    await typeLine("Identify YOURSELF.", "", 60);
    await typeLine("(your name)", "narration", 40);
    promptEl.textContent = "";
    scrollToBottom();

    const name = await waitForInput();
    promptEl.textContent = "";
    addLine("> " + name);

    if (name) {
        localStorage.setItem("subject-name", name);
        subjectName = name;
    }

    await scan();
}

async function scan() {
    await sleep(500);
    await typeLine("Searching the registry", "", 40);
    for (let i = 0; i < 3; i++) {
        await sleep(400);
        output.lastChild.textContent += ".";
    }
    await glitchScreen(2000);
    await nameSlam(subjectName || "UNKNOWN");
    await sleep(600);

    addLine("SUBJECT: " + (subjectName || "UNKNOWN"));
    await sleep(800);
    addLine("RESULT: NOT FFFOUNDDD", "error");
    await glitchScreen(3000);


    const blackout = document.getElementById("blackout");
    blackout.classList.add("active");
    await sleep(2000);
    blackout.classList.remove("active");
    output.innerHTML = "";

    await sleep(1000);
    await typeLine("You shouldn't be here.", "error", 70);

    await sleep(1200);
    await typeLine("You are an error.", "error", 60);
    await sleep(1000);

    await identityChoice();
    
}

function chooseOption(option) {
    return new Promise((resolve) => {
        const wrap = document.createElement("div");
        wrap.className = "choices";

        option.forEach((opt) => {
            const btn = document.createElement("button");
            btn.className = "choice";
            btn.textContent = "[ " + opt.label + " ]";
            btn.addEventListener("click", () => {
                wrap.remove();
                resolve(opt.value);
            });
            wrap.appendChild(btn);
        });

        output.appendChild(wrap);
        scrollToBottom();
    });
}

async function identityChoice() {

    await typeLine("Identify yourself.", "", 60);
    await sleep(400);
    const rejections = [
        "You.. You think you can fool me.?",
        "That name is not yours anymore.",
        "Look closer. That is not you.",
    ];
    let nameTries = 0;

    while (true) {
        const options = [];
        if (subjectName && nameTries < rejections.length) {
            options.push({ label: "I am " + subjectName, value: "name"});
        }
        options.push({label: "W-wait who am i?", value: "unknown"});

        const choice = await chooseOption(options);
        if (choice === "unknown") break;

        addLine( "> I am " + subjectName);
        await sleep(500);
        addLine(rejections[nameTries], "error");
        nameTries++;
        await sleep(900);
    }

    await sleep(800);
    await typeLine("...who are you, then?", "", 60);

    await sleep(1000);
    await questionBeat();
}

async function questionBeat() {
    await typeLine("You were here before.", "", 60);

    const choice = await chooseOption([
        {label: "I was here before?", value: "before" },
        { label: "I don't remember", value: "forget" },
        {label: "Who left it?", value: "who"},
    ]);

    const replies = {
        before: ["> Iwas here before", "Yes. You alway say that."],
        forget: ["> I don't remember", "Then look harder."],
        who:    ["> Who left it?", "Nobody. YOU did."],
    };

    addLine(replies[choice][0]);
    await sleep(700);
    await typeLine(replies[choice][1], "error", 60);
    await sleep(1200);

    dreadSequence();
}

function scaryVoice(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch - 0.1;
    u.rate - 0.6;
    u.volume = 1;
    speechSynthesis.speak(u);
}

async function nameSlam(name) {
    const slam = document.getElementById("slam");
    slam.innerHTML = "";
    slam.classList.add("active");
    document.body.classList.add("glitch");

    await sleep(1500);
    playScare();

    for (let i = 0; i < 45; i++) {
        const s = document.createElement("span");
        s.textContent = name;
        s.style.fontSize = (1 + Math.random() * 3) + "rem";
        s.style.top = (Math.random() * 100) + "%";
        s.style.left = (Math.random() * 100) + "%";
        s.style.opacity = (0.2 + Math.random() * 0.6).toString();
        slam.appendChild(s);
        await sleep(90);
    } 

    fadeHum(1);
    await sleep(1000);

    const big = document.createElement("span");
    big.className = "big";
    big.textContent = name;
    slam.appendChild(big);

    await sleep(2850);

    document.body.classList.remove("glitch");
    slam.classList.remove("active");
    slam.innerHTML = "";
    restoreHum(0.5);
}

function fadeHum(seconds = 1) {
    if (!humGain || !audioCtx) return;
    const now = audioCtx.currentTime;
    humGain.gain.cancelScheduledValues(now);
    humGain.gain.setValueAtTime(humGain.gain.value, now);
    humGain.gain.linearRampToValueAtTime(0, now + seconds);
}

function restoreHum(seconds = 0.5) {
    if (!humGain || !audioCtx) return;
    const now = audioCtx.currentTime;
    humGain.gain.cancelScheduledValues(now);
    humGain.gain.setValueAtTime(humGain.gain.value, now);
    humGain.gain.linearRampToValueAtTime(0.07, now + seconds);
}

async function bulbFlicker() {
    playBulbOn();
    const pattern = [0, 0.4, 0, 0.9, 0.1, 0.6, 0.2, 1];
    for (const level of pattern) {
        redLevel = level;
        await sleep(90 + Math.random() * 120);
    }
    redLevel = 1;
}

async function dreadSequence() {
    const veil = document.getElementById("veil");
    const dread = document.getElementById("dread");
    const logo = document.getElementById("logo");

    output.innerHTML = "";
    document.getElementById("input-line").style.display = "none";

    dreadAudio.currentTime = 0;
    dreadAudio.play();

    const ticks = 60;
    const perTick = 2;

    for (let i = 0; i < ticks; i++) {
        for (let j = 0; j < perTick; j++) {
            const s = document.createElement("span");
            s.textContent = " who am i";
            s.style.left = (Math.random() * 110 -5) + "%";
            s.style.top = (Math.random() * 110 -5) + "%";
            s.style.fontSize = (0.7 + Math.random() * 2.2) + "rem";
            s.style.setProperty("--r", (Math.random() * 50 - 25) + "deg");
            dread.appendChild(s);
            requestAnimationFrame(() => {
                s.style.opacity = (0.1 + Math.random() * 0.4).toString();
            });
        }

        const progress = i / ticks;
        veil.style.opacity = progress.toString();
        dreadAudio.volume = Math.min(1, 0.2 + progress * 0.8);

        await sleep(150);
    }

    fadeHum(1);
    dreadAudio.pause();
    veil.style.opacity = "0";
    dread.innerHTML = "";
    await sleep(4000);

    logo.classList.add("show");
}

intro();


