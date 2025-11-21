/* ============================================
   2G+ Tracklist — LOADER (финальная версия)
   ============================================ */

const GITHUB_USER = "spirtuozgit";
const REPO = "tracklist2g";
const BRANCH = "main";

const songList = document.getElementById("song-list");
const refreshBtn = document.getElementById("refresh-btn");

/* --- Утилита: очистка строки --- */
function cleanTitle(line) {
    return line
        .replace(/^\uFEFF/, "")
        .replace(/^\\/, "")
        .replace(/^#/, "")
        .trim();
}

/* --- Получить список md файлов --- */
async function fetchSongFiles() {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/songs?ref=${BRANCH}`;
    const list = await fetch(url).then(r => r.json());

    if (!Array.isArray(list)) throw new Error("GitHub API error");

    return list
        .filter(f => f.name.endsWith(".md"))
        .map(f => ({
            name: f.name,
            download_url: f.download_url
        }));
}

/* --- Подгрузить метаданные песни --- */
async function loadSongMeta(file) {
    const raw = await fetch(file.download_url).then(r => r.text());
    const lines = raw.split("\n");

    const title = cleanTitle(lines[0] || "");
    const key = (lines[1] || "").trim();

    let comment = (lines[2] || "").trim();
    comment = comment.replace("(Комментарий:", "").replace(")", "").trim();

    return {
        title,
        key,
        comment,
        filename: file.name
    };
}

/* --- Загрузить каталог --- */
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

/* --- Рендер каталога --- */
function renderCatalog(songs) {
    songList.innerHTML = "";

    const tracklist = JSON.parse(localStorage.getItem("tracklist") || "[]");

    songs.forEach(song => {
        const div = document.createElement("div");
        div.className = "song-item";

        if (tracklist.includes(song.filename)) {
            div.classList.add("added");
        }

        div.innerHTML = `
            <b>${song.title}</b><br>
            <small>${song.key}</small><br>
            <button class="open-btn">Открыть</button>
            <button class="add-btn">${tracklist.includes(song.filename) ? "-" : "+"}</button>
        `;

        /* открыть */
        div.querySelector(".open-btn").onclick = () => {
            localStorage.setItem("currentSong", song.filename);
            localStorage.setItem("returnTo", "catalog");     // ← ВАЖНО
            window.location.href = "song.html";
        };

        /* добавить или убрать */
        div.querySelector(".add-btn").onclick = () => {
            let t = JSON.parse(localStorage.getItem("tracklist") || "[]");

            if (t.includes(song.filename))
                t = t.filter(x => x !== song.filename);
            else
                t.push(song.filename);

            localStorage.setItem("tracklist", JSON.stringify(t));
            loadCatalog();
        };

        songList.appendChild(div);
    });
}

/* --- Переключение вкладок --- */
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".tab")
            .forEach(tab => tab.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");

        if (btn.dataset.tab === "catalog") {
            loadCatalog();
            localStorage.setItem("returnTo", "catalog");
        }

        if (btn.dataset.tab === "tracklist") {
            if (typeof renderTracklist === "function") {
                renderTracklist();
                localStorage.setItem("returnTo", "tracklist");
            }
        }
    };
});

/* --- Обновление --- */
refreshBtn.onclick = () => loadCatalog();

/* --- Запуск --- */
window.onload = () => loadCatalog();
