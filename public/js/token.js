import { getAuthToken } from "./utils.js"
import { showFloatingCountdown } from "./floatingCountdown.js"

// 🔹 SINGLE-USE TOKEN: Track token states to prevent reuse
const tokenStates = new Map() // taskId -> { used: boolean, generating: boolean }

export async function checkAndGenerateTokens() {
  await fetch("/api/tasks/check-completed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export function renderTokenForm(taskId, container) {
  // Check if we already have a token form for this task
  const existingForm = container.querySelector(".token-form")
  if (existingForm) return

  const tokenContainer = document.createElement("div")
  tokenContainer.className = "token-container"
  tokenContainer.innerHTML = `
    <div class="reward-header">
      <span class="reward-icon">🎉</span>
      <h4>Claim Your Reward!</h4>
      <p>You've earned access to a distracting site</p>
    </div>
    <form class="token-form">
      <div class="url-input-group">
        <span class="input-icon">🌐</span>
        <input type="url" placeholder="Enter website URL (e.g., youtube.com)" required />
      </div>
      <button type="submit" class="token-btn" id="token-btn-${taskId}">
        <span class="btn-icon">🚀</span>
        <span class="btn-text">Generate Token</span>
      </button>
      <div class="token-status" id="status-${taskId}"></div>
    </form>
  `

  const form = tokenContainer.querySelector(".token-form")
  form.addEventListener("submit", (e) => handleTokenSubmit(e, taskId))
  container.appendChild(tokenContainer)

  // Add entrance animation
  setTimeout(() => {
    tokenContainer.classList.add("token-container-visible")
  }, 100)
}

async function handleTokenSubmit(e, taskId) {
  e.preventDefault()

  // 🔹 SINGLE-USE TOKEN: Check if token is already used or being generated
  const tokenState = tokenStates.get(taskId) || { used: false, generating: false }

  if (tokenState.used) {
    showNotification("Token already used for this task!", "error")
    return
  }

  if (tokenState.generating) {
    showNotification("Token generation in progress...", "warning")
    return
  }

  const url = e.target.querySelector("input").value.trim()
  const button = document.getElementById(`token-btn-${taskId}`)
  const statusDiv = document.getElementById(`status-${taskId}`)

  // Mark as generating
  tokenStates.set(taskId, { used: false, generating: true })

  // Update button to loading state
  button.disabled = true
  button.innerHTML = `
    <span class="btn-spinner">⏳</span>
    <span class="btn-text">Generating...</span>
  `
  button.classList.add("loading")

  statusDiv.innerHTML = `
    <div class="status-message generating">
      <span class="status-icon">⚡</span>
      <span>Generating your reward token...</span>
    </div>
  `

  try {
    const res = await fetch("/api/tokens/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ taskId, url }),
    })

    const data = await res.json()
    console.log("Token generation response:", data)

    if (data.tokenId && url) {
      
      tokenStates.set(taskId, { used: true, generating: false })

      button.innerHTML = `
        <span class="btn-icon">✅</span>
        <span class="btn-text">Token Used</span>
      `
      button.classList.remove("loading")
      button.classList.add("used")

      statusDiv.innerHTML = `
        <div class="status-message success">
          <span class="status-icon">🎯</span>
          <span>Token activated! Enjoy your 10-minute break!</span>
        </div>
      `

      // Show success notification
      showNotification("🎉 Token activated! Distraction site opened for 10 minutes!", "success")

      // Open distraction site with floating countdown
      showFloatingCountdown(url, 120, data.tokenId) // 10 minutes
    } else {
      throw new Error("Token generation failed")
    }
  } catch (err) {
    console.error("Token generation error:", err)

    // Reset state on error
    tokenStates.set(taskId, { used: false, generating: false })

    button.disabled = false
    button.innerHTML = `
      <span class="btn-icon">🚀</span>
      <span class="btn-text">Generate Token</span>
    `
    button.classList.remove("loading")

    statusDiv.innerHTML = `
      <div class="status-message error">
        <span class="status-icon">❌</span>
        <span>Token generation failed. Please try again.</span>
      </div>
    `

    showNotification("Error generating token. Please try again.", "error")
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close">×</button>
  `

  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100)

  // Auto hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 5000)

  // Manual close
  notification.querySelector(".notification-close").onclick = () => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }
}
