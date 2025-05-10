async function loadGroups() {
    try {
        const res = await fetch("/groups/list");
        const { groups } = await res.json();
        groups.forEach(group => renderGroup(group));
    } catch (err) {
        console.error("Failed loading groups:", err);
    }
}

function renderGroup(group) {
    const container = document.getElementById("groupContainer");

    const groupEl = document.createElement("div");
    groupEl.className = "group";

    const title = document.createElement("h3");
    title.textContent = group.name;
    groupEl.appendChild(title);

    const calendar = document.createElement("div");
    calendar.className = "group-calendar";
    generateMiniCalendar(calendar, group.tasks || []);
    groupEl.appendChild(calendar);

    const taskInput = document.createElement("input");
    taskInput.placeholder = "New Task";
    groupEl.appendChild(taskInput);

    const dueDateInput = document.createElement("input");
    dueDateInput.type = "date";
    groupEl.appendChild(dueDateInput);

    const prioritySelect = document.createElement("select");
    ["low", "medium", "high"].forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        prioritySelect.appendChild(option);
    });
    groupEl.appendChild(prioritySelect);

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Task";
    groupEl.appendChild(addBtn);

    addBtn.onclick = async () => {
        const task = {
            title: taskInput.value,
            dueDate: dueDateInput.value,
            priority: prioritySelect.value,
            group: group.name,
            completed: false
        };

        const res = await fetch("/groups/add-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: group._id, task })
        });

        const result = await res.json();
        group.tasks.push(result.task);
        generateMiniCalendar(calendar, group.tasks);
    };

    container.appendChild(groupEl);
}

function generateMiniCalendar(container, tasks) {
    container.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split("T")[0];

        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.textContent = day;

        const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
        dayTasks.forEach(task => {
            const tag = document.createElement("div");
            tag.className = "task-banner " + task.priority;
            tag.textContent = task.title;
            cell.appendChild(tag);
        });

        container.appendChild(cell);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("createGroupBtn");
    if (!btn) {
        console.error("Missing #createGroupBtn in HTML");
        return;
    }

    btn.addEventListener("click", async () => {
        const groupName = prompt("Enter group name:");
        if (!groupName) return;

        const res = await fetch("/friends/list");
        const { friends } = await res.json();

        const selected = await new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.background = "rgba(0, 0, 0, 0.5)";
            overlay.style.display = "flex";
            overlay.style.flexDirection = "column";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.zIndex = 9999;

            const box = document.createElement("div");
            box.style.background = "white";
            box.style.padding = "20px";
            box.style.borderRadius = "10px";

            const checkboxes = [];

            friends.forEach(f => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = f._id;
                checkboxes.push(checkbox);
                label.appendChild(checkbox);
                label.append(" " + f.username);
                box.appendChild(label);
                box.appendChild(document.createElement("br"));
            });

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Create Group";
            confirmBtn.onclick = () => {
                const ids = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
                document.body.removeChild(overlay);
                resolve(ids);
            };

            box.appendChild(confirmBtn);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        });

        const createRes = await fetch("/groups/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: groupName, friendIds: selected })
        });

        const { group } = await createRes.json();
        renderGroup(group);
    });

    loadGroups();
});