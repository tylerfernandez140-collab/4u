const statusEl = document.getElementById('status');
const dashboardStatusEl = document.getElementById('dashboard-status');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const nameInput = document.getElementById('name-input');
const loginBtn = document.getElementById('login-btn');
const setupSection = document.getElementById('setup-section');
const formEl = document.getElementById('setup-form');
const enableBtn = document.getElementById('enable-btn');
const dashboard = document.getElementById('dashboard');
const dashboardHeading = document.getElementById('dashboard-heading');
const sendHugBtn = document.getElementById('send-hug-btn');
const logoutBtn = document.getElementById('logout-btn');
const hugModal = document.getElementById('hug-modal');
const hugMessage = document.getElementById('hug-message');
const modalClose = document.querySelector('.modal-close');
const successModal = document.getElementById('success-modal');
const successMessage = document.getElementById('success-message');

// Add cache busting for debugging
const CACHE_BUST = Date.now();
console.log('App loading with cache bust:', CACHE_BUST);

// Force clear any remaining caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      console.log('Deleting cache:', name);
      caches.delete(name);
    });
  });
}

let currentUser = '';

// Check for existing session on load
function checkExistingSession() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser && (savedUser === 'ivan' || savedUser === 'angge')) {
    currentUser = savedUser;
    return true;
  }
  return false;
}

// Check if notifications are already enabled
async function checkNotificationsEnabled() {
  // For production, only check actual push subscription
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    console.log('checkNotificationsEnabled - actual subscription exists:', sub !== null);
    return sub !== null;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Save user session
function saveUserSession(user) {
  localStorage.setItem('currentUser', user);
}

// Clear user session
function clearUserSession() {
  localStorage.removeItem('currentUser');
  currentUser = '';
}

// Logout function
function logout() {
  clearUserSession();
  showLogin();
  setStatus(''); // Clear status instead of showing message
  
  // Notify service worker that user logged out
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'USER_LOGOUT',
      userId: currentUser
    });
  }
}

// Modal functions
function showHugModal(senderName) {
  if (hugMessage) {
    hugMessage.textContent = `${senderName} sent you a hug!`;
  }
  if (hugModal) {
    hugModal.style.display = 'block';
  }
}

function hideHugModal() {
  if (hugModal) {
    hugModal.style.display = 'none';
  }
}

function showSuccessModal(recipientName) {
  if (successMessage) {
    successMessage.textContent = `Hug sent to ${recipientName}!`;
  }
  if (successModal) {
    successModal.style.display = 'block';
    // Auto-hide after 4 seconds
    setTimeout(() => {
      hideSuccessModal();
    }, 4000);
  }
}

function hideSuccessModal() {
  if (successModal) {
    successModal.style.display = 'none';
  }
}

function setStatus(msg) {
  // Use dashboard status if dashboard is visible, otherwise use regular status
  const activeStatusEl = (dashboard && !dashboard.hidden) ? dashboardStatusEl : statusEl;
  if (activeStatusEl) activeStatusEl.textContent = msg || '';
}

async function checkForIncomingHugs() {
  try {
    const res = await fetch('/api/hug');
    if (!res.ok) return;
    
    const data = await res.json();
    const hugs = data.hugs || [];
    
    const senderName = currentUser === 'ivan' ? 'Ivan' : 'Angge';
    const otherUser = currentUser === 'ivan' ? 'Angge' : 'Ivan';
    
    // Find hugs from the other user
    const otherUserHugs = hugs.filter(hug => hug.sender === otherUser);
    
    if (otherUserHugs.length > 0) {
      // Show the most recent hug
      const latestHug = otherUserHugs[otherUserHugs.length - 1];
      console.log('Showing incoming hug from:', latestHug.sender);
      showHugModal(latestHug.sender);
    }
  } catch (error) {
    console.error('Error checking incoming hugs:', error);
  }
}

// Poll for incoming hugs every 2 seconds
function startHugPolling() {
  setInterval(checkForIncomingHugs, 2000);
}

async function sendHug() {
  try {
    sendHugBtn.disabled = true;
    setStatus('Sending a hug...');
    console.log('Sending hug from user:', currentUser);
    
    // Show success modal for sender
    const recipientName = currentUser === 'ivan' ? 'Angge' : 'Ivan';
    console.log('Showing success modal for:', recipientName);
    showSuccessModal(recipientName);
    
    // Send hug via API
    try {
      const senderName = currentUser === 'ivan' ? 'Ivan' : 'Angge';
      await fetch('/api/hug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: senderName }),
      });
      console.log('Hug sent via API');
    } catch (apiError) {
      console.error('API error:', apiError);
      // Continue anyway - success modal already shown
    }
    
    setStatus(''); // Clear status
    
  } catch (err) {
    console.log('Send hug error:', err);
    setStatus('Error: ' + (err && err.message ? err.message : String(err)));
  } finally {
    sendHugBtn.disabled = false;
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setStatus('Service workers are not supported on this browser.');
    return null;
  }
  const reg = await navigator.serviceWorker.register('/sw.js');
  
  // Check for updates every 30 seconds
  setInterval(async () => {
    await reg.update();
  }, 30000);
  
  // Listen for controlling changes
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available, reload the page
        window.location.reload();
      }
    });
  });
  
  return reg;
}

async function requestPermission() {
  if (!('Notification' in window)) {
    setStatus('Notifications are not supported on this device.');
    return 'denied';
  }
  const p = await Notification.requestPermission();
  return p;
}

async function getVapidPublicKey() {
  const res = await fetch('/api/vapidPublicKey');
  if (!res.ok) throw new Error('Failed to fetch VAPID public key');
  const data = await res.json();
  return data.key;
}

function urlBase64ToUint8Array(base64String) {
  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Error decoding VAPID key:', error);
    // Return a mock array for testing purposes
    return new Uint8Array([4, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197, 211, 31, 197]);
  }
}

async function subscribeUser(reg) {
  try {
    const appServerKey = await getVapidPublicKey();
    console.log('VAPID key received:', appServerKey);
    
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(appServerKey),
    });
    return sub;
  } catch (error) {
    console.error('Push subscription failed:', error);
    throw error; // Don't use mock subscription for real deployment
  }
}

async function saveSubscription({ name, birthday, subscription }) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, birthday, subscription, userId: currentUser }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Failed to register subscription');
  }
  return await res.json();
}

async function enableNotificationsFlow() {
  try {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    if (permission !== 'granted') {
      setStatus('Notification permission denied. Please enable in browser settings.');
      return;
    }
    console.log('Permission granted, registering service worker...');
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker ready:', registration);
    console.log('Fetching VAPID public key...');
    const res = await fetch('/vapid-key.json');
    if (!res.ok) {
      throw new Error('Failed to fetch VAPID public key');
    }
    const data = await res.json();
    console.log('VAPID response:', data);
    const vapidPublicKey = data.key;
    console.log('Subscribing to push...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    console.log('Push subscription created:', subscription);
    console.log('Sending subscription to server...');
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, userId: currentUser }),
    });
    console.log('Subscription saved to server');
    setStatus('Notifications enabled! 🎉');
    showDashboard();
  } catch (err) {
    console.error('Enable notifications error:', err);
    setStatus('Error: ' + (err && err.message ? err.message : String(err)));
  }
}

function showDashboard() {
  if (loginSection) loginSection.style.display = 'none';
  if (setupSection) setupSection.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';
  if (dashboardHeading) {
    const name = currentUser === 'ivan' ? 'Ivan' : 'Angge';
    dashboardHeading.textContent = `Hi ${name}!`;
  }
}

function showSetup() {
  if (loginSection) loginSection.style.display = 'none';
  if (setupSection) setupSection.style.display = 'block';
  if (dashboard) dashboard.style.display = 'none';
}

function showLogin() {
  if (loginSection) loginSection.style.display = 'block';
  if (setupSection) setupSection.style.display = 'none';
  if (dashboard) dashboard.style.display = 'none';
  setStatus('');
}

function hideLogin() {
  if (loginSection) loginSection.style.display = 'none';
}

function hideSetup() {
  if (setupSection) setupSection.style.display = 'none';
}

function hideDashboard() {
  if (dashboard) dashboard.style.display = 'none';
}

function showPrivateAccessMessage() {
  hideLogin();
  hideSetup();
  hideDashboard();
  
  // Create private access message
  const privateSection = document.getElementById('private-section') || createPrivateSection();
  privateSection.style.display = 'block';
}

function createPrivateSection() {
  const section = document.createElement('section');
  section.id = 'private-section';
  section.className = 'container';
  section.innerHTML = `
    <div class="private-content">
      <div class="private-icon">🔒</div>
      <h1>Private App</h1>
      <p>This is a private application intended only for Ivan and Angge.</p>
      <p>Access is restricted to registered users only.</p>
      <button class="btn btn-back" onclick="backToLogin()">Back to Login</button>
    </div>
  `;
  main.appendChild(section);
  return section;
}

function backToLogin() {
  const privateSection = document.getElementById('private-section');
  if (privateSection) {
    privateSection.hidden = true;
  }
  showLogin();
  setStatus('');
}

async function login(name) {
  const lowerName = name.toLowerCase();
  if (lowerName === 'ivan' || lowerName === 'angge') {
    currentUser = lowerName;
    saveUserSession(currentUser); // Save session
    loginBtn.classList.add('shake');
    setTimeout(async () => {
      const notificationsEnabled = await checkNotificationsEnabled();
      if (notificationsEnabled) {
        showDashboard();
        // Notify service worker that user logged in
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'USER_LOGIN',
            userId: currentUser
          });
        }
        
        // Check for pending hugs (for local testing)
        const pendingHug = sessionStorage.getItem('pendingHug');
        if (pendingHug) {
          const hugData = JSON.parse(pendingHug);
          const timeDiff = Date.now() - hugData.timestamp;
          // Show if hug was sent within last 30 seconds
          if (timeDiff < 30000 && hugData.sender !== currentUser) {
            console.log('Showing pending hug from:', hugData.sender);
            showHugModal(hugData.sender);
            sessionStorage.removeItem('pendingHug'); // Clear after showing
          }
        }
      } else {
        showSetup();
      }
    }, 1000);
  } else {
    // Show private access message
    showPrivateAccessMessage();
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginBtn.disabled = true;
    const name = nameInput.value;
    await login(name);
    const lowerName = name.toLowerCase();
    if (lowerName !== 'ivan' && lowerName !== 'angge') {
      loginBtn.disabled = false;
    } else {
      // Re-enable after successful login for next time
      setTimeout(() => {
        loginBtn.disabled = false;
      }, 1500);
    }
  });
}

if (formEl) {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    enableBtn.disabled = true;
    await enableNotificationsFlow();
    enableBtn.disabled = false;
  });
}

if (sendHugBtn) {
  sendHugBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await sendHug();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    logout();
  });
}

// Listen for messages from service worker
navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('Received message from service worker:', event.data);
  if (event.data && event.data.type === 'HUG_RECEIVED') {
    console.log('Hug received event:', {
      sender: event.data.sender,
      targetUser: event.data.targetUser,
      currentUser: currentUser
    });
    // Only show modal if current user is the target (receiver), not the sender
    if (event.data.targetUser === currentUser) {
      console.log('Showing hug modal for receiver');
      showHugModal(event.data.sender);
    } else {
      console.log('Not showing modal - user is not the target');
    }
  }
});

// Modal close button
if (modalClose) {
  modalClose.addEventListener('click', hideHugModal);
}

// Close modal when clicking outside
if (hugModal) {
  hugModal.addEventListener('click', (e) => {
    if (e.target === hugModal) {
      hideHugModal();
    }
  });
}

async function main() {
  console.log('Main function starting...');
  
  // Hide loading state first
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
  
  // Check for app version and force update if needed
  try {
    const versionRes = await fetch('/api/version');
    const versionData = await versionRes.json();
    console.log('Server version:', versionData);
    
    if (versionData.forceUpdate) {
      console.log('Force update required, clearing cache and reloading...');
      // Clear everything and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      return;
    }
  } catch (error) {
    console.log('Version check failed, continuing...');
  }

  // Hide all sections initially to prevent flashing
  hideLogin();
  hideSetup();
  hideDashboard();
  
  console.log('Checking for valid session...');
  
  // Check for valid session first
  const savedUser = localStorage.getItem('currentUser');
  const hasValidSession = savedUser && (savedUser === 'ivan' || savedUser === 'angge');
  
  console.log('Saved user:', savedUser);
  console.log('Has valid session:', hasValidSession);
  
  // If no valid session, show private access message immediately
  if (!hasValidSession) {
    console.log('Showing private access message');
    showPrivateAccessMessage();
    return;
  }

  // Only proceed if we have a valid session
  currentUser = savedUser;
  console.log('Current user set to:', currentUser);

  try {
    const registration = await registerServiceWorker();
    if (registration) {
      await subscribeUser(registration);
    }
  } catch (err) {
    console.error('Service worker setup failed:', err);
    setStatus('Service worker setup failed: ' + err.message);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginBtn.disabled = true;
      const name = nameInput.value;
      await login(name);
      const lowerName = name.toLowerCase();
      if (lowerName === 'ivan' || lowerName === 'angge') {
        setTimeout(() => {
          loginBtn.disabled = false;
        }, 1000);
      } else {
        setTimeout(() => {
          loginBtn.disabled = false;
        }, 1000);
      }
    });
  }

  if (enableBtn) {
    enableBtn.addEventListener('click', enableNotificationsFlow);
  }

  if (sendHugBtn) {
    sendHugBtn.addEventListener('click', sendHug);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Received message from service worker:', event.data);
    if (event.data && event.data.type === 'HUG_RECEIVED') {
      console.log('Hug received event:', {
        sender: event.data.sender,
        targetUser: event.data.targetUser,
        currentUser: currentUser
      });
      // Only show modal if current user is the target (receiver), not the sender
      if (event.data.targetUser === currentUser) {
        console.log('Showing hug modal for receiver');
        showHugModal(event.data.sender);
      } else {
        console.log('Not showing modal - user is not the target');
      }
    }
  });

  // Modal close button
  if (modalClose) {
    modalClose.addEventListener('click', hideHugModal);
  }

  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === hugModal) {
      hideHugModal();
    }
    if (event.target === successModal) {
      hideSuccessModal();
    }
  });

  // Show appropriate screen for valid user
  const notificationsEnabled = await checkNotificationsEnabled();
  if (notificationsEnabled) {
    showDashboard();
  } else {
    showSetup();
  }
  
  // Start polling for incoming hugs
  startHugPolling();
  
  // Add manual refresh for debugging (remove in production)
  if (window.location.hostname === 'localhost') {
    window.forceRefresh = () => {
      console.log('Force refreshing app...');
      localStorage.clear();
      caches.keys().then(keys => {
        Promise.all(keys.map(key => caches.delete(key)));
      }).then(() => {
        window.location.reload();
      });
    };
    console.log('Debug mode: Call forceRefresh() to clear cache and reload');
  }
}

main();

