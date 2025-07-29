import { getAuthToken } from './utils.js';
import { showFloatingCountdown } from './floatingCountdown.js';

export async function checkAndGenerateTokens() {
  await fetch('/api/tasks/check-completed', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
}

export function renderTokenForm(taskId, container) {
  const form = document.createElement('form');
  form.className = 'token-form';
  form.innerHTML = `
    <input type="url" placeholder="Enter distracting site URL" required />
    <button type="submit">Generate Token</button>
  `;

  form.addEventListener('submit', (e) => handleTokenSubmit(e, taskId));
  container.appendChild(form);
}

async function handleTokenSubmit(e, taskId) {
  e.preventDefault();
  const url = e.target.querySelector('input').value.trim();

  try {
    const res = await fetch('/api/tokens/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ taskId, url })
    });

    const data = await res.json();
    console.log("Token generation response:", data);

    if (data.tokenId && url) {
      showFloatingCountdown(url, 120, data.tokenId); // 2 min
    } else {
      alert('Token generation failed.');
    }
  } catch (err) {
    console.error("Fetch error during token generation:", err);
    alert('Error generating token.');
  }
}
