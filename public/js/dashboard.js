import { isAuthenticated, redirectToLogin, showClock, setupLogout } from './utils.js';
import { initTaskManager } from './task.js';
import { checkAndGenerateTokens } from './token.js';
import { resumeFloatingCountdownIfActive } from './floatingCountdown.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  showClock();        
  setupLogout();       
  await checkAndGenerateTokens(); 
  await initTaskManager();        
  resumeFloatingCountdownIfActive(); // Resume floating countdown if active
});
