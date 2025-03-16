console.log("ChatGPT Prompt Enhancer: Content script starting on:", window.location.href);

function isValidChatGPTPage() {
    // Check if we're on a valid ChatGPT page
    return window.location.hostname === 'chat.openai.com' || 
           window.location.hostname === 'chatgpt.com';
}

// Debounce function to limit frequent executions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create a draggable floating bubble with options - runs immediately
(function() {
    if (!isValidChatGPTPage()) {
        console.log("ChatGPT Prompt Enhancer: Not a valid ChatGPT page");
        return;
    }

    console.log("ChatGPT Prompt Enhancer: Starting content script");
    
    let initialized = false;
    const maxInitAttempts = 10;
    let initializeAttempt = 0;

    // Debounced textarea finder
    const debouncedFindTextArea = debounce(() => {
        const textarea = findTextArea();
        if (textarea && !document.getElementById('enhance-prompt-btn')) {
            createEnhanceButton();
        }
    }, 250);

    function attemptInitialization() {
        if (initialized) return;
        
        initializeAttempt++;
        console.log(`ChatGPT Prompt Enhancer: Initialization attempt ${initializeAttempt}`);

        const mainContent = document.querySelector('main') || document.querySelector('.chat');
        if (!mainContent) {
            if (initializeAttempt < maxInitAttempts) {
                setTimeout(attemptInitialization, 1000);
            }
            return;
        }

        if (!document.getElementById('prompt-enhance-bubble')) {
            createFloatingBubble();
        }

        const textarea = findTextArea();
        if (textarea) {
            createEnhanceButton();
            initialized = true;
        } else if (initializeAttempt < maxInitAttempts) {
            setTimeout(attemptInitialization, 1000);
        }
    }

    // Start initialization
    attemptInitialization();

    // Modified mutation observer
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length || 
                (mutation.type === 'attributes' && mutation.target.tagName === 'TEXTAREA')) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            debouncedFindTextArea();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
})();

function createFloatingBubble() {
    // Check if bubble already exists
    if (document.getElementById('prompt-enhance-bubble')) {
        console.log("ChatGPT Prompt Enhancer: Bubble already exists");
        return;
    }
    
    console.log("ChatGPT Prompt Enhancer: Creating floating bubble");
    
    // Create the main bubble
    const bubble = document.createElement('div');
    bubble.id = 'prompt-enhance-bubble';
    bubble.className = 'prompt-enhance-bubble';
    bubble.innerHTML = '<span>+</span>';
    bubble.title = 'Prompt Enhancer';
    
    // Create options container (initially hidden)
    const options = document.createElement('div');
    options.id = 'prompt-enhance-options';
    options.className = 'prompt-enhance-options';
    options.style.display = 'none';
    
    // Create three buttons
    const buttons = [
        { id: 'enhance-button', text: 'Enhance Prompt', icon: '✨' },
        { id: 'formal-button', text: 'Make Formal', icon: '📝' },
        { id: 'clarify-button', text: 'Clarify Intent', icon: '🔍' }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.innerHTML = `${btn.icon} ${btn.text}`;
        
        // Add click event for each button
        button.addEventListener('click', () => {
            handleButtonClick(btn.id);
        });
        
        options.appendChild(button);
    });
    
    // Add options to the document
    document.body.appendChild(options);
    document.body.appendChild(bubble);
    
    console.log("ChatGPT Prompt Enhancer: Bubble added to DOM");
    
    // Toggle options when bubble is clicked
    bubble.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent body click from immediately closing it
        const isVisible = options.style.display === 'flex';
        options.style.display = isVisible ? 'none' : 'flex';
    });
    
    // Make bubble draggable
    makeDraggable(bubble);
    
    // Close options when clicking outside
    document.addEventListener('click', (e) => {
        if (!bubble.contains(e.target) && !options.contains(e.target)) {
            options.style.display = 'none';
        }
    });
    
    // Restore position if saved
    restoreBubblePosition();
}

// Make an element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.right = "auto"; // Override default right position
        
        // Update options position based on bubble position
        const options = document.getElementById('prompt-enhance-options');
        if (options) {
            options.style.top = element.style.top;
            options.style.left = (parseInt(element.style.left || 0) - options.offsetWidth - 10) + "px";
            options.style.right = "auto";
            options.style.transform = "none";
        }
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Save position in localStorage for persistence
        const rect = element.getBoundingClientRect();
        localStorage.setItem('promptEnhanceBubblePosition', JSON.stringify({
            top: rect.top,
            left: rect.left
        }));
    }
}

// Add this helper function
function debugTextareaState() {
    const textareaSelectors = [
        'textarea[data-id="root"]',
        'form textarea',
        'div[role="textbox"]',
        '#prompt-textarea',
        '[contenteditable="true"]'
    ];
    
    console.log('ChatGPT Prompt Enhancer: Debugging textarea state');
    textareaSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Found element with selector: ${selector}`);
            console.log('Element:', element);
            console.log('Text content:', element.value || element.textContent);
        } else {
            console.log(`No element found for selector: ${selector}`);
        }
    });
}

// Helper function to safely update React-controlled textarea
function updateReactTextarea(textarea, newValue) {
    // Check if it's a contenteditable div
    if (textarea.getAttribute('contenteditable') === 'true') {
        textarea.textContent = newValue;
        // Trigger a native input event
        const event = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
        });
        textarea.dispatchEvent(event);
        return;
    }

    // For regular textareas, create a native input event
    const nativeInputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: newValue,
        inputType: 'insertText'
    });

    // Update value and dispatch event
    textarea.value = newValue;
    textarea.dispatchEvent(nativeInputEvent);

    // Force React to update by triggering a change event
    const changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true
    });
    textarea.dispatchEvent(changeEvent);
}

// Handle button clicks
async function handleButtonClick(buttonId) {
    const textarea = findTextArea();
    console.log('ChatGPT Prompt Enhancer: Handle button click, textarea found:', !!textarea);

    if (!textarea) {
        showNotification('Cannot find input area. Please refresh the page.');
        return;
    }

    const text = textarea.value || textarea.textContent || '';
    if (!text.trim()) {
        showNotification('Please enter a prompt first');
        return;
    }

    showNotification('Processing...');

    try {
        const promptType = buttonId === 'formal-button' 
            ? "Make this prompt more formal and professional:" 
            : "Improve this prompt:";

        const response = await chrome.runtime.sendMessage({
            action: "enhancePrompt",
            promptType,
            text: text.trim()
        });

        if (response?.success) {
            updateReactTextarea(textarea, response.enhancedPrompt);
            showNotification('Prompt enhanced successfully!');
        } else {
            throw new Error('Enhancement failed');
        }
    } catch (error) {
        console.error('Enhancement error:', error);
        showNotification('Failed to enhance prompt. Please try again.');
    }
}

// Show notification
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.getElementById('prompt-enhance-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'prompt-enhance-notification';
    notification.className = 'prompt-enhance-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Function for the enhance button (existing functionality)
function createEnhanceButton() {
    const textarea = findTextArea();
    if (!textarea || document.getElementById('enhance-prompt-btn')) return;

    const buttonContainer = textarea.closest('div[class*="relative"]');
    if (!buttonContainer) return;

    const button = document.createElement('button');
    button.id = 'enhance-prompt-btn';
    button.className = 'enhance-prompt-btn';
    button.innerHTML = `
        <div class="enhance-prompt-btn-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                      fill="currentColor" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Enhance</span>
        </div>
    `;

    // Use inline styles to avoid CSP issues
    button.style.cssText = `
        position: absolute;
        right: 50px;
        bottom: 12px;
        padding: 6px 12px;
        background: none;
        border: 1px solid #8e8ea0;
        border-radius: 4px;
        color: #8e8ea0;
        cursor: pointer;
        font-size: 14px;
        z-index: 10;
        transition: all 0.2s ease;
    `;

    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#8e8ea0';
        button.style.color = 'white';
    });

    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#8e8ea0';
    });

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        handleButtonClick('enhance-button');
    });

    buttonContainer.appendChild(button);
}

function waitForElement(selector, callback, maxAttempts = 20) {
    let attempts = 0;
    
    const checkElement = () => {
        attempts++;
        const textareaSelectors = [
            'textarea[data-id="root"]',
            'form textarea',
            'div[role="textbox"]',
            '.chat-input textarea',
            '[contenteditable="true"]'
        ];
        
        let element = null;
        for (const sel of textareaSelectors) {
            element = document.querySelector(sel);
            if (element) break;
        }
        
        if (element) {
            callback(element);
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(checkElement, 500);
        } else {
            console.log("ChatGPT Prompt Enhancer: Failed to find input element after", maxAttempts, "attempts");
        }
    };
    
    checkElement();
}

// Restore bubble position from localStorage
function restoreBubblePosition() {
    const bubble = document.getElementById('prompt-enhance-bubble');
    if (!bubble) return;
    
    const savedPosition = localStorage.getItem('promptEnhanceBubblePosition');
    if (savedPosition) {
        try {
            const position = JSON.parse(savedPosition);
            bubble.style.top = position.top + 'px';
            bubble.style.left = position.left + 'px';
            bubble.style.right = 'auto';
            
            const options = document.getElementById('prompt-enhance-options');
            if (options) {
                options.style.top = position.top + 'px';
                options.style.left = (position.left - options.offsetWidth - 10) + 'px';
                options.style.right = 'auto';
                options.style.transform = 'none';
            }
        } catch (error) {
            console.error('Error restoring bubble position:', error);
        }
    }
}

// Initialize button if not already present
createEnhanceButton();
// Helper function to find the textarea
function findTextArea() {
    const selectors = [
        '#prompt-textarea[contenteditable="true"]', // Add contenteditable first
        'form textarea',
        '#prompt-textarea',
        'textarea[data-id="root"]',
        'div[role="textbox"]',
        '[contenteditable="true"]'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && 
            !element.disabled && 
            element.offsetParent !== null &&
            (element.value !== undefined || element.textContent !== undefined)) {
            
            if (!element.dataset.enhancerFound) {
                console.log('ChatGPT Prompt Enhancer: Found input element:', element);
                element.dataset.enhancerFound = 'true';
            }
            return element;
        }
    }
    return null;
}

// Modified initialization to handle React components better
function initializeEnhancer() {
    if (!isValidChatGPTPage()) return;

    let initialized = false;
    const maxAttempts = 10;
    let attempts = 0;

    function init() {
        if (initialized || attempts >= maxAttempts) return;
        attempts++;

        const textarea = findTextArea();
        if (textarea) {
            if (!document.getElementById('prompt-enhance-bubble')) {
                createFloatingBubble();
            }
            if (!document.getElementById('enhance-prompt-btn')) {
                createEnhanceButton();
            }
            initialized = true;
        } else {
            setTimeout(init, 1000);
        }
    }

    init();

    // Observe DOM changes for dynamic content
    const observer = new MutationObserver(debounce(() => {
        if (!initialized) init();
    }, 250));

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start the initialization
initializeEnhancer();
