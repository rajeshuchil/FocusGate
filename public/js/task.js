import { getAuthToken } from './utils.js';
import { renderTokenForm } from './token.js';

export async function initTaskManager() {
  const form = document.getElementById('newTaskForm');
  if (form) {
    form.addEventListener('submit', createTask);
  }
  await loadTasks();
}

async function fetchTasks() {
  const res = await fetch('/api/tasks', {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return await res.json();
}

async function loadTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  const tasks = await fetchTasks();

  if (!tasks.length) {
    taskList.innerHTML = '<p>No tasks yet. Add one!</p>';
    return;
  }

  tasks.forEach(renderTask);
}

function renderTask(task) {
  console.log("Task debug:", task.title, "Completed:", task.Completed, "TokenGenerated:", task.tokenGenerated);

  const taskEl = document.createElement('div');
  taskEl.className = 'task-card';
  taskEl.innerHTML = `
    <h3>${task.title}</h3>
    <p>Status: <strong class="${task.Completed ? 'done' : 'pending'}">
      ${task.Completed ? 'Completed' : 'In Progress'}
    </strong></p>
    <div class="countdown" id="countdown-${task._id}"></div>
  `;

  // Append to DOM first before using getElementById
  document.getElementById('taskList').appendChild(taskEl);

  if (task.Completed && task.tokenGenerated) {
    renderTokenForm(task._id, taskEl);
  }

  if (!task.Completed) {
    startCountdown(task.endsAt, `countdown-${task._id}`);
  }
}

function startCountdown(endTimeStr, elementId) {
  const countdownEl = document.getElementById(elementId);
  if (!countdownEl) return;

  const endTime = new Date(endTimeStr);

  function update() {
    const now = new Date();
    const remaining = endTime - now;

    if (remaining <= 0) {
      countdownEl.textContent = '⏱️ Task time over';
      countdownEl.style.color = 'red';
      return;
    }

    const mins = Math.floor((remaining / 1000 / 60) % 60);
    const secs = Math.floor((remaining / 1000) % 60);

    countdownEl.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    countdownEl.style.color = remaining <= 60000 ? 'red' : 'black';

    setTimeout(update, 1000);
  }

  update();
}

async function createTask(e) {
  e.preventDefault();
  const title = e.target.taskTitle.value;
  const duration = e.target.taskDuration.value;

  if (!title || !duration) return;

  await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ title, duration })
  });

  e.target.reset();
  await loadTasks();
}
