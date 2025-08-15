let visitorName = '';
let messages = [];

window.addEventListener('load', function() {
    document.getElementById('nameModal').style.display = 'flex';
});

function submitName() {
    const nameInput = document.getElementById('visitorName');
    const name = nameInput.value.trim();
    
    if (name === '') {
        alert('Silakan masukkan nama Anda terlebih dahulu!');
        return;
    }
    
    visitorName = name;
    document.getElementById('welcomeText').textContent = `Hi ${name}, Welcome To My Portofolio`;
    
    const modal = document.getElementById('nameModal');
    modal.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const messageData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        message: formData.get('message'),
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    messages.unshift(messageData);
    displayMessages();
    this.reset();
    showSuccessMessage();
});

function displayMessages() {
    const container = document.getElementById('messagesContainer');
    
    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Belum ada pesan yang dikirim.</p>';
        return;
    }
    
    let messagesHTML = '';
    messages.forEach((msg, index) => {
        messagesHTML += `
            <div class="message-item" style="animation-delay: ${index * 0.1}s">
                <strong>Contact Info:</strong> ${msg.timestamp}<br>
                <strong>Nama:</strong> ${msg.name}<br>
                <strong>No. Telp:</strong> ${msg.phone}<br>
                <strong>Jenis Kelamin:</strong> ${msg.gender}<br>
                <strong>Pesan:</strong> ${msg.message}
            </div>
        `;
    });
    
    container.innerHTML = messagesHTML;
}

function showSuccessMessage() {
    const notification = document.createElement('div');
    notification.innerHTML = '✅ Pesan berhasil dikirim!';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.5s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

document.getElementById('visitorName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitName();
    }
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});