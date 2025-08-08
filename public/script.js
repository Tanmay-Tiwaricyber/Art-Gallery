// Helper functions
function setSessionId(id) { localStorage.setItem('sessionId', id); }
function getSessionId() { return localStorage.getItem('sessionId'); }
function getHeaders() {
  return { 'Content-Type': 'application/json', 'x-session-id': getSessionId() || '' };
}

// Auth (login)
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.sessionId) {
      setSessionId(data.sessionId);
      window.location = 'dashboard.html';
    } else {
      alert('Login failed');
    }
  };
}

// Dashboard
if (window.location.pathname.endsWith('dashboard.html')) {
  fetch('/api/dashboard', { headers: getHeaders() })
    .then(res => res.json())
    .then(data => {
      if (data.error) { window.location = 'index.html'; return; }
      document.getElementById('welcome').innerText = `Welcome, ${data.name}!`;
      document.getElementById('myImages').innerHTML = data.images.map(img =>
        `<img src="/uploads/${img.filename}" alt="art">`
      ).join('');
    });
}

// Public Gallery
if (window.location.pathname.endsWith('public.html')) {
  fetch('/api/public')
    .then(res => res.json())
    .then(images => {
      const gallery = document.getElementById('gallery');
      images.forEach(img => {
        const el = document.createElement('img');
        el.src = '/uploads/' + img.filename;
        el.alt = img.uploader;
        el.title = 'Uploaded by ' + img.uploader;
        gallery.appendChild(el);
      });
    });
}

// Upload
if (window.location.pathname.endsWith('upload.html')) {
  document.getElementById('uploadForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', document.getElementById('image').files[0]);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-session-id': getSessionId() || '' },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert('Image uploaded!');
      window.location = 'dashboard.html';
    } else {
      alert('Upload failed');
    }
  };
}

// Profile
if (window.location.pathname.endsWith('profile.html')) {
  fetch('/api/profile', { headers: getHeaders() })
    .then(res => res.json())
    .then(data => {
      if (data.error) { window.location = 'index.html'; return; }
      document.getElementById('profileName').innerText = data.name;
      document.getElementById('profileImages').innerHTML = data.images.map(img =>
        `<img src="/uploads/${img.filename}" alt="art">`
      ).join('');
    });
}