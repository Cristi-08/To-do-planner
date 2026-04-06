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

// ===== SAVE TASKS TO LOCALSTORAGE =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== STATISTICS =====
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = total - completed;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-label').textContent = pct + '% completate';
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

// ===== ADD TASK =====
function addTask() {
    const input = document.getElementById('task-input');
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;
    if (input.value.trim() === '') return;
    const task = {
        id: Date.now(),
        text: input.value.trim(),
        category,
        priority,
        deadline,
        completed: false
    };
    tasks.push(task);
    saveTasks();
    input.value = '';
    document.getElementById('task-deadline').value = '';
    renderTasks(document.getElementById('filter-category').value);
    updateStats();
}

// ===== MARK TASK AS COMPLETED =====
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks(document.getElementById('filter-category').value);
    updateStats();
}

// ===== FILTER TASKS =====
function filterTasks() {
    const filter = document.getElementById('filter-category').value;
    renderTasks(filter);
}

// ===== RENDER TASKS =====
function renderTasks(filter = 'all') {
    const list = document.getElementById('task-list');
    let filtered = filter === 'all' ? [...tasks] : tasks.filter(t => t.category === filter);

    const sortEl = document.getElementById('sort-tasks');
    const sort = sortEl ? sortEl.value : 'created';
    const prioRank = { urgent: 0, normal: 1, relaxed: 2 };
    if (sort === 'deadline') {
        filtered.sort((a, b) => (a.deadline  '9999-12-31').localeCompare(b.deadline  '9999-12-31'));
    } else if (sort === 'priority') {
        filtered.sort((a, b) => prioRank[a.priority] - prioRank[b.priority]);
    } else {
        filtered.sort((a, b) => a.id - b.id);
    }

    const today = new Date().toISOString().split('T')[0];
    const urgencyLabel = (t) => {
        if (!t.deadline) return '';
        if (t.deadline < today) return '🔥 Expirat';
        const diff = Math.ceil((new Date(t.deadline) - new Date(today)) / 86400000);
        if (diff === 0) return '🔥 Astăzi';
        if (diff === 1) return '⏰ Mâine';
        if (diff <= 3) return ⚡ ${diff} zile;
        return 🕒 ${diff} zile;
    };

    if (filtered.length === 0) {
        list.innerHTML = '<p class="no-tasks">Nu ai taskuri momentan.</p>';
        return;
    }

    const priorityLabels = { urgent: '🔴 Urgent', normal: '🟡 Normal', relaxed: '🟢 Relaxed' };
    const categoryLabels = { school: '🎓 Școală', personal: '👤 Personal', project: '💼 Proiect' };
list.innerHTML = filtered.map(t => {
        const overdue = t.deadline && t.deadline < today && !t.completed;
        return `
        <div class="task-item ${t.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}" data-priority="${t.priority}" data-id="${t.id}">
            <div class="task-info">
                <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})" />
                <span class="task-text">${overdue ? '⚠️ ' : ''}${t.text}</span>
            </div>
            <div class="task-meta">
                ${t.deadline ? <span class="task-badge">📅 ${t.deadline}</span> : ''}
                ${t.deadline && !t.completed ? <span class="task-badge urgency ${t.deadline < today ? 'u-over' : ''}">${urgencyLabel(t)}</span> : ''}
                <span class="task-badge">${categoryLabels[t.category]}</span>
                <span class="task-badge">${priorityLabels[t.priority]}</span>
                <button class="delete-btn" onclick="deleteTask(${t.id})">🗑️</button>
            </div>
        </div>
    `;
    }).join('');

    requestAnimationFrame(() => {
        list.querySelectorAll('.task-item').forEach(el => el.classList.add('show'));
    });
}


function deleteTask(id) {
    if (!confirm('Ești sigur că vrei să ștergi acest task?')) return;
    const el = document.querySelector(`.task-item[data-id="${id}"]`);
    if (el) el.classList.add('removing');
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(document.getElementById('filter-category').value);
        updateStats();
    }, 350);
}
