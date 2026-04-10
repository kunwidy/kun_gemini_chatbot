// DOM Element selections
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// API Configuration
const API_URL = 'http://localhost:3000/api/chat';

/**
 * State management for the conversation history.
 * This matches the schema expected by the backend.
 */
let conversation = [];

/**
 * Helper to append messages to the chat box UI.
 * @param {string} role - 'user' or 'model'
 * @param {string} text - The message content
 * @returns {HTMLElement} - The created message div
 */
function appendMessageToUI(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}-message`;
  
  // Using textContent to prevent XSS
  const label = role === 'user' ? 'You' : 'AI';
  messageDiv.textContent = `${label}: ${text}`;
  
  chatBox.appendChild(messageDiv);
  
  // Auto-scroll to the latest message
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return messageDiv;
}

/**
 * Handles the form submission logic
 */
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // 1. Clear input and update UI for User
  userInput.value = '';
  appendMessageToUI('user', text);

  // 2. Update local state
  conversation.push({ role: 'user', text });

  // 3. Show "Thinking..." placeholder
  const botMessageElement = appendMessageToUI('model', 'Thinking...');
  
  // Disable input while waiting for response
  const submitBtn = chatForm.querySelector('button');
  userInput.disabled = true;
  submitBtn.disabled = true;

  try {
    // 4. Send request to backend
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 5. Handle response
    if (data.result) {
      // Replace "Thinking..." with actual result
      botMessageElement.textContent = `AI: ${data.result}`;
      
      // Sync local state with the model's response
      conversation.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = 'AI: Sorry, no response received.';
    }

  } catch (error) {
    console.error('Fetch error:', error);
    botMessageElement.textContent = 'AI: Failed to get response from server.';
  } finally {
    // Re-enable inputs
    userInput.disabled = false;
    submitBtn.disabled = false;
    userInput.focus();
  }
});
