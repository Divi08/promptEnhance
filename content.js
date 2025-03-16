
// Add debug logging
console.log('ChatGPT Prompt Enhancer: Script started');

function addPromptButtons() {
    console.log('Attempting to add buttons...');
    
    // Try different selectors to find the textarea container
    // ChatGPT's interface changes frequently, so we need to be adaptable
    const selectors = [
        'form div:has(textarea)',
        'div:has(> textarea)',
        'form:has(textarea) > div',
        'form textarea',
        'textarea[placeholder="Send a message"]'
    ];
    
    let textareaElement = null;
    let containerElement = null;
    
    // Try to find the textarea first
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Found element with selector: ${selector}`);
            
            if (element.tagName === 'TEXTAREA') {
                textareaElement = element;
                containerElement = element.closest('div');
                break;
            } else {
                containerElement = element;
                textareaElement = element.querySelector('textarea');
                if (textareaElement) break;
            }
        }
    }
    
    if (!containerElement || !textareaElement) {
        console.log('Textarea container not found, retrying in 1s...');
        setTimeout(addPromptButtons, 1000);
        return;
    }
    
    // Find a suitable parent element to insert our buttons before the textarea
    let buttonTarget = containerElement;
    while (buttonTarget && 
           buttonTarget.tagName !== 'FORM' && 
           !buttonTarget.classList.contains('stretch')) {
        buttonTarget = buttonTarget.parentElement;
    }
    
    if (!buttonTarget) {
        buttonTarget = containerElement;
    }
    
    // Check if buttons already exist
    if (document.querySelector('.prompt-enhance-buttons')) {
        console.log('Buttons already exist');
        return;
    }

    console.log('Creating buttons...');

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'prompt-enhance-buttons';

    const buttons = [
        { text: '🎯 Improve', action: 'improve', tooltip: 'Make this prompt more effective' },
        { text: '🔍 Expand', action: 'expand', tooltip: 'Add more details to this prompt' },
        { text: '📝 Simplify', action: 'simplify', tooltip: 'Make this prompt clearer and more concise' }
    ];

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.type = 'button'; // Prevent form submission
        btn.title = button.tooltip;
        btn.dataset.action = button.action;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const textarea = document.querySelector('textarea');
            if (!textarea || !textarea.value.trim()) {
                showFloatingNotification('Please enter a prompt first');
                return;
            }
            enhancePromptWithGemini(button.action, textarea.value);
        });
        buttonContainer.appendChild(btn);
    });

    // Insert the buttons before the textarea container
    try {
        buttonTarget.parentElement.insertBefore(buttonContainer, buttonTarget);
        console.log('Buttons added successfully');
    } catch (error) {
        console.error('Error inserting buttons:', error);
        // Fallback: append to body if we can't insert at the right place
        if (containerElement) {
            containerElement.parentElement.insertBefore(buttonContainer, containerElement);
            console.log('Buttons added using fallback method');
        }
    }
}

// Function to show floating notification
function showFloatingNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'prompt-enhance-notification';
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.5s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2000);
}

// Function to enhance the prompt using Gemini API
async function enhancePromptWithGemini(action, currentPrompt) {
    showFloatingNotification('Enhancing prompt...');
    
    let promptInstruction;
    switch (action) {
        case 'improve':
            promptInstruction = 'Improve this prompt to be more effective and clear:';
            break;
        case 'expand':
            promptInstruction = 'Expand this prompt with more details, specificity, and parameters:';
            break;
        case 'simplify':
            promptInstruction = 'Simplify this prompt while maintaining its core intent:';
            break;
        default:
            promptInstruction = 'Enhance this prompt:';
    }
    
    try {
        // Send message to background script to handle API call
        chrome.runtime.sendMessage({
            action: "enhancePrompt",
            promptType: promptInstruction,
            text: currentPrompt
        }, response => {
            if (response && response.success) {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                    textarea.value = response.enhancedPrompt;
                    textarea.focus();
                    
                    // Trigger React's input handlers
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    showFloatingNotification('Prompt enhanced!');
                }
            } else {
                showFloatingNotification('Error enhancing prompt. Please try again.');
                console.error('Error from background script:', response?.error);
            }
        });
    } catch (error) {
        console.error('Error sending message to background script:', error);
        showFloatingNotification('Error enhancing prompt. Please try again.');
    }
}

// Handle selected text from context menu
function handleSelectedText(selectedText) {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    // More structured prompt for Gemini
    const enhancementPrompt = `Please enhance and optimize this text for better results, maintaining its original intent: ${selectedText}`;
    
    textarea.value = enhancementPrompt;
    textarea.focus();

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enhanceSelectedText") {
        handleSelectedText(request.text);
    }
});

// Run our setup process immediately and also on DOM content loaded
document.addEventListener('D`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.OMContentLoaded', attemptSetup);
attemptSetup();

// Also attempt to add buttons on any textarea focus
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'TEXTAREA') {
        console.log('Textarea focused, checking for buttons');
        if (!document.querySelector('.prompt-enhance-buttons')) {
            addPromptButtons();
        }
    }
});

// Initial setup
let setupAttempts = 0;
const maxAttempts = 20;

function attemptSetup() {
    if (setupAttempts >= maxAttempts) {
        console.log('Max setsssssup attempts reached');
        return;
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        addPromptButtons();
    } else {
        setupAttempts++;
        setTimeout(attemdwqeptSetup, 1000);
    }
}

// Watch for navigation changes (for SPA navigation)
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            if (!document.querySelector('.prompt-enhance-buttons')) {
                addPromptButtons();
            }
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Add buttons when clicking on any text areas that might appear
setInterval(() => {
    if (!document.querySelector('.prompt-enhance-buttons')) {
        addPromptButtons();
    }
}, 3000);