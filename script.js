// ===== DARK/LIGHT MODE - closes #15 (Cristi) =====
function toggleTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    if (html.getAttribute('data-theme') === 'light') {
        html.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️ Light';
    } else {
        html.setAttribute('data-theme', 'light');
        btn.textContent = '🌙 Dark';
    }
    localStorage.setItem('theme', html.getAttribute('data-theme'));
}

// ===== SAVE TASKS TO LOCALSTORAGE - closes #7 (Cristi) =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== STATISTICS - closes #5 (Cristi) =====
function updateStats() {
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('completed-tasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('pending-tasks').textContent = tasks.filter(t => !t.completed).length;
}

// ===== INIT =====
window.onload = function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    fetchQuote();
    renderTasks();
    updateStats();
}

// ===== FETCH QUOTE - closes #4 (Mircea) =====
async function fetchQuote() {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        document.getElementById('quote-text').textContent = data[0].q;
        document.getElementById('quote-author').textContent = '— ' + data[0].a;
    } catch (error) {
        document.getElementById('quote-text').textContent = 'Stay focused and keep going!';
        document.getElementById('quote-author').textContent = '— To-Do Planner';
    }
}

// ===== ADD TASK - closes #6 (Mircea) =====
function addTask() {
    const input = document.getElementById('task-input');
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    if (input.value.trim() === '') return;
    const task = {
        id: Date.now(),
        text: input.value.trim(),
        category,
        priority,
        completed: false
    };
    tasks.push(task);
    saveTasks();
    input.value = '';
    updateStats();
}

// ===== MARK TASK AS COMPLETED - closes #8 (Mircea) =====
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
    updateStats();
}

// ===== FILTER TASKS - closes #10 (Mircea) =====
function filterTasks() {
    const filter = document.getElementById('filter-category').value;
    renderTasks(filter);
}

// ===== RENDER TASKS + DELETE - closes #9 (Mircea) =====
function renderTasks(filter = 'all') {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    const filtered = tasks.filter(t => filter === 'all' || t.category === filter);
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = task - item ${ task.completed ? 'completed' : '' } priority - ${ task.priority };
        li.innerHTML = `
            <span>${task.text} <small>[${task.category} / ${task.priority}]</small></span>
            <div>
                <button onclick="toggleTask(${task.id})">✅</button>
                <button onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}