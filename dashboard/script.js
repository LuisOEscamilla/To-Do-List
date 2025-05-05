document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("prioritySelect");
    const dueDateInput = document.getElementById("dueDateInput");
    const addTaskBtn = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const profileMenu = document.querySelector('.profile-menu');
    const profileIcon = profileMenu.querySelector('.profile-icon');
    const dropdownContent = profileMenu.querySelector('.dropdown-content');
    const settingsMenu = dropdownContent.querySelector('.settings-menu');
    const settingsDropdown = settingsMenu.querySelector('.settings-dropdown');
    const darkModeToggle = document.getElementById('darkModeToggle');

    let tasks = []; // All task data
    async function loadTasks() {
        try {
            const res = await fetch("/api/tasks");
            const data = await res.json();
            tasks = data.tasks;
            renderCalendarTasks();
            showTodayTasks();
        } catch (err) {
            console.error("Failed to load tasks:", err);
        }
    }

    let currentOpenDropdown = null; // Track open dropdowns

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

            tasks.filter(t => t.dueDate === dateStr && !t.completed).forEach(t => {
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
            } else if (page === "groups") {
                showSection("groupsSection");
            } else if (page === "friends") {
                showSection("friendsSection");
            }
        });
    });

    function showTodayTasks() {
        const todayStr = new Date().toISOString().split("T")[0];
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        const todayTasks = tasks.filter(t => t.dueDate === todayStr && !t.completed);
        const sortedTasks = sortTasks(todayTasks);

        if (sortedTasks.length === 0) {
            taskList.innerHTML = "<p>No tasks due today.</p>";
            return;
        }

        sortedTasks.forEach(t => {
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

    function sortTasks(tasks) {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...tasks].sort((a, b) => 
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }

    addTaskBtn.addEventListener("click", async () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;
    
        if (!taskText) return;
    
        // Save to server
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: taskText, priority, dueDate })
            });
    
            if (!res.ok) {
                const error = await res.json();
                alert("Failed to save task: " + error.message);
                return;
            }
        } catch (err) {
            console.error("Error saving task:", err);
            alert("Could not save task. Please try again.");
            return;
        }
    
        // Update local state and UI
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
        tasks.push({ title: taskText, priority, dueDate });
        renderCalendarTasks();
    
        taskInput.value = "";
        dueDateInput.value = "";
        prioritySelect.value = "low";
    });
    
    taskList.addEventListener("change", async (e) => {
        if (e.target.classList.contains("task-status")) {
            const card = e.target.closest(".task-card");
            card.classList.toggle("completed");
    
            const title = card.querySelector(".task-title").textContent;
            const dueDate = card.querySelector(".task-due").textContent.replace("Due: ", "");
    
            try {
                await fetch("/api/tasks/complete", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, dueDate })
                });
    
                // Update local array
                const task = tasks.find(t => t.title === title && t.dueDate === dueDate);
                if (task) task.completed = true;
    
                renderCalendarTasks(); // refresh view
            } catch (err) {
                console.error("Failed to mark complete:", err);
            }
        }
    });
    

    // ===== DROPDOWNS =====
    // TEAM: toggle the main profile dropdown
    profileIcon.addEventListener('click', e => {
        e.stopPropagation(); // prevent window click from closing it
        const open = dropdownContent.style.display === 'block';
        dropdownContent.style.display = open ? 'none' : 'block';
    });
    
    // TEAM: toggle just the settings dropdown
    settingsMenu.addEventListener('click', e => {
        e.stopPropagation(); // prevent window click from closing it
        const open = settingsDropdown.style.display === 'block';
        settingsDropdown.style.display = open ? 'none' : 'block';
    });
    
    // TEAM: clicking outside profile-menu closes everything
    window.addEventListener('click', e => {
        if (!e.target.closest('.profile-menu')) {
        dropdownContent.style.display  = 'none';
        settingsDropdown.style.display = 'none';
        }
    });
    
    // TEAM: dark mode switch
    darkModeToggle.addEventListener('change', () => {
        document.documentElement.classList.toggle(
        'dark-mode',
        darkModeToggle.checked
        );
    });


    async function addFriend() {
        const username = document.getElementById("friendUsername").value;
        try {
            const res = await fetch("/api/friends/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendUsername: username })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            loadFriends();
        } catch (err) {
            alert(err.message);
        }
    }

    async function loadFriends() {
        try {
            const res = await fetch("/api/friends/list");
            const { friends } = await res.json();
            const list = document.getElementById("friendsList");
            list.innerHTML = friends.map(f => 
                `<li class="task-card">${f.username}</li>`
            ).join("");
        } catch (err) {
            console.error("Failed loading friends");
        }
    }

    // Add click handler to friends menu item
    document.querySelector("[data-page='friends']").addEventListener("click", loadFriends);
    // Initial load
    loadTasks(); // Fetch tasks from MongoDB
    document.querySelector('[data-page="home"]').click();


});