
// ================== SPY AI CHAT - STEALTH MODE ==================
const API_URL = "http://localhost:7000/chat";

const spyHTML = `
<div id="spy-chat-container" style="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:2147483647; font-family: 'Courier New', monospace;">
    
    <!-- Trigger Indicator (sangat kecil & transparan) -->
    <div id="spy-trigger" style="position:fixed; bottom:15px; right:15px; color:#22c55e; font-size:13px; opacity:0.15; cursor:pointer; user-select:none; pointer-events:all;">
        ◉
    </div>

    <!-- Main Chat Window -->
    <div id="spy-window" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:420px; height:520px; 
        background:transparent; color:#a1a1aa; overflow:hidden; pointer-events:all;">

        <!-- Messages -->
        <div id="spy-messages" style="height:380px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:14px; font-size:14.5px; line-height:1.5;">
        </div>

        <!-- Typing -->
        <div id="spy-typing" style="display:none; padding:0 16px 10px; color:#a1a1aa; font-size:13px; opacity:0.7;">
            ▋ AGENT sedang menganalisis...
        </div>

        <!-- Input -->
        <div style="padding:12px 16px; background:transparent; ">
            <input id="spy-input" type="text" placeholder="...." spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"
                style="width:100%; color:#a1a1aa; background:transparent; padding:12px 16px; outline:none; font-family: inherit; border:none; outline:none; box-shadow:none; appearance:none; -webkit-appearance:none;">
        </div>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', spyHTML);

// Elements
const container = document.getElementById('spy-chat-container');
const trigger = document.getElementById('spy-trigger');
const windowEl = document.getElementById('spy-window');
const messagesEl = document.getElementById('spy-messages');
const input = document.getElementById('spy-input');
const typingEl = document.getElementById('spy-typing');
// const closeBtn = document.getElementById('spy-close');

const style = document.createElement("style");

style.textContent = `
#spy-messages{
    overflow-y:auto;
    scrollbar-width:none;
    -ms-overflow-style:none;
}
#spy-messages::-webkit-scrollbar{
    width:0;
    height:0;
    display:none;
}
`;

document.head.appendChild(style);

let isOpen = false;
let chatHistory = [];

// Toggle Window
function toggleSpyChat() {
    isOpen = !isOpen;
    windowEl.style.display = isOpen ? 'block' : 'none';
    if (isOpen) setTimeout(() => input.focus(), 100);
}

// Keyboard Control (Stealth)
document.addEventListener('keydown', (e) => {
    // Tekan Ctrl + Shift + S untuk buka/tutup
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleSpyChat();
    }
    
    // ESC untuk close
    if (e.key === 'Escape' && isOpen) {
        toggleSpyChat();
    }
});

// Click trigger (cadangan)
trigger.addEventListener('click', toggleSpyChat);
// closeBtn.addEventListener('click', toggleSpyChat);

// Add Message
function addMessage(text, isUser) {
    const msg = document.createElement('div');

    msg.style = isUser
        ? `align-self:flex-end; color:#d1d5db; max-width:80%;`
        : `align-self:flex-start; color:#d1d5db; max-width:85%; cursor:pointer;`;

    msg.innerHTML = `
        <span style="opacity:.85;">${text}</span>
        ${!isUser ? '<span class="copied" style="display:none;color:#a1a1aa;margin-left:8px;">Copied</span>' : ''}
    `;

    if (!isUser) {
        msg.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(text);

                const copied = msg.querySelector(".copied");
                copied.style.display = "inline";

                clearTimeout(copied.timer);
                copied.timer = setTimeout(() => {
                    copied.style.display = "none";
                }, 800);

            } catch (e) {
                console.error(e);
            }
        });
    }

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Show Typing
function showTyping() {
    typingEl.style.display = 'block';
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
    typingEl.style.display = 'none';
}

// Call Backend
async function sendToServer(message) {
    chatHistory.push({ role: "user", content: message });
    addMessage(message, true);
    input.value = '';
    showTyping();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: chatHistory })
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Error");

        const reply = data.reply;
        chatHistory.push({ role: "assistant", content: reply });
        
        hideTyping();
        addMessage(reply, false);

    } catch (err) {
        hideTyping();
        addMessage("Koneksi ke server terputus.", false);
        console.error(err);
    }
}

// Event Listeners
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const msg = input.value.trim();
        if (msg) sendToServer(msg);
    }
});

// Double click trigger = clear chat
trigger.addEventListener('dblclick', () => {
    if (confirm("Reset semua percakapan?")) {
        messagesEl.innerHTML = '';
        chatHistory = [];
    }
});

// Optional: Tampilkan pesan selamat datang pertama kali
setTimeout(() => {
    if (messagesEl.children.length === 0) {
        addMessage("Sistem siap. Agent menunggu instruksi.", false);
    }
}, 800);

document.addEventListener("click", async (e) => {
    const el = e.target.closest("p, span, div");
    if (!el) return;

    const text = el.innerText.trim();
    if (!text) return;

    e.preventDefault();
    e.stopPropagation();

    try {
        await navigator.clipboard.writeText(text);
        console.log("Copied:", text);
    } catch (err) {
        console.error(err);
    }
}, true);


