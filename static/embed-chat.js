(function() {
  // ---- Configurable ----
  const CHAT_ENDPOINT = "http://10.72.128.55:8000/chat"; // Change to your server endpoint if needed
  // http://10.72.128.55/
  // http://127.0.0.1/

  // ---- Inject CSS directly ----
  const widgetCSS = `
@import url('https://fonts.googleapis.com/css?family=Inter:400,600&display=swap');
#embed-chat-root {
    font-family: Inter;
}
.chat-fab {
    position: fixed;
    bottom: 26px;
    right: 26px;
    z-index: 1000;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #2563eb;
    color: #fff;
    border: none;
    box-shadow: 0 4px 22px rgba(36, 51, 99, 0.21);
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
}
.chat-fab:hover {
    background: #1741a7;
    box-shadow: 0 4px 16px rgba(36, 51, 99, 0.27);
}
.chat-root {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 1001;
    width: 370px;
    max-width: calc(100vw - 24px);
    min-width: 310px;
    max-height: 80vh;
    min-height: 480px;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 6px 32px 0 rgba(36, 51, 99, 0.17);
    display: flex;
    flex-direction: column;
    padding: 0 0 16px 0;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s, transform 0.3s, width 0.3s, height 0.3s, right 0.3s, bottom 0.3s;
    overflow: hidden;
}
.widget-hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(60px) scale(0.96);
}
.fullscreen {
    width: 100vw !important;
    height: 99vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    min-width: 0 !important;
    min-height: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    transition: all 0.4s cubic-bezier(.4,2,.6,1);
}
.chat-header {
    background: #2563eb;
    color: #fff;
    font-weight: 600;
    padding: 18px;
    border-radius: 18px 18px 0 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: 1px;
    position: relative;
}
.fullscreen .chat-header {
    border-radius: 0 0 0 0;
}
.chat-header .header-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 85%;
    gap: 6px;
}
.chat-header .header-left span{
    font-size: 1.1rem;
    color: #fff;
}
.chat-header .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 15%;
    gap: 5px;
}
.chat-header .header-right .fullscreen-toggle, .chat-header .header-right .close-widget-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    outline: none;
    padding: 0 7px;
    transition: color 0.16s;
}
.close-widget-btn {
    right: 12px;
}
.chat-header .header-right .fullscreen-toggle:hover, .chat-header .header-right .close-widget-btn:hover {
    color: #dbeafe;
}
.history-toggle {
    padding: 10px 18px;
}
.history-toggle label {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.98rem;
}
.history-toggle .toggle-label {
    margin-left: 4px;
}
.history-toggle .fa-history {
    color: #2563eb;
}
#chatbox, #embed-chatbox {
    flex: 1;
    overflow-y: auto;
    padding: 20px 18px 20px 18px;
    background: #f3f6fa;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 180px;
    max-height: 48vh;
    transition: max-height 0.3s;
}
.fullscreen #chatbox, .fullscreen #embed-chatbox {
    max-height: 74vh;
}
.bubble {
    display: flex;
    align-items: flex-end;
    margin-bottom: 2px;
    animation: fadeInUp 0.5s;
    opacity: 0;
    animation-fill-mode: forwards;
}
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(18px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
.bubble.user {
    flex-direction: row-reverse;
    justify-content: flex-start;
}
.bubble.bot {
    flex-direction: row;
    justify-content: flex-start;
}
.avatar {
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    min-width: 34px;
    min-height: 34px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.12rem;
    margin: 0 0.6rem;
    box-shadow: 0 2px 8px rgba(36, 51, 99, 0.03);
}
.bubble.user .avatar {
    background: #2563eb;
    color: #fff;
}
.bubble.bot .avatar {
    background: #f1f5f9;
    color: #2563eb;
}
.message {
    flex: 1 1 0%;
    background: #2563eb;
    color: #fff;
    padding: 12px 14px;
    border-radius: 16px 16px 4px 16px;
    max-width: 30vw;
    min-width: 40px;
    word-break: break-word;
    font-size: 1rem;
    box-shadow: 0 3px 14px 0 rgba(36, 51, 99, 0.07);
    transition: background 0.2s;
    white-space: pre-line;
}
.bubble.bot .message {
    background: #f1f5f9;
    color: #303d4d;
    border-radius: 16px 16px 16px 4px;
}
.bubble.loading .message {
    color: #93a3b7;
    font-style: italic;
    background: #e6ecf7;
    border: 1px dashed #c2d0e7;
}
.url-preview {
    margin-top: 6px;
    margin-bottom: 2px;
    background: #f6fafd;
    border-radius: 9px;
    padding: 5px 7px 5px 6px;
    display: inline-block;
    max-width: 95%;
    box-shadow: 0 1px 4px rgba(36,51,99,0.07);
}
.url-preview a {
    color: #2563eb;
    text-decoration: underline;
    font-size: 0.97em;
    word-break: break-all;
}
.url-preview .favicon {
    width: 18px;
    height: 18px;
    vertical-align: middle;
    margin-right: 5px;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(36,51,99,0.09);
    background: #fff;
}
.url-preview iframe {
    display: block;
    margin-top: 6px;
    border-radius: 7px;
    width: 100%;
    max-width: 250px;
    min-width: 180px;
}
.chat-input-area {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 18px 0 18px;
    margin-top: 6px;
    margin-bottom: 0;
}
#userInput, #embed-userInput {
    flex: 1;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid #e0e7ef;
    font-size: 1rem;
    outline: none;
    transition: border 0.2s;
    background: #f6fafd;
    min-height: 42px;
    max-height: 120px;
    resize: none;
    line-height: 1.5;
    overflow-y: auto;
}
#userInput:focus, #embed-userInput:focus {
    border: 1.5px solid #2563eb;
}
#sendBtn, #embed-sendBtn {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    font-size: 1.18rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.16s, transform 0.16s;
    box-shadow: 0 2px 8px rgba(36, 51, 99, 0.09);
}
#sendBtn:active, #embed-sendBtn:active {
    background: #1741a7;
    transform: scale(0.94);
}
@media (max-width: 700px) {
    .chat-root {
        right: 0;
        left: 0;
        width: 100vw !important;
        min-width: 0;
        max-width: 100vw !important;
        border-radius: 0 !important;
        box-shadow: none !important;
    }
    .chat-fab {
        right: 18px;
        bottom: 18px;
    }
    #chatbox, .fullscreen #chatbox, #embed-chatbox, .fullscreen #embed-chatbox {
        max-width: 98vw;
        min-width: 0;
        padding-right: 6px;
        padding-left: 6px;
    }
}
  `;
  function injectCSSDirect(cssText, id) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.type = "text/css";
    style.appendChild(document.createTextNode(cssText));
    document.head.appendChild(style);
  }
  injectCSSDirect(widgetCSS, "embed-chat-widget-css");

  // Inject FontAwesome (if not present)
  function injectFA(href, id) {
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.id = id;
    document.head.appendChild(link);
  }
  injectFA("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css", "embed-chat-fa-css");

  // ---- Widget HTML ----
  const widgetHTML = `
    <button id="embed-chat-fab" class="chat-fab" title="Chat with Charlie">
      <i class="fas fa-comments"></i>
    </button>
    <div id="embed-chat-root" class="chat-root widget-hidden">
      <div class="chat-header">
        <div class="header-left">
          <i class="fas fa-robot"></i>
          <span>Charlie - OUSL Chatbot</span>
        </div>
        <div class="header-right">
          <button id="embed-fullscreen-toggle" class="fullscreen-toggle" title="Toggle Fullscreen">
            <i class="fas fa-expand"></i>
          </button>
          <button id="embed-close-widget-btn" class="close-widget-btn" title="Close Chat">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="history-toggle">
        <label>
          <input type="checkbox" id="embed-historyToggle" />
          <span class="slider"></span>
          <span class="toggle-label"><i class="fas fa-history"></i> Consider chat history</span>
        </label>
      </div>
      <div id="embed-chatbox"></div>
      <div class="chat-input-area">
        <textarea id="embed-userInput" placeholder="What do you want to know?" autocomplete="off" rows="1"></textarea>
        <button id="embed-sendBtn" title="Send">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;

  // ---- Inject Widget ----
  let container = document.createElement("div");
  container.id = "embed-chat-container";
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // ---- Utility ----
  function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
  let sessionId = generateSessionId();

  // ---- Event Functions ----
  function urlify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => {
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
    let chatbox = document.getElementById('embed-chatbox');
    let bubble = document.createElement('div');
    bubble.className = `bubble ${sender}`;
    let avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user'
      ? '<i class="fas fa-user"></i>'
      : '<i class="fas fa-robot"></i>';
    let message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = urlify(msg);
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
    let chatbox = document.getElementById('embed-chatbox');
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
    let chatbox = document.getElementById('embed-chatbox');
    let bubbles = chatbox.getElementsByClassName('loading');
    if (bubbles.length) {
      chatbox.removeChild(bubbles[0]);
    }
  }

  // Typing indicator animation injection (only once)
  if (!document.getElementById('embed-dot-flashing-style')) {
    let style = document.createElement('style');
    style.id = 'embed-dot-flashing-style';
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
    let userInput = document.getElementById('embed-userInput');
    let msg = userInput.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    userInput.focus();

    let considerHistory = document.getElementById('embed-historyToggle').checked;
    addLoadingBubble();

    try {
      let res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ 
          message: msg, 
          session_id: sessionId,
          consider_history: considerHistory
        }),
        credentials: "same-origin"
      });
      let data = await res.json();
      removeLoadingBubble();
      setTimeout(() => addMessage(data.answer, 'bot'), 250);
    } catch (e) {
      removeLoadingBubble();
      setTimeout(() => addMessage("Sorry, there was a connection error.", 'bot'), 250);
    }
  }

  // Widget open/close, fullscreen logic
  function openWidget() {
    document.getElementById('embed-chat-root').classList.remove('widget-hidden');
    document.getElementById('embed-chat-fab').style.display = 'none';
    setTimeout(() => { document.getElementById('embed-userInput').focus(); }, 200);
  }
  function closeWidget() {
    document.getElementById('embed-chat-root').classList.add('widget-hidden');
    document.getElementById('embed-chat-fab').style.display = 'flex';
  }
  function toggleFullscreen() {
    let chatRoot = document.getElementById('embed-chat-root');
    let btn = document.getElementById('embed-fullscreen-toggle').querySelector('i');
    chatRoot.classList.toggle('fullscreen');
    if (chatRoot.classList.contains('fullscreen')) {
      btn.classList.remove('fa-expand');
      btn.classList.add('fa-compress');
    } else {
      btn.classList.remove('fa-compress');
      btn.classList.add('fa-expand');
    }
    setTimeout(() => { document.getElementById('embed-userInput').focus(); }, 300);
  }

  // Greeting only once per session
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
  const textarea = document.getElementById('embed-userInput');
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
  document.getElementById('embed-chat-fab').addEventListener('click', function() {
    openWidget();
    greetIfNeeded();
  });
  document.getElementById('embed-close-widget-btn').addEventListener('click', closeWidget);
  document.getElementById('embed-fullscreen-toggle').addEventListener('click', toggleFullscreen);
  document.getElementById('embed-sendBtn').addEventListener('click', sendMessage);

  // On page load, keep widget hidden and fab visible
  window.addEventListener("DOMContentLoaded", function() {
    closeWidget();
  });

  // ---- Prevent CORS issues ----
  // Assumes CHAT_ENDPOINT is on the same domain or served with proper CORS headers for production.
  // If you host on a different domain, ensure your server responds with:
  // Access-Control-Allow-Origin: *
  // or specific allowed origins.
})();