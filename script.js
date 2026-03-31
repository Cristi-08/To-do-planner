// ===== DARK/LIGHT MODE =====
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

// ===== FETCH QUOTE =====
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

// ===== TASKS =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

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
    updateStats();
}