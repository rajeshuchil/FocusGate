// rewardTimerWorker.js
// This script runs in a dedicated hidden window or tab to keep the timer and beep accurate even if the dashboard is backgrounded.
// It communicates with dashboard.html via BroadcastChannel.

let audioContext = null;
let beepBuffer = null;
let timerInterval = null;
let lastBeepSecond = null;
let endTime = null;
let channel = new BroadcastChannel('reward-timer');

async function loadBeepBuffer() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (beepBuffer) return beepBuffer;
  const response = await fetch('audio/beep.mp3');
  const arrayBuffer = await response.arrayBuffer();
  beepBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return beepBuffer;
}

async function playBeep() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') await audioContext.resume();
  const buffer = await loadBeepBuffer();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

channel.onmessage = (event) => {
  if (event.data && event.data.type === 'start') {
    endTime = event.data.endTime;
    if (timerInterval) clearInterval(timerInterval);
    lastBeepSecond = null;
    timerInterval = setInterval(tick, 1000);
    tick();
  } else if (event.data && event.data.type === 'stop') {
    if (timerInterval) clearInterval(timerInterval);
    endTime = null;
  }
};

function tick() {
  if (!endTime) return;
  const now = Date.now();
  let remaining = Math.floor((endTime - now) / 1000);
  if (remaining < 0) remaining = 0;
  channel.postMessage({ type: 'tick', remaining });
  if (remaining > 0 && remaining <= 5 && remaining !== lastBeepSecond) {
    playBeep();
    lastBeepSecond = remaining;
  }
  if (remaining <= 0) {
    channel.postMessage({ type: 'done' });
    if (timerInterval) clearInterval(timerInterval);
    endTime = null;
  }
}

// Resume AudioContext on user interaction
window.addEventListener('click', () => {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') audioContext.resume();
});
window.addEventListener('keydown', () => {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') audioContext.resume();
});
