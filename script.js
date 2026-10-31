// ==========================================
// 1. DAYS
// ==========================================

const days = ["MON", "TUE", "WED", "THU", "FRI"];


// ==========================================
// 2. OFFICIAL VIT SLOT MAPPING
// Each pair = [Theory Slot, Lab Slot]
// ==========================================

const timetableData = {

    MON: [
        ["A1", "L1"],
        ["F1", "L2"],
        ["D1", "L3"],
        ["TB1", "L4"],
        ["TG1", "L5"],
        ["", "L6"],

        ["A2", "L31"],
        ["F2", "L32"],
        ["D2", "L33"],
        ["TB2", "L34"],
        ["TG2", "L35"],
        ["", "L36"]
    ],

    TUE: [
        ["B1", "L7"],
        ["G1", "L8"],
        ["E1", "L9"],
        ["TC1", "L10"],
        ["TAA1", "L11"],
        ["", "L12"],

        ["B2", "L37"],
        ["G2", "L38"],
        ["E2", "L39"],
        ["TC2", "L40"],
        ["TAA2", "L41"],
        ["", "L42"]
    ],

    WED: [
        ["C1", "L13"],
        ["A1", "L14"],
        ["F1", "L15"],
        ["TD1", "L16"],
        ["EXTRAMURAL", "L17"],
        ["EXTRAMURAL", "L18"],

        ["C2", "L43"],
        ["A2", "L44"],
        ["F2", "L45"],
        ["TD2", "L46"],
        ["TBB2", "L47"],
        ["", "L48"]
    ],

    THU: [
        ["D1", "L19"],
        ["B1", "L20"],
        ["G1", "L21"],
        ["TE1", "L22"],
        ["TCC1", "L23"],
        ["", "L24"],

        ["D2", "L49"],
        ["B2", "L50"],
        ["G2", "L51"],
        ["TE2", "L52"],
        ["TCC2", "L53"],
        ["", "L54"]
    ],

    FRI: [
        ["E1", "L25"],
        ["C1", "L26"],
        ["TA1", "L27"],
        ["TF1", "L28"],
        ["TDD1", "L29"],
        ["", "L30"],

        ["E2", "L55"],
        ["C2", "L56"],
        ["TA2", "L57"],
        ["TF2", "L58"],
        ["TDD2", "L59"],
        ["", "L60"]
    ]
};


// ==========================================
// 3. TIMINGS
// ==========================================

const theoryTimes = {

    morning: [
        "8:00–8:50 AM",
        "8:55–9:45 AM",
        "9:50–10:40 AM",
        "10:45–11:35 AM",
        "11:40–12:30 PM"
    ],

    evening: [
        "2:00–2:50 PM",
        "2:55–3:45 PM",
        "3:50–4:40 PM",
        "4:45–5:35 PM",
        "5:40–6:30 PM"
    ]
};

const labTimes = {

    morning: [
        { slots: "L1 + L2", time: "8:00–9:40 AM" },
        { slots: "L3 + L4", time: "9:50–11:30 AM" },
        { slots: "L5 + L6", time: "11:40 AM–1:20 PM" }
    ],

    evening: [
        { slots: "L31 + L32", time: "2:00–3:40 PM" },
        { slots: "L33 + L34", time: "3:50–5:30 PM" },
        { slots: "L35 + L36", time: "5:40–7:20 PM" }
    ]
};


// ==========================================
// 4. MODE AND SAVED DATA
// ==========================================

let mode = localStorage.getItem("ffcs_mode") || "morning";

if (!["morning", "evening"].includes(mode)) {
    mode = "morning";
}

let saved = {
    morning: [],
    evening: []
};

try {
    const data = JSON.parse(
        localStorage.getItem("ffcs_data_v1")
    );

    if (data && typeof data === "object") {
        saved.morning = Array.isArray(data.morning)
            ? data.morning : [];

        saved.evening = Array.isArray(data.evening)
            ? data.evening : [];
    }

} catch (error) {
    console.error("Error loading saved data:", error);
}

let selectedSlot = null;


// ==========================================
// 5. SAVE DATA
// ==========================================

function save() {

    try {
        localStorage.setItem(
            "ffcs_data_v1",
            JSON.stringify(saved)
        );

        localStorage.setItem("ffcs_mode", mode);

        return true;

    } catch (error) {
        console.error("Save failed:", error);
        alert("Could not save your timetable.");
        return false;
    }
}

function activeSubjects() {
    return saved[mode];
}


// ==========================================
// 6. DETERMINE VISIBLE SLOT
// ==========================================

function visibleSlot(pair, index) {

    const beforeLunch = index < 6;

    if (mode === "morning") {

        return beforeLunch
            ? pair[0]
            : pair[1];

    } else {

        return beforeLunch
            ? pair[1]
            : pair[0];
    }
}


// ==========================================
// 7. GET SUBJECTS FOR A SLOT
// ==========================================

function getAlternatives(slot) {

    return activeSubjects()

        .filter(subject =>
            subject.slots.includes(slot)
        )

        .sort((a, b) =>
            a.priority - b.priority
        );
}


// ==========================================
// 8. RENDER TIMETABLE
// ==========================================

function render() {

    const body = document.getElementById(
        "timetableBody"
    );

    body.replaceChildren();

    updateTimeHeaders();

    days.forEach(day => {

        const row = document.createElement("tr");

        const heading = document.createElement("th");

        heading.textContent = day;

        row.appendChild(heading);

        timetableData[day].forEach((pair, index) => {

            // Insert lunch divider

            if (index === 6) {

                const lunch = document.createElement("td");

                lunch.className = "lunch";

                row.appendChild(lunch);
            }

            // Morning mode: the 6th before-lunch column is empty,
            // so it is removed (Extramural lives in the 5th column).
            if (mode === "morning" && index === 5) {
                return;
            }

            const slot = visibleSlot(pair, index);

            const cell = document.createElement("td");

            // Extramural is one merged, centred cell
            if (slot === "EXTRAMURAL") {
                cell.classList.add("extramural-cell");
            }

            if (!slot) {

                cell.textContent = "—";

                row.appendChild(cell);

                return;
            }

            const code = document.createElement("div");

            code.className = "slot-code";

            code.textContent = slot;

            cell.appendChild(code);

            const alternatives = getAlternatives(slot);

            if (alternatives.length > 0) {

                const preferred = alternatives[0];

                const name = document.createElement("div");

                name.className = "subject-name";

                name.textContent = preferred.name;

                const faculty = document.createElement("div");

                faculty.className = "faculty-name";

                faculty.textContent = preferred.faculty;

                cell.append(name, faculty);

            } else {

                cell.classList.add("empty");

                const hint = document.createElement("div");

                hint.textContent = "+ Add subject";

                cell.appendChild(hint);
            }

            cell.addEventListener("click", () => {

                openEditor(slot);

            });

            row.appendChild(cell);

        });

        body.appendChild(row);

    });
}


// ==========================================
// 9. OPEN EDITOR
// ==========================================

function openEditor(slot) {

    selectedSlot = slot;

    document.getElementById("editor")
        .classList.remove("hidden");

    document.getElementById("editorTitle")
        .textContent = slot;

    document.getElementById("editorSubtitle")
        .textContent = "Manage alternatives for " + slot;

    document.getElementById("combination")
        .value = slot;

    document.getElementById("message")
        .textContent = "";

    renderAlternatives();

    document.getElementById("editor")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ==========================================
// 10. RENDER ALTERNATIVES
// ==========================================

function renderAlternatives() {

    const container = document.getElementById(
        "alternatives"
    );

    container.replaceChildren();

    const alternatives = getAlternatives(selectedSlot);

    alternatives.forEach((subject, index) => {

        const item = document.createElement("div");

        item.className = "alternative";

        const info = document.createElement("div");

        info.className = "alternative-info";

        const name = document.createElement("strong");

        name.textContent =
            `${index + 1}. ${subject.name}`;

        const details = document.createElement("small");

        details.textContent =
            `${subject.faculty} | ${subject.slots.join(" + ")}`;

        info.append(name, details);

        const actions = document.createElement("div");

        const up = document.createElement("button");

        up.textContent = "↑";

        up.disabled = index === 0;

        up.onclick = () => move(subject.id, -1);

        const down = document.createElement("button");

        down.textContent = "↓";

        down.disabled = index === alternatives.length - 1;

        down.onclick = () => move(subject.id, 1);

        const remove = document.createElement("button");

        remove.textContent = "Delete";

        remove.onclick = () => removeSubject(subject.id);

        actions.append(up, down, remove);

        item.append(info, actions);

        container.appendChild(item);

    });

    document.getElementById("addSubject").disabled =
        alternatives.length >= 5;
}


// ==========================================
// 11. ADD SUBJECT
// ==========================================

function addSubject() {

    const name = document.getElementById(
        "subjectName"
    ).value.trim();

    const faculty = document.getElementById(
        "facultyName"
    ).value.trim();

    const combination = document.getElementById(
        "combination"
    ).value.trim();

    const message = document.getElementById("message");

    message.textContent = "";

    if (!name || !faculty || !combination) {

        message.textContent = "Fill in all fields.";

        return;
    }

    const slots = combination

        .toUpperCase()

        .split("+")

        .map(slot => slot.trim())

        .filter(Boolean);

    if (new Set(slots).size !== slots.length) {

        message.textContent = "Duplicate slots are not allowed.";

        return;
    }

    if (!slots.includes(selectedSlot)) {

        message.textContent =
            "Include the selected slot in the combination.";

        return;
    }

    const allSlots = new Set(

        Object.values(timetableData)

            .flatMap(day =>
                day.flatMap(pair => pair)
            )

            .filter(Boolean)

    );

    if (!slots.every(slot => allSlots.has(slot))) {

        message.textContent = "Invalid slot combination.";

        return;
    }

    // Check the five-alternative limit
    // in every slot in the combination.

    for (const slot of slots) {

        if (getAlternatives(slot).length >= 5) {

            message.textContent =
                `${slot} already has five alternatives.`;

            return;
        }
    }

    const newSubject = {

        id: crypto.randomUUID(),

        name: name,

        faculty: faculty,

        slots: slots,

        priority: Date.now() + Math.random()

    };

    activeSubjects().push(newSubject);

    if (!save()) {

        activeSubjects().pop();

        return;
    }

    document.getElementById("subjectName").value = "";

    document.getElementById("facultyName").value = "";

    renderAlternatives();

    render();
}


// ==========================================
// 12. MOVE PREFERENCE
// ==========================================

function move(id, direction) {

    const alternatives = getAlternatives(selectedSlot);

    const index = alternatives.findIndex(
        subject => subject.id === id
    );

    const target = index + direction;

    if (target < 0 || target >= alternatives.length) {
        return;
    }

    const first = alternatives[index];

    const second = alternatives[target];

    const temp = first.priority;

    first.priority = second.priority;

    second.priority = temp;

    if (!save()) {

        second.priority = first.priority;

        first.priority = temp;

        return;
    }

    renderAlternatives();

    render();
}


// ==========================================
// 13. DELETE SUBJECT
// ==========================================

function removeSubject(id) {

    if (!confirm(
        "Remove this subject from all its associated slots?"
    )) {
        return;
    }

    const list = activeSubjects();

    const index = list.findIndex(
        subject => subject.id === id
    );

    if (index === -1) return;

    const removed = list.splice(index, 1)[0];

    if (!save()) {

        list.splice(index, 0, removed);

        return;
    }

    renderAlternatives();

    render();
}


// ==========================================
// 14. MODE SWITCHING
// ==========================================

document.getElementById("mode").value = mode;

document.getElementById("mode")
    .addEventListener("change", event => {

        mode = event.target.value;

        selectedSlot = null;

        applyTheme();

        save();

        document.getElementById("editor")
            .classList.add("hidden");

        render();

    });


// ==========================================
// 15. BUTTON EVENTS
// ==========================================

document.getElementById("addSubject")
    .addEventListener("click", addSubject);

document.getElementById("closeEditor")
    .addEventListener("click", () => {

        document.getElementById("editor")
            .classList.add("hidden");

        selectedSlot = null;

    });


// ==========================================
// 16. START APPLICATION
// ==========================================

applyTheme();

render();

// Enable the smooth theme transition only after first paint,
// so evening users don't see a light -> dark fade on page load.
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        document.body.classList.add("theme-ready");
    });
});

function updateTimeHeaders() {

    const headers = document.querySelectorAll(
        "#timeHeaders th[data-morning]"
    );

    headers.forEach((header, index) => {

        header.textContent = header.dataset[mode];

        // Hide the empty 6th before-lunch column in morning mode
        header.hidden = mode === "morning" && index === 5;
    });

    document.getElementById("beforeLunchHeader")
        .colSpan = mode === "morning" ? 5 : 6;
}


// ==========================================
// 17. THEME (light <-> dark)
// ==========================================

function applyTheme() {

    document.body.classList.remove(
        "morning-theme",
        "evening-theme"
    );

    document.body.classList.add(mode + "-theme");
}
