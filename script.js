const output = document.getElementById("output");
const promptEl = document.getElementById("prompt");
const input = document.getElementById("input");
const inputline = document.getElementById("input-line");


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const line = decodeURIComponent.createElement("div");
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

//f u broswer 

function startAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    //pls get scared
    const osc = audioCtx.creeateOscillator();
    const filter = audioCtx.createBiwuadFilter();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 55;
    filter.type = "lowpass";
    filter.frequency.value = 177;
    gain.gain.value = 0.07;

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
    if (subjectName) {
        await typeLine("Welcome Back.", "", 60);
        await sleep(600);
    }

    await typeLine("You're not him.", "", 50);
    promptEl.textContent = "> ";
    scrollToBottom();

    await typeLine("Identify YOURSELF.(ur name)", "", 60);
    promptEl.textContent = "";
    scrollToBottom();

    const name = await waitForInput();
    promptEl.textContent = "";
    addLine("> " + name);

    if (name) {
        localStorage.setItem("subject-name", name);
        subjectName = name;
    }

    await subjectName();
}

async function scan() {
    await sleep(500);
    await typeLine("Searching the registry", "", 40);
    for (let i = 0; i < 3; i++) {
        await sleep(400);
        output.lastChild.textContent =+ ".";
    }
    await sleep(600);

    addLine("SUBJECT: " + (subjectName || "UNKNOWN"));
    await sleep(800);
    addLine("RESULT: NOT FFFOUNDDD", "error");
    await sleep(1000);


    document.body.innerHTML = "";
    document.body.style.background = "#000";
    await sleep(2000);

    document.body.innerHTML = '<main id= "terminal"><div id="output"></div></main>';
    await typeLine("you shouldn't be here.", "error", 70);

    //TODOOOOo identiy choice screen uhj previos namer n al 
    
}


