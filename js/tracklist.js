/* ============================================
   2G+ Tracklist — FINISH VERSION
   - Открыть
   - +
   - -
   - Серый стиль для сыгранных
   - Перетаскивание (Drag & Drop)
   ============================================ */

const tracklistContainer = document.getElementById("tracklist-container");

function cleanTitle(line) {
    return line
        .replace(/^\uFEFF/, "")
        .replace(/^\\/, "")
        .replace(/^#/, "")
        .trim();
}

function getTracklist() {
    return JSON.parse(localStorage.getItem("tracklist") || "[]");
}

function saveTracklist(list) {
    localStorage.setItem("tracklist", JSON.stringify(list));
}

function togglePlayed(name) {
    let played = JSON.parse(localStorage.getItem("played") || "[]");

    if (played.includes(name)) {
        played = played.filter(x => x !== name);
    } else {
        played.push(name);
    }

    localStorage.setItem("played", JSON.stringify(played));
}

/* ---------- DRAG & DROP ---------- */

let dragIndex = null;

function enableDragAndDrop(listItems, filenames) {
    listItems.forEach((item, index) => {
        item.setAttribute("draggable", "true");

        item.addEventListener("dragstart", () => {
            dragIndex = index;
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            dragIndex = null;
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector(".dragging");
            if (!draggingItem || item === draggingItem) return;

            let items = Array.from(tracklistContainer.children);
            let currentIndex = items.indexOf(item);

            if (currentIndex !== dragIndex) {
                if (currentIndex > dragIndex) {
                    tracklistContainer.insertBefore(draggingItem, item.nextSibling);
                } else {
                    tracklistContainer.insertBefore(draggingItem, item);
                }

                // обновляем порядок
                items = Array.from(tracklistContainer.children);
                const newOrder = items.map(el => el.dataset.filename);
                saveTracklist(newOrder);
            }
        });
    });
}

/* ---------- Рендер ---------- */

async function renderTracklist() {
    const list = getTracklist();
    const played = JSON.parse(localStorage.getItem("played") || "[]");

    tracklistContainer.innerHTML = "";

    if (list.length === 0) {
        tracklistContainer.innerHTML =
            "<div style='padding:10px;opacity:0.6;'>Треклист пуст</div>";
        return;
    }

    const elements = [];

    for (const filename of list) {
        const url = `https://raw.githubusercontent.com/spirtuozgit/tracklist2g/main/songs/${filename}`;
        const raw = await fetch(url).then(r => r.text());
        const lines = raw.split("\n");

        const title = cleanTitle(lines[0]);

        const div = document.createElement("div");
        div.className = "track-item";
        div.dataset.filename = filename;

        if (played.includes(filename)) div.style.opacity = "0.4";

        div.innerHTML = `
            <b>${title}</b><br>
            <button class="open-btn">Открыть</button>
            <button class="played-btn">+</button>
            <button class="remove-btn">-</button>
        `;

        // открыть
        div.querySelector(".open-btn").onclick = () => {
            localStorage.setItem("currentSong", filename);
            window.location.href = "song.html";
        };

        // сыграно
        div.querySelector(".played-btn").onclick = () => {
            togglePlayed(filename);
            renderTracklist();
        };

        // удалить из треклиста
        div.querySelector(".remove-btn").onclick = () => {
            saveTracklist(getTracklist().filter(x => x !== filename));
            renderTracklist();
        };

        tracklistContainer.appendChild(div);
        elements.push(div);
    }

    // включить перетаскивание
    enableDragAndDrop(elements, list);
}

document.querySelector('[data-tab="tracklist"]').addEventListener("click", () => {
    setTimeout(() => renderTracklist(), 150);
});
