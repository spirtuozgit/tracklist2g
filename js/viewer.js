/* ============================================
   2G+ Tracklist — VIEWER
   Просмотр одной песни
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

/* ------- Получить имя файла текущей песни -------- */
const currentSong = localStorage.getItem("currentSong");

if (!currentSong) {
    textEl.innerHTML = "<p style='color:#f55;'>Песня не найдена</p>";
}

/* ------- Подгрузить файл с GitHub -------- */
async function loadSong() {
    const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/main/songs/${currentSong}`;

    const raw = await fetch(url).then(r => r.text());
    const lines = raw.split("\n");

    const title = lines[0].replace("#", "").trim();
    const key = (lines[1] || "").trim();
    const comment = (lines[2] || "").replace("(Комментарий:", "").replace(")", "").trim();

    // остальной текст
    const bodyLines = lines.slice(3).join("\n");

    titleEl.textContent = title;
    keyEl.textContent = key;
    commentEl.textContent = comment;

    // простой markdown → html
    textEl.innerHTML = bodyLines
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    updateButtons();
}

/* ------- Обновление состояния кнопок -------- */
function updateButtons() {
    let tracklist = JSON.parse(localStorage.getItem("tracklist") || "[]");
    let played = JSON.parse(localStorage.getItem("played") || "[]");

    // Добавление
    if (tracklist.includes(currentSong)) {
        addBtn.textContent = "Убрать из треклиста";
        addBtn.classList.add("in-list");
    } else {
        addBtn.textContent = "Добавить в треклист";
        addBtn.classList.remove("in-list");
    }

    // Сыграно
    if (played.includes(currentSong)) {
        playedBtn.textContent = "Не сыграно";
        playedBtn.classList.add("is-played");
    } else {
        playedBtn.textContent = "Сыграно";
        playedBtn.classList.remove("is-played");
    }
}

/* ------- Добавить/убрать из треклиста -------- */
addBtn.onclick = () => {
    let t = JSON.parse(localStorage.getItem("tracklist") || "[]");

    if (t.includes(currentSong)) {
        t = t.filter(x => x !== currentSong);
    } else {
        t.push(currentSong);
    }

    localStorage.setItem("tracklist", JSON.stringify(t));
    updateButtons();
};

/* ------- Отметить как сыграно -------- */
playedBtn.onclick = () => {
    let p = JSON.parse(localStorage.getItem("played") || "[]");

    if (p.includes(currentSong)) {
        p = p.filter(x => x !== currentSong);
    } else {
        p.push(currentSong);
    }

    localStorage.setItem("played", JSON.stringify(p));
    updateButtons();
};

/* ------- Назад -------- */
backBtn.onclick = () => {
    window.location.href = "index.html";
};

/* ------- Запуск -------- */
loadSong();
