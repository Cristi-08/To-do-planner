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
    updateStats();
}