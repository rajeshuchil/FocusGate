//const API_BASE = "https://focusgate.onrender.com/api"
const API_BASE = "http://localhost:3000/api";
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const toggleFormLink = document.getElementById("toggleFormLink")
const toggleMessage = document.getElementById("toggleMessage")
const formTitle = document.getElementById("formTitle")
const formSubtitle = document.getElementById("formSubtitle")
const authMessage = document.getElementById("authMessage")

// Password strength checker
const registerPassword = document.getElementById("registerPassword")
if (registerPassword) {
  registerPassword.addEventListener("input", checkPasswordStrength)
}

function checkPasswordStrength(e) {
  const password = e.target.value
  const strengthBar = document.querySelector(".strength-bar::after") || document.querySelector(".strength-bar")
  const strengthText = document.querySelector(".strength-text")

  let strength = 0
  let strengthLabel = "Weak"

  // Check password criteria
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25

  // Update strength label
  if (strength >= 75) strengthLabel = "Strong"
  else if (strength >= 50) strengthLabel = "Good"
  else if (strength >= 25) strengthLabel = "Fair"

  // Update UI
  if (strengthBar) {
    strengthBar.style.setProperty("--strength-width", `${strength}%`)
  }

  if (strengthText) {
    strengthText.textContent = `Password strength: ${strengthLabel}`
    strengthText.style.color =
      strength >= 75 ? "var(--success-color)" : strength >= 50 ? "var(--warning-color)" : "var(--error-color)"
  }

  // Add CSS custom property for strength bar
  if (!document.querySelector("#password-strength-style")) {
    const style = document.createElement("style")
    style.id = "password-strength-style"
    style.textContent = `
      .strength-bar::after {
        width: var(--strength-width, 0%);
      }
    `
    document.head.appendChild(style)
  }
}

// Show message function
function showMessage(message, type = "info") {
  authMessage.textContent = message
  authMessage.className = `auth-message ${type}`
  authMessage.classList.remove("hidden")

  // Auto hide success messages
  if (type === "success") {
    setTimeout(() => {
      authMessage.classList.add("hidden")
    }, 5000)
  }
}

// Hide message function
function hideMessage() {
  authMessage.classList.add("hidden")
}

// Set button loading state
function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add("loading")
    button.disabled = true
  } else {
    button.classList.remove("loading")
    button.disabled = false
  }
}

// Login Handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  hideMessage()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const submitBtn = loginForm.querySelector('button[type="submit"]')

  if (!email || !password) {
    showMessage("Please fill in all fields", "error")
    return
  }

  setButtonLoading(submitBtn, true)

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Login failed")
    }

    localStorage.setItem("token", data.token)
    showMessage("Login successful! Redirecting...", "success")

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1500)
  } catch (err) {
    console.error("Login error:", err)
    showMessage(err.message || "Login failed. Please check your credentials.", "error")
  } finally {
    setButtonLoading(submitBtn, false)
  }
})

// Register Handler
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  hideMessage()

  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const submitBtn = registerForm.querySelector('button[type="submit"]')

  if (!name || !email || !password) {
    showMessage("Please fill in all fields", "error")
    return
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters long", "error")
    return
  }

  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address", "error")
    return
  }

  setButtonLoading(submitBtn, true)

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Registration failed")
    }

    showMessage("Account created successfully! You can now sign in.", "success")

    // Auto switch to login form after successful registration
    setTimeout(() => {
      toggleForms()
      // Pre-fill email in login form
      document.getElementById("loginEmail").value = email
    }, 2000)
  } catch (err) {
    console.error("Registration error:", err)
    showMessage(err.message || "Registration failed. Please try again.", "error")
  } finally {
    setButtonLoading(submitBtn, false)
  }
})

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Toggle Login/Register Forms
function toggleForms(e) {
  if (e) e.preventDefault()

  hideMessage()

  const isLoginHidden = loginForm.classList.contains("hidden")

  // Toggle form visibility
  loginForm.classList.toggle("hidden")
  registerForm.classList.toggle("hidden")

  // Update header text and toggle link
  if (isLoginHidden) {
    // Switching to login
    formTitle.textContent = "Welcome Back"
    formSubtitle.textContent = "Sign in to continue your focus journey"
    toggleMessage.innerHTML = `Don't have an account? <a href="#" id="toggleFormLink">Create one</a>`
  } else {
    // Switching to register
    formTitle.textContent = "Join FocusFlow"
    formSubtitle.textContent = "Create your account and start focusing"
    toggleMessage.innerHTML = `Already have an account? <a href="#" id="toggleFormLink">Sign in</a>`
  }

  // Re-attach event listener to new toggle link
  const newToggleLink = document.getElementById("toggleFormLink")
  newToggleLink.addEventListener("click", toggleForms)

  // Clear form fields
  document.querySelectorAll(".auth-form input").forEach((input) => {
    input.value = ""
  })

  // Reset password strength indicator
  const strengthBar = document.querySelector(".strength-bar")
  const strengthText = document.querySelector(".strength-text")
  if (strengthBar) strengthBar.style.setProperty("--strength-width", "0%")
  if (strengthText) {
    strengthText.textContent = "Password strength"
    strengthText.style.color = "var(--text-secondary)"
  }
}

// Initial toggle link event listener
toggleFormLink.addEventListener("click", toggleForms)

// Auto-hide messages when user starts typing
document.querySelectorAll(".auth-form input").forEach((input) => {
  input.addEventListener("input", () => {
    if (!authMessage.classList.contains("hidden")) {
      setTimeout(hideMessage, 1000)
    }
  })
})

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token")
  if (token) {
    // Simple token validation (you might want to verify with server)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.exp * 1000 > Date.now()) {
        window.location.href = "dashboard.html"
        return
      }
    } catch (e) {
      // Invalid token, remove it
      localStorage.removeItem("token")
    }
  }

  // Add entrance animation
  document.querySelector(".auth-container").style.animation = "fadeInUp 0.8s ease-out"
})

// Add floating animation to brand logo
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".brand-logo")
  if (logo) {
    logo.addEventListener("mouseenter", () => {
      logo.style.transform = "scale(1.1) rotate(10deg)"
    })

    logo.addEventListener("mouseleave", () => {
      logo.style.transform = "scale(1) rotate(0deg)"
    })
  }
})
