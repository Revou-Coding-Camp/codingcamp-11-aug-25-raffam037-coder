// app.js (refactored)
let visitorName = '';
let messages = [];

// ---------- Utilities ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function debounce(fn, wait = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function safeGet(elementId) {
  return document.getElementById(elementId) || null;
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  const modal = safeGet('nameModal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.animation = 'modalSlide 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      }
    }, 100);
  }

  initializeNavigation();
  initializeScrollEffects();
  initializeMessageForm();
  initializeAnimations();

  // ensure some sections visible if present
  ['home', 'profile', 'portfolio', 'message'].forEach(id => {
    const s = safeGet(id);
    if (s) s.style.opacity = '1';
  });
});

// ---------- Name modal ----------
function submitName() {
  const nameInput = safeGet('visitorName');
  if (!nameInput) return;

  const name = nameInput.value.trim();
  if (name === '') {
    nameInput.style.animation = 'shake 0.5s ease-in-out';
    nameInput.style.borderColor = '#ff6b6b';
    nameInput.focus();
    setTimeout(() => {
      nameInput.style.animation = '';
      nameInput.style.borderColor = '';
    }, 500);
    showNotification('❌ Silakan masukkan nama Anda terlebih dahulu!', 'error');
    return;
  }

  visitorName = name;
  const welcomeText = safeGet('welcomeText');
  if (welcomeText) {
    welcomeText.textContent = `Hi ${visitorName}, Welcome To My Portfolio`;
  }

  const modal = safeGet('nameModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
      modal.style.display = 'none';
      showNotification(`🎉 Selamat datang ${visitorName}! Selamat menjelajahi portfolio saya.`, 'success');
    }, 500);
  }
}

// ---------- Navigation ----------
function initializeNavigation() {
  const navLinks = $$('.nav-link');
  const header = $('header');

  // click handler (smooth scroll + active)
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const targetId = href.substring(1);
      const targetSection = safeGet(targetId);
      if (!targetSection) return;

      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetSection.offsetTop - headerHeight - 20;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  // highlight on scroll (debounced)
  const sections = $$('section');
  const onScroll = debounce(() => {
    const scrollPos = window.scrollY + (header ? header.offsetHeight : 150);
    for (const section of sections) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (id && scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
        break;
      }
    }
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------- Scroll effects & intersection ----------
function initializeScrollEffects() {
  const header = $('header');

  const onScrollHeader = debounce(() => {
    if (!header) return;
    const scrollY = window.scrollY;
    if (scrollY > 100) {
      header.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)';
      header.style.backdropFilter = 'blur(15px)';
    } else {
      header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      header.style.backdropFilter = 'blur(10px)';
    }
  }, 60);

  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const elems = $$(
    '.portfolio-item, .profile-text, .profile-image'
  );

  elems.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
}

// ---------- Messages form ----------
function initializeMessageForm() {
  const messageForm = safeGet('messageForm');
  if (!messageForm) return;

  messageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.innerHTML = '⏳ Mengirim...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;
    }

    // simulate sending
    setTimeout(() => {
      const formData = new FormData(this);
      const messageData = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        birthdate: formatDate(formData.get('birthdate')),
        gender: (formData.get('gender') || '').trim(),
        message: formData.get('message') || '',
        timestamp: new Date().toLocaleString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      messages.unshift(messageData);
      displayMessages();
      this.reset();

      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.style.opacity = '';
        submitBtn.disabled = false;
      }

      showNotification('✅ Pesan berhasil dikirim! Terima kasih atas pesan Anda.', 'success');

      const messagesContainer = safeGet('messagesContainer');
      if (messagesContainer) messagesContainer.scrollTop = 0;
    }, 900);
  });

  // display initial state
  displayMessages();
}

function validateForm() {
  const nameEl = safeGet('name'), phoneEl = safeGet('phone'), birthEl = safeGet('birthdate'), msgEl = safeGet('messageText');
  if (!nameEl || !phoneEl || !birthEl || !msgEl) {
    showNotification('Form tidak lengkap pada DOM.', 'error');
    return false;
  }

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const birthdate = birthEl.value;
  const gender = document.querySelector('input[name="gender"]:checked');
  const message = msgEl.value.trim();

  if (name === '') {
    showNotification('❌ Nama harus diisi!', 'error'); nameEl.focus(); return false;
  }
  if (phone === '') {
    showNotification('❌ Nomor telepon harus diisi!', 'error'); phoneEl.focus(); return false;
  }
  if (birthdate === '') {
    showNotification('❌ Tanggal lahir harus diisi!', 'error'); birthEl.focus(); return false;
  }
  if (!gender) {
    showNotification('❌ Jenis kelamin harus dipilih!', 'error'); return false;
  }
  if (message === '') {
    showNotification('❌ Pesan harus diisi!', 'error'); msgEl.focus(); return false;
  }
  if (!isValidPhoneNumber(phone)) {
    showNotification('❌ Format nomor telepon tidak valid!', 'error'); phoneEl.focus(); return false;
  }
  return true;
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9+\-\s\(\)]{6,20}$/; // lebih toleran
  return phoneRegex.test(phone);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.valueOf())) return dateString; // fallback
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

// ---------- Display messages (safe DOM creation) ----------
function createMessageElement(msg, index = 0) {
  const item = document.createElement('div');
  item.className = 'message-item';
  item.style.animationDelay = `${index * 0.08}s`;

  const header = document.createElement('div');
  header.className = 'message-header';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  const genderText = (msg.gender || '').toLowerCase();
  if (genderText === 'laki-laki' || genderText === 'male') avatar.textContent = '👨';
  else if (genderText === 'perempuan' || genderText === 'female') avatar.textContent = '👩';
  else avatar.textContent = '🧑';

  const info = document.createElement('div');
  info.className = 'message-info';

  const nameEl = document.createElement('strong');
  nameEl.className = 'message-name';
  nameEl.textContent = msg.name || 'Pengirim';

  const details = document.createElement('div');
  details.className = 'message-details';
  const phoneSpan = document.createElement('span');
  phoneSpan.innerHTML = `<strong>📞</strong> ${escapeHTML(msg.phone || '-')}`;
  const birthSpan = document.createElement('span');
  birthSpan.innerHTML = `<strong>🎂</strong> ${escapeHTML(msg.birthdate || '-')}`;

  details.appendChild(phoneSpan);
  details.appendChild(birthSpan);

  info.appendChild(nameEl);
  info.appendChild(details);

  header.appendChild(avatar);
  header.appendChild(info);

  const content = document.createElement('div');
  content.className = 'message-content';
  const label = document.createElement('strong');
  label.textContent = '💭 Pesan:';
  const messageText = document.createElement('div');
  messageText.className = 'message-text';
  messageText.textContent = msg.message || '';

  content.appendChild(label);
  content.appendChild(messageText);

  const ts = document.createElement('div');
  ts.className = 'message-timestamp';
  ts.textContent = `⏰ ${msg.timestamp || ''}`;

  item.appendChild(header);
  item.appendChild(content);
  item.appendChild(ts);

  return item;
}

function displayMessages() {
  const container = safeGet('messagesContainer');
  if (!container) return;

  // clear
  container.innerHTML = '';

  if (!messages || messages.length === 0) {
    const noDiv = document.createElement('div');
    noDiv.className = 'no-messages';
    noDiv.innerHTML = `
      <div class="no-messages-icon">📬</div>
      <p>Belum ada pesan yang masuk.</p>
      <p>Jadilah yang pertama mengirim pesan!</p>
    `;
    container.appendChild(noDiv);
    return;
  }

  messages.forEach((msg, idx) => {
    const el = createMessageElement(msg, idx);
    container.appendChild(el);
  });
}

// ---------- Notifications ----------
function showNotification(message, type = 'success') {
  // remove existing notifications
  $$('.notification').forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.textContent = message;

  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)';
  }

  document.body.appendChild(notification);

  // auto-dismiss
  setTimeout(() => {
    if (!document.body.contains(notification)) return;
    notification.style.animation = 'slideOutToRight 0.5s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 4000);
}

// ---------- Small UI animations & event bindings ----------
function initializeAnimations() {
  const visitorInput = safeGet('visitorName');
  if (visitorInput) {
    visitorInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitName();
    });
  }

  // portfolio hover (delegation-friendly)
  $$('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    item.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // iframe fade-in
  $$('iframe').forEach(frame => {
    frame.style.opacity = '0';
    frame.style.transition = 'opacity 0.5s ease-in-out';
    frame.addEventListener('load', () => (frame.style.opacity = '1'));
  });

  // CTA button smooth scroll
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const targetId = href.substring(1);
      const targetSection = safeGet(targetId);
      if (!targetSection) return;
      const headerHeight = $('header') ? $('header').offsetHeight : 0;
      const targetPosition = targetSection.offsetTop - headerHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  }
}
