// floatingCountdown.js
// Usage: import { showFloatingCountdown, resumeFloatingCountdownIfActive } from './floatingCountdown.js';
// showFloatingCountdown(targetUrl, durationSeconds, tokenId)

let animationFrameId = null;
let distractingTab = null;
const beepAudio = new Audio('audio/beep.mp3');

// --- Reward Timer Offload Logic ---

export function showFloatingCountdown(targetUrl, durationSeconds = 120, tokenId) {
  // Store token info in localStorage
  const startTime = Date.now();
  const endTime = startTime + durationSeconds * 1000;
  const activeToken = { tokenId, url: targetUrl, startTime, endTime, duration: durationSeconds };
  localStorage.setItem('activeToken', JSON.stringify(activeToken));

  // Remove any existing widget
  removeFloatingCountdown();

  // Create widget
  createFloatingWidget(durationSeconds);

  // Open the distracting site in a new tab and keep the reference
  distractingTab = window.open(targetUrl, '_blank');

  startCountdown(endTime);
}

export function resumeFloatingCountdownIfActive() {
  const activeTokenStr = localStorage.getItem('activeToken');
  if (!activeTokenStr) return;
  const { url, endTime, tokenId, duration } = JSON.parse(activeTokenStr);
  const now = Date.now();
  const remaining = Math.floor((endTime - now) / 1000);
  if (remaining > 0) {
    removeFloatingCountdown();
    createFloatingWidget(remaining);
    startCountdown(endTime);
  } else {
    clearActiveToken();
  }
}

function createFloatingWidget(initialSeconds) {
  const widget = document.createElement('div');
  widget.id = 'floating-countdown-widget';
  widget.style.position = 'fixed';
  widget.style.bottom = '32px';
  widget.style.right = '32px';
  widget.style.background = 'rgba(30,30,30,0.95)';
  widget.style.color = '#fff';
  widget.style.padding = '18px 28px';
  widget.style.borderRadius = '16px';
  widget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
  widget.style.fontSize = '2rem';
  widget.style.zIndex = '9999';
  widget.style.display = 'flex';
  widget.style.alignItems = 'center';
  widget.style.gap = '12px';
  widget.innerHTML = `<span id="floating-countdown-timer">${formatTime(initialSeconds)}</span> <span>Distraction time</span>`;
  document.body.appendChild(widget);
}

function startCountdown(endTime) {
  const timerSpan = document.getElementById('floating-countdown-timer');
  let lastBeepSecond = null;

  function update() {
    const now = Date.now();
    let remaining = Math.floor((endTime - now) / 1000);
    if (remaining < 0) remaining = 0;
    timerSpan.textContent = formatTime(remaining);
    if (remaining <= 60) {
      timerSpan.style.color = 'red';
    }
    // Play beep for last 5 seconds
    if (remaining > 0 && remaining <= 5 && remaining !== lastBeepSecond) {
      beepAudio.currentTime = 0;
      beepAudio.play();
      lastBeepSecond = remaining;
    }
    if (remaining <= 0) {
      closeDistractionTab();
      removeFloatingCountdown();
      clearActiveToken();
      return;
    }
    animationFrameId = requestAnimationFrame(update);
  }
  update();
}

export function removeFloatingCountdown() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  const widget = document.getElementById('floating-countdown-widget');
  if (widget) widget.remove();
}

function closeDistractionTab() {
  if (distractingTab && !distractingTab.closed) {
    distractingTab.close();
  }
}

function clearActiveToken() {
  const activeTokenStr = localStorage.getItem('activeToken');
  if (activeTokenStr) {
    const { tokenId } = JSON.parse(activeTokenStr);
    if (tokenId) {
      fetch(`/api/tokens/use/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to mark token as used');
        }
        return res.json();
      })
      .then(data => {
        console.log('Token marked as used:', data);
      })
      .catch(err => {
        console.error('Error marking token used:', err);
      });
    }
  }
  localStorage.removeItem('activeToken');
}

function formatTime(secs) {
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
