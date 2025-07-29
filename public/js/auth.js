const API_BASE = 'https://your-backend-service.onrender.com/api';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleFormLink = document.getElementById('toggleFormLink');
const toggleMessage = document.getElementById('toggleMessage');
const formTitle = document.getElementById('formTitle');

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Login error:', err);
    alert('Login failed');
  }
});

// Register Handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Registration failed');

    alert('Registered successfully. You can now login.');
    toggleForms(); // Automatically switch to login form
  } catch (err) {
    console.error('Registration error:', err);
    alert('Registration failed');
  }
});

// Toggle Login/Register Forms
function toggleForms(e) {
  if (e) e.preventDefault();

  const isLoginHidden = loginForm.classList.contains('hidden');
  loginForm.classList.toggle('hidden');
  registerForm.classList.toggle('hidden');

  if (isLoginHidden) {
    formTitle.textContent = 'Login to FocusFlow';
    toggleMessage.childNodes[0].textContent = "Don't have an account? ";
    toggleFormLink.textContent = 'Register';
  } else {
    formTitle.textContent = 'Register for FocusFlow';
    toggleMessage.childNodes[0].textContent = 'Already have an account? ';
    toggleFormLink.textContent = 'Login';
  }
}

toggleFormLink.addEventListener('click', toggleForms);
