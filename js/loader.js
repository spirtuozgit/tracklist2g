/* ============================================
   2G+ Tracklist — LOADER (исправленная версия)
   ============================================ */

const GITHUB_USER = "spirtuozgit";
const REPO = "tracklist2g";
const BRANCH = "main";

const songList = document.getElementById("song-list");
const refreshBtn = document.getElementById("refresh-btn");

/* ------- Получение всех md-файлов из /songs -------- */
async function fetchSongFiles() {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/songs?ref=${BRANCH}`;
    const list = await fetch(url).then(r => r.json());

    if (!Array.isArray(list)) throw new Error("GitHub API error");

    return list.filter(f => f.name.endsWith(".md")).map(f => ({
        name: f.name,
        download_url: f.download_url
    }));
}

/* ------- Загрузка одного md файла -------- */
async function loadSongMeta(file) {
    const raw = await fetch(file.download_url).then(r => r.text());
    const lines = raw.split("\n");

    // удаляем BOM
    lines[0] = lines[0].replace("\uFEFF", "");

    const title = lines[0].replace("#", "").trim();
    const key = (lines[1] || "").trim();
    let comment = (lines[2] || "").trim();

    comment = comment
        .replace("(Комментарий:", "")
        .replace(")", "")
        .trim();

    return {
        title,
        key,
        comment,
        filename: file.name,
        path: "songs/" + file.name
    };
}

/* ------- Основная загрузка каталога -------- */
async function loadCatalog() {
    songList.innerHTML = "<div style='padding:10px;'>Загрузка...</div>";

    try {
        const files = await fetchSongFiles();
        const songs = [];

        for (const f of files) {
            const meta = await loadSongMeta(f);
            songs.push(meta);
        }

        renderCatalog(songs);
    } catch (e) {
        songList.innerHTML = "<div style='padding:10px;color:#f55;'>Ошибка загрузки каталога</div>";
        console.error(e);
    }
}

/* ------- Рендер каталога -------- */
function renderCatalog(songs) {
    songList.innerHTML = "";

    const tracklist = JSON.parse(localStorage.getItem("tracklist") || "[]");

    songs.forEach(song => {
        const div = document.createElement("div");
        div.className = "song-item";

        // если песня в треклисте
        if (tracklist.includes(song.filename)) {
            div.classList.add("added");
        }

        div.innerHTML = `
            <b>${song.title}</b><br>
            <small>${song.key}</small><br>
            <button class="open-btn">Открыть</button>
            <button class="add-btn">${tracklist.includes(song.filename) ? "Убрать" : "Добавить"}</button>
        `;

        // открыть песню
        div.querySelector(".open-btn").onclick = () => {
            localStorage.setItem("currentSong", song.filename);
            window.location.href = "song.html";
        };

        // добавить/убрать
        div.querySelector(".add-btn").onclick = () => {
            toggleTrack(song.filename);
            loadCatalog(); 
        };

        songList.appendChild(div);
    });
}

/* ------- Добавить / убрать из треклиста -------- */
function toggleTrack(name) {
    let t = JSON.parse(localStorage.getItem("tracklist") || "[]");

    if (t.includes(name)) {
        t = t.filter(x => x !== name);
    } else {
        t.push(name);
    }

    localStorage.setItem("tracklist", JSON.stringify(t));
}

/* ------- Переключение вкладок -------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".tab").forEach(tab =>
            tab.classList.remove("active")
        );

        document.getElementById(btn.dataset.tab).classList.add("active");
    };
});

/* ------- Обновить каталог -------- */
refreshBtn.onclick = () => loadCatalog();

/* ------- Запуск -------- */
window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) splash.style.display = "none";
    }, 1200);

    loadCatalog();
};
