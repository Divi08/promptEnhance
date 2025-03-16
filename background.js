// API key configuration
const API_KEY = 'AIzaSyDWqzhnCgvlywxnkAczALKwo6G0NdDfQEc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Log initialization
console.log('ChatGPT Prompt Enhancer: Background script initialized');

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('ChatGPT Prompt Enhancer: Extension installed');
    chrome.contextMenus.create({
        id: "polishPrompt",
        title: "Polish My Prompt",
        contexts: ["selection"]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "polishPrompt") {
        console.log('ChatGPT Prompt Enhancer: Context menu clicked');
        
        try {
            // Show processing notification
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showNotification
            });

            // Get improved prompt from Gemini API
            const improvedPrompt = await improvePromptWithGemini("Improve this prompt:", info.selectionText);
            
            // Copy to clipboard and show success notification
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: updateNotificationAndCopy,
                args: [improvedPrompt]
            });
        } catch (error) {
            console.error('Error in context menu handler:', error);
            // Show error notification
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: updateNotificationAndCopy,
                    args: ['Error improving prompt. Please try again.']
                });
            } catch (innerError) {
                console.error('Failed to show error notification:', innerError);
            }
        }
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('ChatGPT Prompt Enhancer: Message received:', request.action);
    
    if (request.action === "enhancePrompt") {
        improvePromptWithGemini(request.promptType, request.text)
            .then(enhancedPrompt => {
                console.log('ChatGPT Prompt Enhancer: Prompt enhanced successfully');
                sendResponse({success: true, enhancedPrompt});
            })
            .catch(error => {
                console.error('Error in enhancePrompt:', error);
                sendResponse({success: false, error: error.message});
            });
        return true; // Indicates we'll send a response asynchronously
    }
});

// Function to improve prompt using Gemini API
async function improvePromptWithGemini(promptType, prompt) {
    console.log('ChatGPT Prompt Enhancer: Calling Gemini API');
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the best prompt engineer, you take a prompt and clean it, formalize it, and everything a prompt engineer does.

Input: "${prompt}"

Rules:
1. Improve the prompt structure and clarity
2. Enhance specificity and precision
3. Add necessary context if missing
4. Make the language more effective
5. Never ask questions
6. Never provide solutions

make this prompt better:

Return the enhanced prompt only, with no additional text.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response format from API');
        }

        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Error in improvePromptWithGemini:', error);
        throw error;
    }
}

// Function to show notification (injected into page)
function showNotification() {
    const notification = document.createElement('div');
    notification.id = 'translate-notification';
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
        transition: opacity 2s ease-out;
    `;
    notification.textContent = 'Processing...';
    document.body.appendChild(notification);
}

// Function to update notification and copy text (injected into page)
function updateNotificationAndCopy(text) {
    const notification = document.getElementById('translate-notification');
    if (!notification) {
        // Create notification if it doesn't exist
        showNotification();
        setTimeout(() => updateNotificationAndCopy(text), 100);
        return;
    }

    notification.textContent = 'Polished Prompt copied to clipboard!';
    
    navigator.clipboard.writeText(text)
        .then(() => {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            notification.textContent = 'Failed to copy text. Please try again.';
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            }, 2000);
        });
}