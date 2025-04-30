document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("prioritySelect");
    const dueDateInput = document.getElementById("dueDateInput");
    const addTaskBtn = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");

    
    let tasks = []; // All task data

    function getPriorityColor(priority) {
        return {
            high: "red",
            medium: "orange",
            low: "green"
        }[priority] || "gray";
    }

    function renderCalendarTasks() {
        const calendar = document.getElementById("calendarGrid");
        calendar.innerHTML = "";

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Add day name headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const label = document.createElement("div");
            label.classList.add("calendar-day-name");
            label.textContent = day;
            calendar.appendChild(label);
        });

        // Add empty slots before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptySlot = document.createElement("div");
            emptySlot.classList.add("calendar-day", "empty");
            calendar.appendChild(emptySlot);
        }

        // Render each day of the month
        for (let i = 1; i <= lastDay; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEl = document.createElement("div");
            dayEl.classList.add("calendar-day");
            dayEl.innerHTML = `<h4>${i}</h4>`;

            tasks.filter(t => t.dueDate === dateStr).forEach(t => {
                const taskEl = document.createElement("div");
                taskEl.classList.add("calendar-task");
                taskEl.style.borderColor = getPriorityColor(t.priority);
                taskEl.textContent = t.title;
                dayEl.appendChild(taskEl);
            });

            calendar.appendChild(dayEl);
        }
    }

    function showSection(sectionId) {
        // Hide all sections
        document.getElementById("taskList").style.display = "none";
        document.getElementById("calendar").style.display = "none";
        document.getElementById("groupsSection").style.display = "none";
        document.getElementById("friendsSection").style.display = "none";

        // Show the selected section
        document.getElementById(sectionId).style.display = "block";

        // TEAM: Only show task creator on calendar
        document.getElementById("taskCreator").style.display = 
        sectionId === "calendar" ? "block" : "none";

    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const page = item.getAttribute("data-page");
            if (page === "home") {
                showSection("calendar");
                renderCalendarTasks();
            } else if (page === "tasks") {
                showSection("taskList");
                showTodayTasks();
            } else if (page === "groups") {  // Changed from goals
                showSection("groupsSection");
            } else if (page === "friends") {
                showSection("friendsSection");
            }
        });
    });

    function showTodayTasks() {
        const todayStr = new Date().toISOString().split("T")[0]; // Format: yyyy-mm-dd
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = ""; // Clear old tasks

        const todayTasks = tasks.filter(t => t.dueDate === todayStr);

        if (todayTasks.length === 0) {
            taskList.innerHTML = "<p>No tasks due today.</p>";
            return;
        }

        todayTasks.forEach(t => {
            const taskCard = document.createElement("div");
            taskCard.classList.add("task-card");
            taskCard.setAttribute("data-priority", t.priority);
            taskCard.innerHTML = `
            <div class="task-content">
                <h3 class="task-title">${t.title}</h3>
                <p class="task-priority">Priority: ${t.priority}</p>
                <p class="task-due">Due: ${t.dueDate}</p>
            </div>
            <input type="checkbox" class="task-status">
        `;
            taskList.appendChild(taskCard);
        });
    }


    addTaskBtn.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;

        if (!taskText) return;

        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
        taskCard.setAttribute("data-priority", priority);
        taskCard.innerHTML = `
            <div class="task-content">
                <h3 class="task-title">${taskText}</h3>
                <p class="task-priority">Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
                <p class="task-due">Due: ${dueDate || "None"}</p>
            </div>
            <input type="checkbox" class="task-status">
        `;

        taskList.appendChild(taskCard);

        // Save to task array
        tasks.push({ title: taskText, priority, dueDate });
        renderCalendarTasks();

        // Reset form
        taskInput.value = "";
        dueDateInput.value = "";
        prioritySelect.value = "low";
    });

    taskList.addEventListener("change", (e) => {
        if (e.target.classList.contains("task-status")) {
            e.target.closest(".task-card").classList.toggle("completed");
        }
    });

    // Initial load
    renderCalendarTasks();

    // TEAM: Basic profile dropdown toggle
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.querySelector('.dropdown-content');

    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking elsewhere
    window.addEventListener('click', () => {
        dropdown.style.display = 'none';
    });

});
