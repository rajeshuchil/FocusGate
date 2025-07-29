import { getAuthToken } from "./utils.js"
import { renderTokenForm, checkAndGenerateTokens } from "./token.js"

export async function initTaskManager() {
  const form = document.getElementById("newTaskForm")
  if (form) {
    form.addEventListener("submit", createTask)
  }
  await loadTasks()
}

async function fetchTasks() {
  const res = await fetch("/api/tasks", {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  return await res.json()
}

async function loadTasks() {
  const taskList = document.getElementById("taskList")
  taskList.innerHTML = ""
  const tasks = await fetchTasks()

  if (!tasks.length) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No tasks yet!</h3>
        <p>Create your first task to start focusing</p>
      </div>
    `
    return
  }

  tasks.forEach(renderTask)
}

function renderTask(task) {
  console.log("Task debug:", task.title, "Completed:", task.Completed, "TokenGenerated:", task.tokenGenerated)

  const taskEl = document.createElement("div")
  taskEl.className = `task-card ${task.Completed ? "completed" : "active"}`
  taskEl.setAttribute("data-task-id", task._id) // Add task ID for easy removal
  taskEl.innerHTML = `
    <div class="task-header">
      <h3 class="task-title">${task.title}</h3>
      <div class="task-status ${task.Completed ? "status-completed" : "status-active"}">
        <span class="status-dot"></span>
        ${task.Completed ? "Completed" : "In Progress"}
      </div>
    </div>
    <div class="task-content">
      <div class="task-duration">
        <span class="duration-label">Duration:</span>
        <span class="duration-value">${task.duration} minutes</span>
      </div>
      <div class="countdown-container">
        <div class="countdown" id="countdown-${task._id}"></div>
      </div>
    </div>
  `

  // Append to DOM first before using getElementById
  document.getElementById("taskList").appendChild(taskEl)

  if (task.Completed && task.tokenGenerated) {
    renderTokenForm(task._id, taskEl)
  }

  if (!task.Completed) {
    startCountdown(task.endsAt, `countdown-${task._id}`)
  }
}

function startCountdown(endTimeStr, elementId) {
  const countdownEl = document.getElementById(elementId)
  if (!countdownEl) return

  const endTime = new Date(endTimeStr)
  const taskId = elementId.replace("countdown-", "")

  // 🔊 Create audio for beep sound
  const beepAudio = new Audio("audio/beep.mp3")
  let lastBeepSecond = null

  function update() {
    const now = new Date()
    const remaining = endTime - now

    if (remaining <= 0) {
      countdownEl.innerHTML = `
        <div class="timer-finished">
          <span class="timer-icon">✅</span>
          <span class="timer-text">Task Completed!</span>
        </div>
      `
      countdownEl.className = "countdown finished"

      // Add completion animation
      const taskCard = countdownEl.closest(".task-card")
      taskCard.classList.add("task-completing")

      // 🔹 AUTO UI UPDATE: Check for completed tasks and update UI
      setTimeout(async () => {
        await checkAndGenerateTokens()
        await refreshTaskUI()
      }, 1000)

      return
    }

    const totalSeconds = Math.floor(remaining / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60

    // 🔊 Play beep for last 5 seconds
    if (totalSeconds > 0 && totalSeconds <= 5 && totalSeconds !== lastBeepSecond) {
      beepAudio.currentTime = 0
      beepAudio.play().catch((e) => console.log("Audio play failed:", e))
      lastBeepSecond = totalSeconds
    }

    // Update countdown display with better styling
    const isUrgent = totalSeconds <= 60
    const isCritical = totalSeconds <= 30

    countdownEl.innerHTML = `
      <div class="timer-display ${isUrgent ? "urgent" : ""} ${isCritical ? "critical" : ""}">
        <span class="timer-icon">${isCritical ? "🚨" : isUrgent ? "⚠️" : "⏳"}</span>
        <span class="timer-text">
          ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}
        </span>
        <span class="timer-label">remaining</span>
      </div>
    `

    setTimeout(update, 1000)
  }

  update()
}

async function refreshTaskUI() {
  const tasks = await fetchTasks()
  const taskList = document.getElementById("taskList")

  // Add fade out animation
  taskList.style.opacity = "0.5"

  setTimeout(() => {
    // Clear and re-render all tasks
    taskList.innerHTML = ""

    if (!tasks.length) {
      taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No tasks yet!</h3>
          <p>Create your first task to start focusing</p>
        </div>
      `
    } else {
      tasks.forEach(renderTask)
    }

    // Fade back in
    taskList.style.opacity = "1"
  }, 300)
}

// 🗑️ Export function to refresh tasks when called from token expiry
export async function refreshTasksFromToken() {
  console.log("Refreshing tasks after token expiry...")
  await refreshTaskUI()
}

async function createTask(e) {
  e.preventDefault()
  const title = e.target.taskTitle.value
  const duration = Number.parseInt(e.target.taskDuration.value)

  if (!title || !duration) return

  // ⏰ VALIDATE MAXIMUM DURATION: Check if duration exceeds 1440 minutes (24 hours)
  if (duration > 1440) {
    showTaskError("Maximum task duration is 1440 minutes (24 hours)")
    return
  }

  if (duration < 1) {
    showTaskError("Minimum task duration is 1 minute")
    return
  }

  // Add loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Creating..."
  submitBtn.disabled = true

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ title, duration }),
    })

    if (!response.ok) {
      throw new Error("Failed to create task")
    }

    e.target.reset()
    await loadTasks()
    showTaskSuccess("Task created successfully!")
  } catch (error) {
    console.error("Error creating task:", error)
    showTaskError("Failed to create task. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

function showTaskError(message) {
  showTaskNotification(message, "error")
}

function showTaskSuccess(message) {
  showTaskNotification(message, "success")
}

function showTaskNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".task-notification")
  existingNotifications.forEach((n) => n.remove())

  const notification = document.createElement("div")
  notification.className = `task-notification ${type}`
  notification.innerHTML = `
    <span class="notification-icon">${type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️"}</span>
    <span class="notification-message">${message}</span>
  `

  // Insert after the form
  const form = document.querySelector(".task-form")
  form.parentNode.insertBefore(notification, form.nextSibling)

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100)

  // Auto hide after 4 seconds
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 4000)
}
