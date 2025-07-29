// floatingCountdown.js
// Usage: import { showFloatingCountdown, resumeFloatingCountdownIfActive } from './floatingCountdown.js';
// showFloatingCountdown(targetUrl, durationSeconds, tokenId)

let animationFrameId = null
let distractingTab = null
const beepAudio = new Audio("audio/beep.mp3")

// --- Reward Timer Offload Logic ---

export function showFloatingCountdown(targetUrl, durationSeconds = 120, tokenId) {
  // Store token info in localStorage
  const startTime = Date.now()
  const endTime = startTime + durationSeconds * 1000
  const activeToken = { tokenId, url: targetUrl, startTime, endTime, duration: durationSeconds }
  localStorage.setItem("activeToken", JSON.stringify(activeToken))

  // Remove any existing widget
  removeFloatingCountdown()

  // Create widget
  createFloatingWidget(durationSeconds)

  // Open the distracting site in a new tab and keep the reference
  distractingTab = window.open(targetUrl, "_blank")

  startCountdown(endTime)
}

export function resumeFloatingCountdownIfActive() {
  const activeTokenStr = localStorage.getItem("activeToken")
  if (!activeTokenStr) return
  const { url, endTime, tokenId, duration } = JSON.parse(activeTokenStr)
  const now = Date.now()
  const remaining = Math.floor((endTime - now) / 1000)
  if (remaining > 0) {
    removeFloatingCountdown()
    createFloatingWidget(remaining)
    startCountdown(endTime)
  } else {
    clearActiveToken()
  }
}

function createFloatingWidget(initialSeconds) {
  const widget = document.createElement("div")
  widget.id = "floating-countdown-widget"
  widget.innerHTML = `
    <div class="floating-timer-content">
      <div class="floating-timer-header">
        <span class="floating-timer-icon">🎯</span>
        <span class="floating-timer-title">Distraction Time</span>
      </div>
      <div class="floating-timer-display">
        <span id="floating-countdown-timer" class="floating-timer-time">${formatTime(initialSeconds)}</span>
      </div>
      <div class="floating-timer-progress">
        <div class="progress-bar" id="floating-progress-bar"></div>
      </div>
    </div>
  `

  // Apply styles
  Object.assign(widget.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
    fontSize: "1rem",
    zIndex: "10000",
    minWidth: "280px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    animation: "slideInUp 0.3s ease-out",
  })

  document.body.appendChild(widget)

  // Add CSS animation keyframes if not already added
  if (!document.querySelector("#floating-countdown-styles")) {
    const style = document.createElement("style")
    style.id = "floating-countdown-styles"
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .floating-timer-content {
        text-align: center;
      }
      
      .floating-timer-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
      }
      
      .floating-timer-icon {
        font-size: 1.2em;
      }
      
      .floating-timer-display {
        margin: 12px 0;
      }
      
      .floating-timer-time {
        font-size: 2.5em;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .floating-timer-progress {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 12px;
      }
      
      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 2px;
        transition: width 1s ease;
      }
    `
    document.head.appendChild(style)
  }
}

function startCountdown(endTime) {
  const timerSpan = document.getElementById("floating-countdown-timer")
  const progressBar = document.getElementById("floating-progress-bar")
  const widget = document.getElementById("floating-countdown-widget")

  let lastBeepSecond = null
  const totalDuration = JSON.parse(localStorage.getItem("activeToken"))?.duration || 600

  function update() {
    const now = Date.now()
    let remaining = Math.floor((endTime - now) / 1000)
    if (remaining < 0) remaining = 0

    // Update timer display
    timerSpan.textContent = formatTime(remaining)

    // Update progress bar
    const progress = ((totalDuration - remaining) / totalDuration) * 100
    if (progressBar) {
      progressBar.style.width = `${progress}%`
    }

    // Change colors based on remaining time
    if (remaining <= 60) {
      timerSpan.style.color = "#ff6b6b"
      widget.style.background = "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)"
      widget.style.animation = "pulse 1s infinite"
    } else if (remaining <= 180) {
      timerSpan.style.color = "#feca57"
      widget.style.background = "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
    }

    // 🔊 Play beep for last 5 seconds
    if (remaining > 0 && remaining <= 5 && remaining !== lastBeepSecond) {
      beepAudio.currentTime = 0
      beepAudio.play().catch((e) => console.log("Audio play failed:", e))
      lastBeepSecond = remaining

      // Add shake animation for last 5 seconds
      widget.style.animation = "shake 0.5s ease-in-out"
    }

    if (remaining <= 0) {
      closeDistractionTab()
      removeFloatingCountdown()
      clearActiveToken()

      // Show completion notification
      showCompletionNotification()

      // 🗑️ AUTO REMOVE TASK: Refresh dashboard to remove completed task
      setTimeout(() => {
        if (window.location.pathname.includes("dashboard.html") || window.location.pathname === "/") {
          // Import and call the refresh function
          import("./task.js")
            .then((module) => {
              if (module.refreshTasksFromToken) {
                module.refreshTasksFromToken()
              }
            })
            .catch((err) => {
              console.log("Refreshing page to update task list")
              window.location.reload()
            })
        }
      }, 2000)

      return
    }
    animationFrameId = requestAnimationFrame(update)
  }
  update()

  // Add pulse and shake animations
  if (!document.querySelector("#floating-animations")) {
    const style = document.createElement("style")
    style.id = "floating-animations"
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `
    document.head.appendChild(style)
  }
}

function showCompletionNotification() {
  const notification = document.createElement("div")
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      text-align: center;
      z-index: 10001;
      animation: bounceIn 0.5s ease-out;
    ">
      <div style="font-size: 3em; margin-bottom: 10px;">🎉</div>
      <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">Break Time Over!</h3>
      <p style="margin: 0; opacity: 0.9;">Task completed and removed from dashboard!</p>
    </div>
  `

  document.body.appendChild(notification)

  // Add bounce animation
  if (!document.querySelector("#completion-animation")) {
    const style = document.createElement("style")
    style.id = "completion-animation"
    style.textContent = `
      @keyframes bounceIn {
        0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }

  // Remove after 4 seconds
  setTimeout(() => {
    notification.remove()
  }, 4000)
}

export function removeFloatingCountdown() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  const widget = document.getElementById("floating-countdown-widget")
  if (widget) widget.remove()
}

function closeDistractionTab() {
  if (distractingTab && !distractingTab.closed) {
    distractingTab.close()
  }
}

function clearActiveToken() {
  const activeTokenStr = localStorage.getItem("activeToken")
  if (activeTokenStr) {
    const { tokenId } = JSON.parse(activeTokenStr)
    if (tokenId) {
      // 🔹 SINGLE-USE TOKEN: Mark token as used in backend
      fetch(`/api/tokens/use/${tokenId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to mark token as used")
          }
          return res.json()
        })
        .then((data) => {
          console.log("Token marked as used:", data)
        })
        .catch((err) => {
          console.error("Error marking token used:", err)
        })
    }
  }
  localStorage.removeItem("activeToken")
}

function formatTime(secs) {
  const min = Math.floor(secs / 60)
  const sec = secs % 60
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}
