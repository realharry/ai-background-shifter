# AI Background Shifter

A Chrome extension that enables users to change the background of a webpage to an AI-generated image based on a text prompt. The extension features a user interface for entering prompts and previewing generated images. The main UI is presented in a side panel, with additional settings available in the Options page.

## Features

- 🎨 **AI-Generated Backgrounds**: Create custom backgrounds using text descriptions
- 🔄 **Preview & Retry**: Preview generated images before applying, with retry functionality
- 🎛️ **Side Panel Interface**: Clean, intuitive interface accessible via Chrome's side panel
- ⚙️ **Configurable Settings**: Options page for configuring AI models and parameters
- 🔄 **Background Management**: Easy switching between original and AI-generated backgrounds
- 💾 **Local Storage**: Settings and preferences stored locally for privacy

## Technology Stack

- **React 19** - Modern React with hooks and latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui Components** - Beautiful, accessible UI components
- **Lucide React** - Icon library
- **Chrome Extension Manifest V3** - Latest Chrome extension format

## Installation

### For Development

1. Clone the repository:
```bash
git clone https://github.com/realharry/ai-background-shifter.git
cd ai-background-shifter
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist` folder

### For Production

1. Download the latest release from the releases page
2. Follow the Chrome installation steps above using the downloaded files

## Usage

1. **Click the extension icon** in the Chrome toolbar to open the side panel
2. **Enter a text prompt** describing the background you want to generate
3. **Click "Generate Background"** and wait for the AI to create your image
4. **Preview the result** - you can retry if you're not satisfied
5. **Click "Apply"** to set the generated image as the webpage background
6. **Use "Restore Original"** to revert to the original background anytime

## Settings

Access the settings page by clicking the "Settings" button in the side panel. Here you can configure:

- **AI Model**: Choose between different AI image generation models
- **API Key**: Enter your API key for the selected AI service
- **Image Size**: Select the dimensions for generated images
- **Quality**: Choose between standard and HD quality

### Supported AI Services

- **OpenAI DALL-E 3** (Recommended)
- **OpenAI DALL-E 2**
- **Stable Diffusion**
- **Midjourney** (Coming soon)

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── SidePanel.tsx # Main side panel interface
│   └── OptionsPage.tsx # Settings/options page
├── lib/
│   ├── utils.ts      # Utility functions
│   └── button-variants.ts # Button styling variants
├── background.ts     # Chrome extension background script
├── content.ts        # Content script for DOM manipulation
├── sidepanel.tsx     # Side panel entry point
└── options.tsx       # Options page entry point
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Chrome Extension Architecture

- **Background Script**: Handles extension logic and AI API calls
- **Content Script**: Manipulates webpage DOM for background changes
- **Side Panel**: Main user interface for prompt input and image preview
- **Options Page**: Configuration interface for settings and API keys

## API Integration

The extension currently uses a mock AI service for demonstration. To integrate with real AI services:

1. Update the `generateImage` function in `src/background.ts`
2. Add your API key in the options page
3. Implement the specific API call for your chosen service

Example for OpenAI DALL-E:

```typescript
async function generateImage(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
    }),
  });
  
  const data = await response.json();
  return data.data[0].url;
}
```

## Privacy & Security

- All settings and API keys are stored locally in the browser
- No data is sent to third-party services except the chosen AI provider
- Content script only modifies background styling, no data collection
- All network requests are made securely over HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
