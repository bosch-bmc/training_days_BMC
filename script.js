  "use strict";
/* CONFIGURATION */
const CONFIG = {
    storageKey: "consultingWeekDurationV1",
    weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startMinutes: 480,
    endMinutes: 1140,
    slotMinutes: 30
};
/* CATEGORIES */
const CATEGORIES = {
    client: {
        label: "Client Activities",
        color: "#00884a"
    },
    team: {
        label: "Team / Partner",
        color: "#005691"
    },
    analysis: {
        label: "Analysis & Delivery",
        color: "#333333"
    },
    internal: {
        label: "Internal Development",
        color: "#6e3f88"
    },
    travel: {
        label: "Travel",
        color: "#e20015"
    },
    meal: {
        label: "Lunch / Event",
        color: "#00879a"
    }
};
/* ACTIVITIES */
const ACTIVITIES = [
    ["travel-to", "Travel to Client", "travel", 1, 120],
    ["travel-from", "Travel from Client", "travel", 1, 120],
    ["lunch-team", "Lunch with Team", "meal", 1, 60],
    ["lunch-client", "Lunch with Client", "meal", 2, 60],
    ["working-lunch", "Working Lunch Session", "meal", 1, 90],
    ["lunch-domain", "Lunch with Domain", "meal", 1, 60],
    ["team-event", "Team Dinner / Event", "meal", 1, 120],
    ["team-checkin", "Team Check-in", "team", 5, 30],
    ["team-checkout", "Team Check-out", "team", 5, 30],
    ["problem", "Team Problem Solving", "team", 2, 120],
    ["partner", "Debrief with Partner", "team", 1, 60],
    ["client-checkin", "Client Check-in", "client", 3, 30],
    ["client-work", "Client Work Session", "client", 2, 120],
    ["steerco", "SteerCo", "client", 1, 90],
    ["expert", "Expert Interviews", "client", 1, 90],
    ["data", "Prepare Data Requests", "analysis", 1, 60],
    ["draft-market", "Draft Market Model", "analysis", 1, 120],
    ["refine-market", "Refine Market Model", "analysis", 1, 120],
    ["review-data", "Review Data", "analysis", 1, 90],
    ["review-input", "Review Client / Expert Input", "analysis", 1, 60],
    ["update-model", "Update Model", "analysis", 1, 90],
    ["build-model", "Build Model in Excel", "analysis", 1, 120],
    ["draft-slides", "Draft Analysis Slides", "analysis", 1, 120],
    ["final-slides", "Finalize Analysis Slides", "analysis", 1, 120],
    ["prepare-steerco", "Prepare SteerCo", "analysis", 1, 90],
    ["send-steerco", "Finalize & Send SteerCo", "analysis", 1, 60],
    ["challenge", "Challenge Assumptions", "analysis", 1, 60],
    ["training", "Online Training", "internal", 1, 60],
    ["feedback", "Feedback Session", "internal", 2, 60],
    ["admin", "Admin / Expenses", "internal", 1, 60],
    ["recruiting", "Recruiting Interview", "internal", 1, 60]
].map(([id, label, category, max, duration]) => ({
    id,
    label,
    category,
    max,
    duration
}));
/* APPLICATION STATE & HELPERS */
const state = {
        dragged: null,
        nextId: 1
    },
    $ = s => document.querySelector(s),
    $$ = s => [...document.querySelectorAll(s)],
    activity = id => ACTIVITIES.find(a => a.id === id),
    fmt = m => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`,
    dur = m => m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m/60}h`;

/* INVENTORY & NOTIFICATIONS */
function notice(t) {
    const e = $("#toast");
    e.textContent = t;
    e.style.display = "block";
    clearTimeout(notice.t);
    notice.t = setTimeout(() => e.style.display = "none", 1800)
}

function placed() {
    return $$(".event").map(e => ({
        activityId: e.dataset.activityId,
        instanceId: e.dataset.instanceId,
        day: +e.dataset.day,
        start: +e.dataset.start,
        duration: +e.dataset.duration,
        category: activity(e.dataset.activityId).category
    }))
}

function remaining(id) {
    const a = activity(id);
    return a ? Math.max(0, a.max - $$(`.event[data-activity-id="${id}"]`).length) : 0
}

function updateInventory() {
    $$(".source").forEach(e => {
        const n = remaining(e.dataset.activityId);
        e.querySelector(".badge").textContent = n;
        e.hidden = n === 0;
        e.draggable = n > 0
    })
}
/* DRAG & DROP */
let ghost = null;

function transparentImage() {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    c.getContext("2d").clearRect(0, 0, 1, 1);
    return c
}

function removeGhost() {
    ghost?.remove();
    ghost = null
}

function makeGhost(src) {
    removeGhost();
    ghost = src.cloneNode(true);
    ghost.hidden = false;
    ghost.removeAttribute("draggable");
    ghost.querySelectorAll("button").forEach(b => b.remove());
    const r = src.getBoundingClientRect();
    Object.assign(ghost.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: `${r.width}px`,
        height: `${r.height}px`,
        margin: "0",
        opacity: "1",
        filter: "none",
        pointerEvents: "none",
        zIndex: "99999",
        transform: "translate(-10000px,-10000px)",
        transition: "none"
    });
    ghost.setAttribute("aria-hidden", "true");
    document.body.append(ghost)
}

function moveGhost(x, y) {
    if (ghost && !(x === 0 && y === 0)) ghost.style.transform = `translate(${Math.round(x+14)}px,${Math.round(y+14)}px)`
}

function enableDrag(e) {
    e.draggable = true;
    e.addEventListener("dragstart", v => {
        if (e.hidden) {
            v.preventDefault();
            return
        }
        state.dragged = e;
        makeGhost(e);
        v.dataTransfer.effectAllowed = "move";
        v.dataTransfer.setData("text/plain", e.dataset.instanceId || e.dataset.activityId);
        v.dataTransfer.setDragImage(transparentImage(), 0, 0);
        requestAnimationFrame(() => moveGhost(v.clientX, v.clientY))
    });
    e.addEventListener("drag", v => moveGhost(v.clientX, v.clientY));
    e.addEventListener("dragend", () => {
        state.dragged = null;
        removeGhost()
    })
}
document.addEventListener("dragover", e => moveGhost(e.clientX, e.clientY));
document.addEventListener("drop", removeGhost);

/* CALENDAR GENERATION */
function createSlots() {
    const c = $("#calendar");
    c.innerHTML = '<div class="head">Time</div>' + CONFIG.weekdays.map(d => `<div class="head">${d}</div>`).join("");
    for (let m = CONFIG.startMinutes; m < CONFIG.endMinutes; m += CONFIG.slotMinutes) {
        let t = document.createElement("div");
        t.className = "time";
        t.textContent = m % 60 ? "" : fmt(m);
        c.append(t);
        CONFIG.weekdays.forEach((_, d) => {
            let s = document.createElement("div");
            s.className = `slot ${m%60?"half":""}`;
            s.dataset.day = d;
            s.dataset.start = m;
            s.ondragover = e => {
                e.preventDefault();
                s.classList.add("over")
            };
            s.ondragleave = () => s.classList.remove("over");
            s.ondrop = e => {
                e.preventDefault();
                s.classList.remove("over");
                dropAt(d, m)
            };
            c.append(s)
        })
    }
}
/* CALENDAR HELPERS */
const slot = (d, s) => $(`.slot[data-day="${d}"][data-start="${s}"]`);

function range(d, s, n) {
    let a = [];
    for (let m = s; m < s + n; m += CONFIG.slotMinutes) {
        let x = slot(d, m);
        if (!x) return null;
        a.push(x)
    }
    return a
}

function clearOcc(e) {
    $$(`.slot[data-event-id="${e.dataset.instanceId}"]`).forEach(s => {
        s.classList.remove("occupied");
        delete s.dataset.eventId
    })
}

function canPlace(d, s, n, ignore = null) {
    let r = range(d, s, n);
    return s + n <= CONFIG.endMinutes && !!r && r.every(x => !x.dataset.eventId || x.dataset.eventId === ignore)
}

/* EVENT MANAGEMENT */
function createEvent(a, id = null) {
    let e = document.createElement("div");
    e.className = `card event ${a.category}`;
    Object.assign(e.dataset, {
        activityId: a.id,
        instanceId: id || `event-${state.nextId++}`,
        duration: a.duration
    });
    e.innerHTML = `<span><span class="event-title">${a.label}</span><span class="event-time"></span></span><button class="remove" type="button" title="Remove this assignment">×</button>`;
    e.querySelector(".remove").onclick = v => {
        v.stopPropagation();
        clearOcc(e);
        e.remove();
        updateInventory()
    };
    enableDrag(e);
    return e
}

function positionEvent(e, d, s) {
    let a = activity(e.dataset.activityId),
        r = range(d, s, a.duration);
    if (!r) return;
    clearOcc(e);
    Object.assign(e.dataset, {
        day: d,
        start: s
    });
    e.style.height = `calc(${a.duration/CONFIG.slotMinutes} * var(--slot) - 4px)`;
    e.querySelector(".event-time").textContent = `${fmt(s)}–${fmt(s+a.duration)} · ${dur(a.duration)}`;
    r.forEach(x => {
        x.dataset.eventId = e.dataset.instanceId;
        x.classList.add("occupied")
    });
    r[0].append(e)
}

function dropAt(d, s) {
    if (!state.dragged) return;
    let id = state.dragged.dataset.activityId,
        a = activity(id),
        moving = !state.dragged.classList.contains("source"),
        ignore = moving ? state.dragged.dataset.instanceId : null;
    if (!canPlace(d, s, a.duration, ignore)) {
        let x = slot(d, s);
        x?.classList.add("invalid");
        setTimeout(() => x?.classList.remove("invalid"), 350);
        notice(s + a.duration > CONFIG.endMinutes ? "The activity does not fit within the visible working day." : "One or more required time slots are already occupied.");
        return
    }
    if (!moving && remaining(id) <= 0) {
        notice("This activity has reached its maximum usage.");
        return
    }
    let e = moving ? state.dragged : createEvent(a);
    positionEvent(e, d, s);
    updateInventory()
}

/* ACTIVITY LIBRARY */
function buildLibrary() {
    let l = $("#library");
    Object.entries(CATEGORIES).forEach(([k, c], i) => {
        let g = document.createElement("details");
        g.className = "group";
        g.open = i === 0;
        g.innerHTML = `<summary><span class="dot" style="background:${c.color}"></span>${c.label}</summary><div class="cards"></div>`;
        ACTIVITIES.filter(a => a.category === k).forEach(a => {
            let e = document.createElement("div");
            e.className = `card source ${a.category}`;
            e.dataset.activityId = a.id;
            e.innerHTML = `<span><span>${a.label}</span><br><span class="meta">${dur(a.duration)}</span></span><span class="badge">${a.max}</span>`;
            enableDrag(e);
            g.querySelector(".cards").append(e)
        });
        l.append(g)
    });
    updateInventory()
}

/* SAVE & LOAD */
function clearAll() {
    $$(".event").forEach(e => {
        clearOcc(e);
        e.remove()
    });
    updateInventory()
}

function save() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(placed()));
    notice("Your week has been saved in this browser.")
}

function load() {
    let data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]");
    clearAll();
    data.forEach(x => {
        let a = activity(x.activityId);
        if (a && canPlace(x.day, x.start, a.duration) && remaining(a.id) > 0) positionEvent(createEvent(a, x.instanceId), x.day, x.start)
    });
    updateInventory();
    notice(data.length ? "Saved week loaded." : "No saved week was found.")
}

/* EVALUATION */
function evaluate() {
    let p = placed(),
        count = c => p.filter(x => x.category === c).length,
        days = c => new Set(p.filter(x => x.category === c).map(x => x.day)).size,
        hours = c => p.filter(x => x.category === c).reduce((s, x) => s + x.duration / 60, 0),
        m = [
            ["Client Impact", Math.min(30, Math.round(hours("client") * 6)), 30],
            ["Team Collaboration", Math.min(20, count("team") + days("team") * 2), 20],
            ["Analysis & Delivery", Math.min(20, Math.round(hours("analysis") * 2)), 20],
            ["Learning & Internal", Math.min(10, count("internal") * 3), 10],
            ["Sustainability", Math.min(20, days("meal") * 4), 20]
        ],
        total = m.reduce((s, x) => s + x[1], 0);
    $("#score").textContent = `${total}/100`;
    $("#metrics").innerHTML = m.map(x => `<div class="metric"><strong>${x[0]}: ${x[1]}/${x[2]}</strong><div class="bar"><div class="fill" style="width:${x[1]/x[2]*100}%"></div></div></div>`).join("");
    let f = [];
    if (hours("client") < 4) f.push("Increase client-facing time to strengthen stakeholder impact.");
    if (hours("analysis") < 5) f.push("Protect more dedicated analysis and delivery time.");
    if (days("team") < 4) f.push("Distribute team alignment more consistently across the week.");
    if (days("meal") < 4) f.push("Plan proper breaks on most weekdays.");
    if (count("internal") < 1) f.push("Include at least one professional development or internal activity.");
    $("#feedback").innerHTML = f.map(x => `<li>${x}</li>`).join("") || "<li>The week shows a balanced mix of core consulting activities.</li>";
    $("#scoreModal").classList.add("open")
}

/* INITIALIZATION */
function init() {
    createSlots();
    buildLibrary();
    $("#evaluate").onclick = evaluate;
    $("#reset").onclick = () => confirm("Reset all activity assignments?") && clearAll();
    $("#save").onclick = save;
    $("#load").onclick = load;
    $$('[data-close]').forEach(b => b.onclick = () => $("#" + b.dataset.close).classList.remove("open"));
    $$(".modal").forEach(m => m.onclick = e => e.target === m && m.classList.remove("open"));
    document.onkeydown = e => e.key === "Escape" && $$(".modal.open").forEach(m => m.classList.remove("open"))
}
init();
