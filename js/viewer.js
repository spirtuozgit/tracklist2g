const GITHUB_USER = "spirtuozgit";
const REPO = "tracklist2g";

const titleEl = document.getElementById("song-title");
const keyEl = document.getElementById("song-key");
const commentEl = document.getElementById("song-comment");
const textEl = document.getElementById("song-text");

const backBtn = document.getElementById("back-btn");

const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");

const scrollStartBtn = document.getElementById("scroll-start");
const scrollStopBtn = document.getElementById("scroll-stop");
const scrollSpeedInput = document.getElementById("scroll-speed");

let fontSize = 14;
let scrollInterval = null;

const currentSong = localStorage.getItem("currentSong");

/* Загрузка песни */
async function loadSong() {
    if (!currentSong) return;

    const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/songs/${currentSong}`;
    const raw = await fetch(url).then(r => r.text());
    const lines = raw.split("\n");

    titleEl.textContent = (lines[0] || "").trim();
    keyEl.textContent = (lines[1] || "").trim();
    commentEl.textContent = (lines[2] || "").trim();
    textEl.innerHTML = lines.slice(3).join("\n").replace(/\n/g, "<br>");
}

/* ZOOM */
zoomInBtn.onclick = () => {
    fontSize += 1;
    textEl.style.fontSize = fontSize + "px";
};

zoomOutBtn.onclick = () => {
    fontSize = Math.max(8, fontSize - 1);
    textEl.style.fontSize = fontSize + "px";
};

/* AUTO SCROLL */
function stopScroll() {
    clearInterval(scrollInterval);
    scrollInterval = null;
}

scrollStartBtn.onclick = () => {
    stopScroll();
    scrollInterval = setInterval(() => {
        window.scrollBy(0, Number(scrollSpeedInput.value));
    }, 60);
};

scrollStopBtn.onclick = stopScroll;

/* КНОПКА НАЗАД — ВОЗВРАТ НА НУЖНУЮ ВКЛАДКУ */
backBtn.onclick = () => {
    window.location.href = "index.html";
};

/* ЗАПУСК */
window.onload = () => {
    textEl.style.fontSize = fontSize + "px";
    loadSong();
};
