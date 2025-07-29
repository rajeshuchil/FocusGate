const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const tokenId = params.get('tokenId');

let popupWindow = null;
let remainingTime = 600;
const countdownElement = document.getElementById('countdown');
const beepAudio = new Audio('audio/beep.mp3');
let lastBeepSecond = null;

if (!url || !tokenId) {
  window.location.href = 'dashboard.html';
} else {
  // Open the target site in a popup
  popupWindow = window.open(decodeURIComponent(url), '_blank', 'width=1000,height=700');
}

// Countdown logic
function updateCountdown() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  if (remainingTime <= 60) {
    countdownElement.style.color = 'red';
  }

  // Play beep for last 5 seconds
  if (remainingTime > 0 && remainingTime <= 5 && remainingTime !== lastBeepSecond) {
    beepAudio.currentTime = 0;
    beepAudio.play();
    lastBeepSecond = remainingTime;
  }

  if (remainingTime <= 0) {
    clearInterval(timer);

    // Attempt to close the popup
    let tabClosed = false;
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
      // Give the browser a moment to close the tab
      setTimeout(() => {
        if (popupWindow && !popupWindow.closed) {
          alert('If the reward tab did not close automatically, please close it manually.');
        }
        window.location.href = 'dashboard.html';
      }, 500);
      tabClosed = true;
    }

    // Mark token as used
    if (tokenId) {
      fetch(`/api/tokens/${tokenId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If popupWindow was not opened or already closed, show the message and redirect
    if (!tabClosed) {
      alert('If the reward tab did not close automatically, please close it manually.');
      window.location.href = 'dashboard.html';
    }
    return;
  }

  remainingTime--;
}

updateCountdown();
const timer = setInterval(updateCountdown, 1000);

// Add a test beep button for debugging
const testBeepBtn = document.createElement('button');
testBeepBtn.textContent = 'Test Beep';
testBeepBtn.style.position = 'fixed';
testBeepBtn.style.bottom = '16px';
testBeepBtn.style.right = '16px';
testBeepBtn.style.zIndex = 10000;
testBeepBtn.onclick = () => {
  beepAudio.currentTime = 0;
  beepAudio.play();
};
document.body.appendChild(testBeepBtn);
