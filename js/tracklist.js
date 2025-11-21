/* ============================================
   2G+ Tracklist — TRACKLIST MODULE
   Управление треклистом (localStorage)
   ============================================ */

const tracklistContainer = document.getElementById("tracklist-container");

/* ------- Получить треклист -------- */
function getTracklist() {
    return JSON.parse(localStorage.getItem("tracklist") || "[]");
}

/* ------- Сохранить треклист -------- */
function saveTracklist(t) {
    localStorage.setItem("tracklist", JSON.stringify(t));
}

/* ------- Отметить песню (сыграно / не сыграно) -------- */
function togglePlayed(name) {
    let played = JSON.parse(localStorage.getItem("played") || "[]");

    if (played.includes(name)) {
        played = played.filter(x => x !== name);
    } else {
        played.push(name);
    }

    localStorage.setItem("played", JSON.stringify(played));
}

/* ------- Рендер треклиста -------- */
function renderTracklist() {
    const list = getTracklist();
    const played = JSON.parse(localStorage.getItem("played") || "[]");

    tracklistContainer.innerHTML = "";

    if (list.length === 0) {
        tracklistContainer.innerHTML =
            "<div style='padding:10px; opacity:0.7;'>Треклист пуст</div>";
        return;
    }

    list.forEach(name => {
        const div = document.createElement("div");
        div.className = "track-item";

        // Сыграно → затемняем
        if (played.includes(name)) {
            div.classList.add("played");
        }

        div.innerHTML = `
            <b>${name.replace(".md","")}</b><br>
            <button class="open-btn">Открыть</button>
            <button class="played-btn">${played.includes(name) ? "Не сыграно" : "Сыграно"}</button>
            <button class="remove-btn">Удалить</button>
        `;

        /* Открыть песню */
        div.querySelector(".open-btn").onclick = () => {
            localStorage.setItem("currentSong", name);
            window.location.href = "song.html";
        };

        /* Сыграно */
        div.querySelector(".played-btn").onclick = () => {
            togglePlayed(name);
            renderTracklist();
        };

        /* Удалить */
        div.querySelector(".remove-btn").onclick = () => {
            const t = getTracklist().filter(x => x !== name);
            saveTracklist(t);
            renderTracklist();
        };

        tracklistContainer.appendChild(div);
    });
}

/* ------- Переключение вкладки Треклист → обновить -------- */
document.querySelector('[data-tab="tracklist"]').onclick = () => {
    setTimeout(renderTracklist, 200); // даём вкладке прогрузиться
};

/* ------- ПЕРВИЧНЫЙ ЗАПУСК -------- */
window.addEventListener("load", () => {
    renderTracklist();
});
