# Speculative Decoding WebAI Demo

🚀 **Interactive web-based demonstration of speculative decoding in large language models (LLMs)**

This project provides a comprehensive, educational demonstration of how speculative decoding works to accelerate text generation in AI models. Watch as a fast small model (DistilGPT-2) drafts multiple tokens ahead, while a larger accurate model (GPT-2) verifies them, providing significant speedup while maintaining quality.

## 🎯 Live Demo

Experience speculative decoding in action with three different interfaces:
- **Main Demo**: Interactive visualization with color-coded tokens
- **Speed Comparison**: Side-by-side performance race with detailed analytics
- **Simple Comparison**: Clean, no-frills performance comparison

## 🎥 What You'll See

- **Real-time token generation** with streaming text
- **Visual feedback** showing accepted (green) vs rejected (red) tokens
- **Performance metrics** demonstrating 2-3x speedup
- **Model call reduction** showing computational savings
- **Educational insights** into modern AI optimization techniques

## Features

### Main Demo (index.html)
- **Interactive UI**: Clean, responsive interface with real-time token visualization
- **Visual Feedback**: Color-coded tokens showing acceptance/rejection status
  - 🟢 Green: Tokens accepted by large model
  - 🔴 Red: Tokens rejected and corrected
  - 🟡 Yellow: Drafted tokens awaiting verification
- **Real-time Statistics**: Track efficiency, model calls saved, and acceptance rates
- **Mock Mode**: Fast testing without loading heavy AI models
- **Configurable Parameters**: Adjust number of speculative tokens (k)
- **Generation Log**: Detailed step-by-step process visualization

### Speed Comparison Demo (comparison.html)
- **Side-by-Side Comparison**: Run speculative vs sequential generation simultaneously
- **Performance Metrics**: Real-time speed, efficiency, and model call tracking
- **Visual Race**: Watch both methods generate text with progress bars
- **Detailed Analysis**: Comprehensive performance breakdown and speedup calculation
- **Winner Declaration**: Clear indication of which method performs better
- **Token Streaming**: Real-time token generation with visual feedback

### Simple Comparison Demo (simple-comparison.html)
- **No Fancy Visualizations**: Plain text output as it would appear normally
- **Raw Performance Data**: Clean comparison without animations or color coding
- **Focus on Results**: Emphasis on timing, efficiency, and model call statistics
- **Straightforward Interface**: Minimal UI focused on the core comparison
- **Real Model Support**: Full integration with actual AI models
- **Streaming Support**: Optional real-time token streaming as text is generated

## How Speculative Decoding Works

1. **Draft Phase**: Small model (DistilGPT-2) generates k=4 tokens ahead
2. **Verification Phase**: Large model (GPT-2) verifies the drafted tokens
3. **Acceptance/Rejection**: Tokens are accepted if they match, rejected if they don't
4. **Fallback**: If tokens are rejected, large model generates the correct continuation
5. **Efficiency Gain**: Saves multiple large model calls when tokens are accepted

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Models**: Transformers.js (@xenova/transformers) loaded via CDN
  - Small Model: Xenova/distilgpt2
  - Large Model: Xenova/gpt2
- **Styling**: Custom CSS with gradient backgrounds and animations
- **Package Manager**: pnpm
- **Module Loading**: Direct CDN imports to avoid browser compatibility issues

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **pnpm** - Fast, disk space efficient package manager
  ```bash
  npm install -g pnpm
  ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gourav221b/Speculative-decoding-WebAI-demo.git
   cd Speculative-decoding-WebAI-demo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Start with the main demo or try the comparisons

### 🎮 First Run Experience

1. **Start with Mock Mode** - Instant results for immediate testing
2. **Try the Main Demo** - See color-coded token visualization
3. **Run Speed Comparison** - Watch the performance race
4. **Load Real Models** - Experience authentic AI model performance (optional)

### Usage

#### Main Demo
1. **Start with Mock Mode**: For instant results, keep "Mock mode" checked
2. **Enter a Prompt**: Type your text prompt (e.g., "The quick brown fox")
3. **Adjust Parameters**: Set the number of speculative tokens (k) - default is 4
4. **Generate**: Click the "Generate" button to start the speculative decoding process
5. **Watch the Process**: Observe tokens being drafted (yellow), then accepted (green) or rejected (red)
6. **View Statistics**: Monitor efficiency rates and model calls saved

#### Speed Comparison Demo
1. **Navigate to Comparison**: Click "🚀 Speed Comparison" in the footer
2. **Enter Prompt**: Type the same prompt for both methods to compare
3. **Set Parameters**: Adjust target length and speculative tokens (k)
4. **Start Race**: Click "Start Comparison" to run both methods simultaneously
5. **Watch the Race**: See real-time progress bars and token generation
6. **View Results**: Analyze speedup, efficiency, and detailed performance metrics

#### Simple Comparison Demo
1. **Navigate to Simple**: Click "📊 Simple Comparison" in the footer
2. **Enter Prompt**: Type your prompt for both methods
3. **Configure Settings**: Set target tokens and speculative parameters
4. **Load Models**: Optionally load real AI models or use mock mode
5. **Start Comparison**: Run both methods without fancy visualizations
6. **Review Results**: See plain text output and performance statistics

### Real AI Models

To use actual AI models instead of mock generation:
1. Uncheck "Mock mode" 
2. Wait for models to load (first time may take a few minutes)
3. Generate text with real DistilGPT-2 and GPT-2 models

## 📁 Project Structure

```
├── index.html                 # Main interactive demo with visual tokens
├── comparison.html            # Fancy side-by-side speed comparison
├── simple-comparison.html     # Clean performance comparison
├── styles.css                 # Professional styling and animations
├── script.js                  # Main demo logic with speculative decoding
├── comparison.js              # Speed comparison functionality
├── simple-comparison.js       # Simple comparison logic
├── script-compatible.js       # Fallback compatible version
├── package.json              # Dependencies and scripts
├── pnpm-lock.yaml            # Package lock file
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

## 🎨 Demo Pages

| Page | Description | Best For |
|------|-------------|----------|
| `index.html` | Interactive visualization with color-coded tokens | Learning and presentations |
| `comparison.html` | Animated side-by-side race with rich visuals | Demonstrations and education |
| `simple-comparison.html` | Clean text-only performance comparison | Technical analysis and research |

## Key Components

### SpeculativeDecodingDemo Class
- Model loading and management
- Token generation with both models
- Speculative decoding algorithm implementation
- UI interaction and visual updates

### Visual Features
- Animated token streaming
- Real-time color coding
- Progress tracking
- Statistics dashboard
- Generation logging

## Performance Benefits

Speculative decoding can provide significant speedup:
- **Theoretical Speedup**: Up to 2-3x faster generation
- **Efficiency Tracking**: Real-time monitoring of acceptance rates
- **Model Call Reduction**: Fewer expensive large model calls

## 🎓 Educational Value

### What You'll Learn
- **Speculative Decoding Mechanics**: See exactly how small models draft and large models verify
- **Performance Optimization**: Understand why this technique provides 2-3x speedup
- **Token-Level Processing**: Visualize how AI models generate text token by token
- **Model Efficiency**: Learn about computational trade-offs in AI systems
- **Real-World Applications**: Understand how modern AI systems achieve faster inference

### 🔬 Technical Insights
- **Acceptance Rates**: Typically 60-80% of drafted tokens are accepted
- **Model Call Reduction**: 30-50% fewer expensive large model calls
- **Latency Benefits**: Significant reduction in time-to-first-token
- **Quality Maintenance**: Same output quality as sequential generation
- **Scalability**: Benefits increase with larger model size differences

### 🎯 Perfect For
- **Students** learning about AI optimization techniques
- **Developers** implementing speculative decoding
- **Researchers** studying LLM inference optimization
- **Educators** teaching modern AI concepts
- **Engineers** optimizing AI application performance

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design
- Requires internet connection for CDN-based module loading

## Troubleshooting

### Module Resolution Error
If you see `"Failed to resolve module specifier @xenova/transformers"`:

1. **Check Browser Support**: Ensure you're using a modern browser
2. **Internet Connection**: The app loads transformers.js from CDN
3. **HTTPS**: Some browsers require HTTPS for ES6 modules
4. **View Troubleshooting Page**: Open `troubleshooting.html` for detailed solutions

### Common Issues
- **Slow Loading**: First-time model loading can take 2-3 minutes
- **Memory Usage**: AI models require significant RAM (2GB+ recommended)
- **CORS Errors**: Use the provided development server, not file:// protocol

## Development

### Scripts
- `pnpm run dev` - Start development server
- `pnpm run start` - Start production server
- `pnpm run build` - No build step (static files)

### Testing
Open `test.html` in your browser to run the test suite.

## References

- [OpenAI Speculative Decoding Research](https://openai.com/research/accelerating-gpt-with-speculative-decoding)
- [Transformers.js Documentation](https://xenova.github.io/transformers.js/)
- [Hugging Face Models](https://huggingface.co/models)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - Feel free to use and modify for educational and commercial purposes.

## 🙏 Acknowledgments

- **OpenAI** for pioneering speculative decoding research
- **Hugging Face** for Transformers.js and model hosting
- **Xenova** for the excellent browser-compatible AI models
- **The AI Community** for advancing LLM optimization techniques

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/gourav221b/Speculative-decoding-WebAI-demo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/gourav221b/Speculative-decoding-WebAI-demo/discussions)
- 📧 **Contact**: Create an issue for questions or feedback

---

⭐ **Star this repository if you found it helpful!**

Built with ❤️ for the AI education community
