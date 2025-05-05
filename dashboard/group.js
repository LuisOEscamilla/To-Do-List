const groups = [];

function createGroup(name) {
    const group = { name, tasks: [] };
    groups.push(group);
    renderGroup(group);
}

function renderGroup(group) {
    const container = document.getElementById("groupContainer");

    const groupEl = document.createElement("div");
    groupEl.className = "group";

    const title = document.createElement("h3");
    title.textContent = group.name;
    groupEl.appendChild(title);

    const taskInput = document.createElement("input");
    taskInput.placeholder = "New Task";

    const dueDateInput = document.createElement("input");
    dueDateInput.type = "date";

    const prioritySelect = document.createElement("select");
    ["low", "medium", "high"].forEach(p => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
        prioritySelect.appendChild(option);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Task";

    const taskList = document.createElement("ul");

    // Mini calendar for this group
    const calendar = document.createElement("div");
    calendar.className = "group-calendar";
    generateMiniCalendar(calendar, group.tasks); // initial render

    addBtn.onclick = () => {
        const task = {
            title: taskInput.value,
            dueDate: dueDateInput.value,
            priority: prioritySelect.value,
            group: group.name,
            completed: false
        };

        if (!task.title || !task.dueDate) return;

        group.tasks.push(task);

        if (window.tasks) {
            window.tasks.push(task);
        }

        //const li = document.createElement("li");
        //li.textContent = `${task.title} (${task.dueDate}, ${task.priority})`;
        //taskList.appendChild(li);

        // Update group's mini calendar
        generateMiniCalendar(calendar, group.tasks);

        // Clear inputs
        taskInput.value = "";
        dueDateInput.value = "";
        prioritySelect.value = "low";
    };

    groupEl.appendChild(taskInput);
    groupEl.appendChild(dueDateInput);
    groupEl.appendChild(prioritySelect);
    groupEl.appendChild(addBtn);
    groupEl.appendChild(taskList);
    groupEl.appendChild(calendar);

    container.appendChild(groupEl);
}

function generateMiniCalendar(container, tasks) {
    const daysInMonth = 31;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    container.innerHTML = ""; // Clear previous calendar

    // Day name headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(name => {
        const header = document.createElement("div");
        header.className = "calendar-day-name";
        header.textContent = name;
        container.appendChild(header);
    });

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";

        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split("T")[0];

        const label = document.createElement("div");
        label.className = "date-label";
        label.textContent = day;

        cell.appendChild(label);

        // Match tasks on this date
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        dayTasks.forEach(task => {
            const banner = document.createElement("div");
            banner.className = `task-banner ${task.priority}`;
            banner.textContent = `${task.title} (${task.group})`;
            banner.title = task.title;

            // Add checkbox to remove task
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-remove-checkbox";
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    removeTask(task, container, banner);
                }
            });

            banner.appendChild(checkbox);
            cell.appendChild(banner);
        });

        container.appendChild(cell);
    }
}

function removeTask(task, container, banner) {
    // Remove task from group's task list
    const group = groups.find(g => g.name === task.group);
    if (group) {
        const taskIndex = group.tasks.indexOf(task);
        if (taskIndex !== -1) {
            group.tasks.splice(taskIndex, 1); // Remove task from group
        }
    }

    // Remove task from global tasks array
    if (window.tasks) {
        const globalTaskIndex = window.tasks.indexOf(task);
        if (globalTaskIndex !== -1) {
            window.tasks.splice(globalTaskIndex, 1); // Remove task globally
        }
    }

    // Remove task from the displayed task list in the group
    const taskList = container.querySelector("ul");
    const taskListItems = taskList.getElementsByTagName("li");
    for (let i = 0; i < taskListItems.length; i++) {
        const item = taskListItems[i];
        if (item.textContent.includes(task.title)) {
            taskList.removeChild(item);
            break;
        }
    }

    // Remove task banner from calendar (no longer needed)
    container.removeChild(banner);

    // Re-render the calendar to update the task removal
    generateMiniCalendar(container, group.tasks);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("createGroupBtn").addEventListener("click", () => {
        const groupName = prompt("Enter group name:");
        if (groupName) createGroup(groupName);
    });
});
