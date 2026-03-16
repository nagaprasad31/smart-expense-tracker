document.addEventListener('DOMContentLoaded', function () {
    setupChatbot();
});

function setupChatbot() {
    // const chatbotToggle = document.getElementById('chatbotToggle'); // Removed
    const chatbotFloatingBtn = document.getElementById('chatbotFloatingBtn');
    const chatbot = document.getElementById('chatbot');
    const closeChatbot = document.getElementById('closeChatbot');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendChatMessage');

    if (!chatbotFloatingBtn || !chatbot) return;

    chatbotFloatingBtn.addEventListener('click', () => {
        chatbot.classList.toggle('hidden');
        if (!chatbot.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    closeChatbot.addEventListener('click', () => {
        chatbot.classList.add('hidden');
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    sendButton.addEventListener('click', sendChatMessage);

    // Add some sample prompts
    addSamplePrompts();
}

function addSamplePrompts() {
    const messagesContainer = document.getElementById('chatMessages');

    const samplePromptsDiv = document.createElement('div');
    samplePromptsDiv.className = 'sample-prompts';
    samplePromptsDiv.innerHTML = `
        <div class="message bot-message">
            <p>Try asking me:</p>
            <div class="prompt-buttons">
                <button class="prompt-btn" onclick="askPrompt('What is my current balance?')">My Balance</button>
                <button class="prompt-btn" onclick="askPrompt('Total spending on Food?')">Food Spending</button>
                <button class="prompt-btn" onclick="askPrompt('Show my recent expenses')">Recent Expenses</button>
            </div>
        </div>
    `;

    messagesContainer.appendChild(samplePromptsDiv);
}

// Make global so it can be called from onclick
window.askPrompt = async function (prompt) {
    document.getElementById('chatInput').value = prompt;
    await sendChatMessage();
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    addMessageToChat(message, 'user');
    chatInput.value = '';

    try {
        addTypingIndicator();

        const response = await ApiService.sendChatMessage(message);

        removeTypingIndicator();

        if (response.response) {
            addMessageToChat(response.response, 'bot');
        } else {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Chatbot error:', error);
        removeTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    // Simple HTML escaping for safety
    const safeMessage = message.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    messageDiv.innerHTML = safeMessage;

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    typingDiv.innerHTML = 'AI is typing...';

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
