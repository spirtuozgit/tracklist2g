/* ============================================
   2G+ Song Viewer — Zoom + AutoScroll + Tracklist
   (улучшенная версия на основе твоего файла)
   ============================================ */

const GITHUB_USER = "spirtuozgit";
const REPO = "tracklist2g";
const BRANCH = "main";

const titleEl = document.getElementById("song-title");
const keyEl = document.getElementById("song-key");
const commentEl = document.getElementById("song-comment");
const textEl = document.getElementById("song-text");

const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");
const playedBtn = document.getElementById("played-btn");

// NEW — Zoom buttons
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");

// NEW — Autoscroll
const scrollStartBtn = document.getElementById("scroll-start");
const scrollStopBtn = document.getElementById("scroll-stop");
const scrollSpeedInput = document.getElementById("scroll-speed");

let fontSize = 18;
let scrollInterval = null;

/* ------- Получение имени файла текущей песни -------- */
const currentSong = localStorage.getItem("currentSong");

if (!currentSong) {
    textEl.innerHTML = "<p style='color:#f55;'>Песня не найдена</p>";
}

/* ------- Очистка заголовка -------- */
function cleanTitle(line) {
    return line
        .replace(/^\uFEFF/, "")
        .replace(/^\\/, "")
        .replace(/^#/, "")
        .trim();
}

/* ------- Загрузка Markdown песни -------- */
async function loadSong() {
    const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/songs/${currentSong}`;
    const raw = await fetch(url).then(r => r.text());
    const lines = raw.split("\n");

    const title = cleanTitle(lines[0] || "");
    const key = (lines[1] || "").trim();
    let comment = (lines[2] || "").trim();

    comment = comment.replace("(Комментарий:", "").replace(")", "").trim();

    const body = lines.slice(3).join("\n");

    titleEl.textContent = title;
    keyEl.textContent = key;
    commentEl.textContent = comment;

    // Простейший Markdown → HTML
    textEl.innerHTML = body
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    updateButtons();
}

/* ------- Обновление кнопок "Добавить / Сыграно" -------- */
function updateButtons() {
    let tracklist = JSON.parse(localStorage.getItem("tracklist") || "[]");
    let played = JSON.parse(localStorage.getItem("played") || "[]");

    // кнопка добавления
    if (tracklist.includes(currentSong)) {
        addBtn.textContent = "Убрать из треклиста";
        addBtn.classList.add("in-list");
    } else {
        addBtn.textContent = "Добавить в треклист";
        addBtn.classList.remove("in-list");
    }

    // кнопка сыграно
    if (played.includes(currentSong)) {
        playedBtn.textContent = "Не сыграно";
        playedBtn.classList.add("is-played");
    } else {
        playedBtn.textContent = "Сыграно";
        playedBtn.classList.remove("is-played");
    }
}

/* ------- Добавить / убрать из треклиста -------- */
addBtn.onclick = () => {
    let list = JSON.parse(localStorage.getItem("tracklist") || "[]");

    if (list.includes(currentSong)) {
        list = list.filter(x => x !== currentSong);
    } else {
        list.push(currentSong);
    }

    localStorage.setItem("tracklist", JSON.stringify(list));
    updateButtons();
};

/* ------- Сыграно -------- */
playedBtn.onclick = () => {
    let played = JSON.parse(localStorage.getItem("played") || "[]");

    if (played.includes(currentSong)) {
        played = played.filter(x => x !== currentSong);
    } else {
        played.push(currentSong);
    }

    localStorage.setItem("played", JSON.stringify(played));
    updateButtons();
};

/* ------- Назад -------- */
backBtn.onclick = () => {
    window.location.href = "index.html";
};

/* ============================================
   ZOOM (A+ / A−)
   ============================================ */

zoomInBtn.onclick = () => {
    fontSize += 2;
    textEl.style.fontSize = fontSize + "px";
};

zoomOutBtn.onclick = () => {
    fontSize = Math.max(10, fontSize - 2);
    textEl.style.fontSize = fontSize + "px";
};

/* ============================================
   AUTO SCROLL (Старт / Стоп + скорость)
   ============================================ */

function stopScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}

scrollStartBtn.onclick = () => {
    stopScroll();

    const speed = Number(scrollSpeedInput.value); // px per tick
    const interval = 80; // ms

    scrollInterval = setInterval(() => {
        window.scrollBy(0, speed);

        // Остановка в конце страницы
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
            stopScroll();
        }
    }, interval);
};

scrollStopBtn.onclick = stopScroll;

/* ------- Запуск -------- */
window.onload = () => {
    textEl.style.fontSize = fontSize + "px";
    loadSong();
};
