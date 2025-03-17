# ChatGPT Prompt Enhancer

A Chrome extension that enhances your ChatGPT experience by providing tools to improve, formalize, and clarify your prompts using Google's Gemini AI.

![ChatGPT Prompt Enhancer](screenshots/demo.gif)

## Features

- 🎯 **Floating Action Button**: Easy-to-access floating bubble on ChatGPT interface
- ✨ **Enhance Prompt**: Improves your prompt's structure and effectiveness
- 📝 **Make Formal**: Transforms casual prompts into professional, formal language
- 🔍 **Clarify Intent**: Adds specificity and detail to your prompts
- 📋 **Context Menu Integration**: Right-click to enhance selected text anywhere
- 🌓 **Dark Mode Support**: Seamless integration with ChatGPT's dark mode
- ⚡ **Real-time Processing**: Quick response using Gemini API

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/chatgpt-prompt-enhancer.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

### Floating Bubble
- Click the floating "+" bubble on the right side of ChatGPT
- Choose from three enhancement options:
  - **Enhance Prompt**: General improvement
  - **Make Formal**: Professional formatting
  - **Clarify Intent**: Add specificity

### Context Menu
- Select any text on ChatGPT
- Right-click and choose "Polish My Prompt"
- Enhanced version will be copied to clipboard

## Configuration

The extension uses Google's Gemini API. To use your own API key:

1. Get an API key from Google Cloud Console
2. Replace the `API_KEY` in `background.js`:
```javascript
const API_KEY = 'your-api-key-here';
```

## Technical Details

### Files Structure
- `manifest.json`: Extension configuration
- `content.js`: Main content script for ChatGPT integration
- `background.js`: Background service worker with API handling
- `styles.css`: Custom styling for UI elements

### API Integration
- Uses Google's Gemini API for prompt enhancement
- Implements error handling and retry mechanisms
- Supports asynchronous processing

### Security
- API key should be kept private
- All communication is over HTTPS
- Content script runs in isolated context

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of JavaScript
- Google Cloud account for API key

### Local Development
1. Make changes to source files
2. Reload the extension in `chrome://extensions/`
3. Test changes on ChatGPT

### Building
```bash
# Install dependencies
npm install

# Build extension
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini API for prompt enhancement
- ChatGPT platform for integration support
- Contributors and testers

## Support

For issues and feature requests, please use the GitHub Issues section.

## Privacy

This extension:
- Does not collect personal data
- Only processes text when explicitly requested
- Does not store conversation history
- Uses secure API communication

## Version History

- 1.0.0: Initial release
  - Basic prompt enhancement
  - Floating bubble interface
  - Context menu integration

## Roadmap

- [ ] Additional enhancement options
- [ ] Custom prompt templates
- [ ] Settings panel
- [ ] History tracking
- [ ] Export/import capabilities

---

Made with ❤️ by [Your Name]