function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}
let sessionId = generateSessionId();

/** Returns the message string with URLs replaced by HTML previews */
function urlify(text) {
    // Find all URLs in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => {
        // YouTube preview (for demonstration)
        if (url.match(/https?:\/\/(www\.)?youtube\.com\/watch\?v=([-\w]+)/) || url.match(/https?:\/\/youtu\.be\/([-\w]+)/)) {
            let videoId = '';
            let match = url.match(/v=([-\w]+)/);
            if (match) videoId = match[1];
            match = url.match(/youtu\.be\/([-\w]+)/);
            if (match) videoId = match[1];
            if (videoId) {
                return `<div class="url-preview">
                    <a href="${url}" target="_blank">${url}</a>
                    <iframe width="250" height="140" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>`;
            }
        }
        // Generic link preview with favicon
        let urlObj;
        try { urlObj = new URL(url); } catch { return `<a href="${url}" target="_blank">${url}</a>`; }
        let favicon = urlObj.origin + '/favicon.ico';
        return `<div class="url-preview">
            <a href="${url}" target="_blank">
                <img src="${favicon}" class="favicon" onerror="this.style.display='none'" />
                ${url}
            </a>
        </div>`;
    });
}

function addMessage(msg, sender, delay=0) {
    let chatbox = document.getElementById('chatbox');

    // Create bubble
    let bubble = document.createElement('div');
    bubble.className = `bubble ${sender}`;

    // Avatar
    let avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user'
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-robot"></i>';

    // Message text
    let message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = urlify(msg);

    // Assemble
    bubble.appendChild(avatar);
    bubble.appendChild(message);

    setTimeout(() => {
        chatbox.appendChild(bubble);
        bubble.style.opacity = 0;
        setTimeout(() => {
            bubble.style.opacity = 1;
        }, 10);
        chatbox.scrollTop = chatbox.scrollHeight;
    }, delay);
}

function addLoadingBubble() {
    let chatbox = document.getElementById('chatbox');
    let bubble = document.createElement('div');
    bubble.className = 'bubble bot loading';
    let avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    let message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = '<span class="dot-flashing"></span> Charlie is typing...';
    bubble.appendChild(avatar);
    bubble.appendChild(message);
    chatbox.appendChild(bubble);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeLoadingBubble() {
    let chatbox = document.getElementById('chatbox');
    let bubbles = chatbox.getElementsByClassName('loading');
    if (bubbles.length) {
        chatbox.removeChild(bubbles[0]);
    }
}

// Typing indicator animation (CSS-injected)
if (!document.getElementById('dot-flashing-style')) {
    let style = document.createElement('style');
    style.id = 'dot-flashing-style';
    style.innerHTML = `
    .dot-flashing {
      position: relative;
      width: 1em;
      height: 1em;
      margin-right: 10px;
      display: inline-block;
    }
    .dot-flashing:before, .dot-flashing:after, .dot-flashing {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      width: .25em;
      height: .25em;
      border-radius: 50%;
      background: #2563eb;
      animation: dotFlashing 1s infinite linear alternate;
    }
    .dot-flashing {
      left: 0;
      animation-delay: 0s;
    }
    .dot-flashing:before {
      left: .35em;
      animation-delay: .2s;
    }
    .dot-flashing:after {
      left: .7em;
      animation-delay: .4s;
    }
    @keyframes dotFlashing {
      0% { opacity: 0.4; }
      50%, 100% { opacity: 1; }
    }
    `;
    document.head.appendChild(style);
}

async function sendMessage() {
    let userInput = document.getElementById('userInput');
    let msg = userInput.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    userInput.value = '';
    userInput.style.height = 'auto'; // Reset height after sending
    userInput.focus();

    // Toggle state
    let considerHistory = document.getElementById('historyToggle').checked;

    // Add "typing" loading bubble
    addLoadingBubble();

    try {
        let res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ 
                message: msg, 
                session_id: sessionId,
                consider_history: considerHistory
            })
        });
        let data = await res.json();
        // Remove loading, then show bot response with a tiny delay for realism
        removeLoadingBubble();
        setTimeout(() => addMessage(data.answer, 'bot'), 250);
    } catch (e) {
        removeLoadingBubble();
        setTimeout(() => addMessage("Sorry, there was a connection error.", 'bot'), 250);
    }
}

// Widget open/close, fullscreen logic
function openWidget() {
    document.getElementById('chat-root').classList.remove('widget-hidden');
    document.getElementById('chat-fab').style.display = 'none';
    // Focus input after opening
    setTimeout(() => { document.getElementById('userInput').focus(); }, 200);
}
function closeWidget() {
    document.getElementById('chat-root').classList.add('widget-hidden');
    document.getElementById('chat-fab').style.display = 'flex';
}
function toggleFullscreen() {
    let chatRoot = document.getElementById('chat-root');
    let btn = document.getElementById('fullscreen-toggle').querySelector('i');
    chatRoot.classList.toggle('fullscreen');
    // Switch icon
    if (chatRoot.classList.contains('fullscreen')) {
        btn.classList.remove('fa-expand');
        btn.classList.add('fa-compress');
    } else {
        btn.classList.remove('fa-compress');
        btn.classList.add('fa-expand');
    }
    // Focus input after toggling
    setTimeout(() => { document.getElementById('userInput').focus(); }, 300);
}

// Add greeting on widget open only ONCE per session
let greeted = false;
function greetIfNeeded() {
    if (!greeted) {
        addMessage(
            "Hello! I am Charlie. I am the official chatbot of The Open University of Sri Lanka. How may I assist you?",
            'bot'
        );
        greeted = true;
    }
}

// --- Multiline and auto-expand logic ---
const textarea = document.getElementById('userInput');
textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Event listeners
document.getElementById('chat-fab').addEventListener('click', function() {
    openWidget();
    greetIfNeeded();
});
document.getElementById('close-widget-btn').addEventListener('click', closeWidget);
document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullscreen);
document.getElementById('sendBtn').addEventListener('click', sendMessage);

// On page load, keep widget hidden and fab visible
window.onload = function() {
    closeWidget();
};