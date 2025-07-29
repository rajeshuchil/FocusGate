// ✅ API Base URL
export const API_BASE = 'http://localhost:3000/api';

// ✅ Parse JWT token
export const parseJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// ✅ Check if token is expired
export const isTokenExpired = (token) => {
  const decoded = parseJWT(token);
  if (!decoded) return true;
  return Date.now() >= decoded.exp * 1000;
};

// ✅ Get Auth Token from localStorage
export const getAuthToken = () => localStorage.getItem('token');

// ✅ Set Auth Token
export const setAuthToken = (token) => localStorage.setItem('token', token);

// ✅ Remove Auth Token
export const removeAuthToken = () => localStorage.removeItem('token');

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token && !isTokenExpired(token);
};

// ✅ Redirect to login page
export const redirectToLogin = () => {
  window.location.href = 'index.html';
};

// ✅ Redirect to dashboard
export const redirectToDashboard = () => {
  window.location.href = 'dashboard.html';
};

// ✅ Format time (e.g., 1h 30m 10s)
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// ✅ Show live clock in dashboard
export const showClock = () => {
  const clock = document.getElementById('liveClock');
  if (!clock) return;

  const updateClock = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  };

  updateClock();
  setInterval(updateClock, 1000);
};

// ✅ Setup Logout
export const setupLogout = () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeAuthToken();
      redirectToLogin();
    });
  }
};
