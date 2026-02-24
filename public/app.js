const statusEl = document.getElementById('status');
const formEl = document.getElementById('setup-form');
const enableBtn = document.getElementById('enable-btn');

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || '';
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setStatus('Service workers are not supported on this browser.');
    return null;
  }
  const reg = await navigator.serviceWorker.register('/sw.js');
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
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeUser(reg) {
  const appServerKey = await getVapidPublicKey();
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(appServerKey),
  });
  return sub;
}

async function saveSubscription({ name, birthday, subscription }) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, birthday, subscription }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Failed to register subscription');
  }
  return await res.json();
}

async function enableNotificationsFlow() {
  try {
    setStatus('Preparing...');
    const reg = await registerServiceWorker();
    if (!reg) return;
    setStatus('Requesting permission...');
    const perm = await requestPermission();
    if (perm !== 'granted') {
      setStatus('Permission denied.');
      return;
    }
    setStatus('Subscribing to push...');
    const sub = await subscribeUser(reg);
    const name = 'Angge';
    const birthday = '04-20';
    setStatus('Saving subscription...');
    await saveSubscription({ name, birthday, subscription: sub });
    setStatus('All set! You will receive daily reminders.');
  } catch (err) {
    setStatus('Error: ' + (err && err.message ? err.message : String(err)));
  }
}

if (formEl) {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    enableBtn.disabled = true;
    await enableNotificationsFlow();
    enableBtn.disabled = false;
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (!reg) return;
    if (Notification.permission === 'granted') {
      setStatus('Notifications are enabled.');
    }
  });
}

