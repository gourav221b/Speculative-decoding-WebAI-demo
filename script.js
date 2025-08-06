// Speculative Decoding Demo - Main Application
// Import directly from CDN to avoid module resolution issues
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configure transformers.js environment
env.allowRemoteModels = true;
env.allowLocalModels = false;

class SpeculativeDecodingDemo {
    constructor() {
        this.smallModel = null;
        this.largeModel = null;
        this.isGenerating = false;
        this.mockMode = false;
        this.artificialLatency = false;

        // Statistics
        this.stats = {
            totalTokens: 0,
            acceptedTokens: 0,
            rejectedTokens: 0,
            modelCallsSaved: 0
        };

        // DOM elements
        this.elements = {
            promptInput: document.getElementById('prompt-input'),
            generateBtn: document.getElementById('generate-btn'),
            resetBtn: document.getElementById('reset-btn'),
            loadModelsBtn: document.getElementById('load-models-btn'),
            outputArea: document.getElementById('output-area'),
            kValue: document.getElementById('k-value'),
            mockMode: document.getElementById('mock-mode'),
            artificialLatency: document.getElementById('artificial-latency'),
            progressText: document.getElementById('progress-text'),
            characterCount: document.getElementById('character-count'),
            loadingOverlay: document.getElementById('loading-overlay'),
            btnText: document.querySelector('.btn-text'),
            btnSpinner: document.querySelector('.btn-spinner'),
            logArea: document.getElementById('log-area'),
            clearLogBtn: document.getElementById('clear-log-btn'),
            // Model status elements
            smallModelStatus: document.getElementById('small-model-status'),
            largeModelStatus: document.getElementById('large-model-status'),
            // Stats elements
            totalTokensEl: document.getElementById('total-tokens'),
            acceptedTokensEl: document.getElementById('accepted-tokens'),
            rejectedTokensEl: document.getElementById('rejected-tokens'),
            efficiencyRateEl: document.getElementById('efficiency-rate'),
            modelCallsSavedEl: document.getElementById('model-calls-saved')
        };

        this.initializeEventListeners();
        this.initializeModels();
    }

    initializeEventListeners() {
        // Generate button
        this.elements.generateBtn.addEventListener('click', () => {
            this.handleGenerate();
        });

        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            this.handleReset();
        });

        // Load models button
        this.elements.loadModelsBtn.addEventListener('click', () => {
            this.handleLoadModels();
        });

        // Clear log button
        this.elements.clearLogBtn.addEventListener('click', () => {
            this.clearLog();
        });

        // Mock mode toggle
        this.elements.mockMode.addEventListener('change', (e) => {
            this.mockMode = e.target.checked;
            this.updateModelStatus();
            this.log(`Mock mode ${this.mockMode ? 'enabled' : 'disabled'}`, 'info');
        });

        // Artificial latency toggle
        this.elements.artificialLatency.addEventListener('change', (e) => {
            this.artificialLatency = e.target.checked;
            this.log(`Artificial latency ${this.artificialLatency ? 'enabled' : 'disabled'}`, 'info');
        });

        // Enter key in prompt input
        this.elements.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleGenerate();
            }
        });
    }

    async initializeModels() {
        // Start with mock mode enabled by default for faster testing
        this.mockMode = true;
        this.elements.mockMode.checked = true;
        this.updateModelStatus();

        this.log('Application initialized with mock models for fast testing', 'info');
        this.updateProgressText('Ready to generate (using mock models)');
    }

    async handleLoadModels() {
        if (this.smallModel && this.largeModel) {
            this.log('Models already loaded!', 'info');
            return;
        }

        try {
            // Disable mock mode and update UI
            this.mockMode = false;
            this.elements.mockMode.checked = false;

            // Update button state
            this.setLoadModelsButtonState(true);

            // Show loading overlay with progress
            this.showLoadingWithProgress();

            // Update model status to loading
            this.updateModelStatus('loading');

            this.log('Starting to load real AI models...', 'info');
            this.updateProgressText('Loading AI models...');

            // Load small model (DistilGPT-2)
            this.updateLoadingProgress(10, 'Loading small model (DistilGPT-2)...');
            this.log('Loading small model (DistilGPT-2)...', 'info');
            this.elements.smallModelStatus.textContent = 'Loading...';
            this.elements.smallModelStatus.className = 'status-badge loading';

            this.smallModel = await pipeline('text-generation', 'Xenova/distilgpt2');

            this.updateLoadingProgress(50, 'Small model loaded successfully!');
            this.elements.smallModelStatus.textContent = 'Loaded';
            this.elements.smallModelStatus.className = 'status-badge loaded';
            this.log('Small model loaded successfully!', 'verify');

            // Load large model (GPT-2)
            this.updateLoadingProgress(60, 'Loading large model (GPT-2)...');
            this.log('Loading large model (GPT-2)...', 'info');
            this.elements.largeModelStatus.textContent = 'Loading...';
            this.elements.largeModelStatus.className = 'status-badge loading';

            this.largeModel = await pipeline('text-generation', 'Xenova/gpt2');

            this.updateLoadingProgress(100, 'All models loaded successfully!');
            this.elements.largeModelStatus.textContent = 'Loaded';
            this.elements.largeModelStatus.className = 'status-badge loaded';
            this.log('Large model loaded successfully!', 'verify');

            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.elements.loadModelsBtn.style.display = 'none'; // Hide button after successful load

            this.log('All models loaded successfully! You can now generate with real AI models.', 'verify');
            this.updateProgressText('Real AI models ready');

        } catch (error) {
            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.updateModelStatus('error');
            this.log(`Error loading models: ${error.message}`, 'reject');
            this.updateProgressText('Error loading models - falling back to mock mode');

            // Fall back to mock mode
            this.mockMode = true;
            this.elements.mockMode.checked = true;
            this.updateModelStatus();

            console.error('Model loading error:', error);
        }
    }

    setLoadModelsButtonState(loading) {
        const btn = this.elements.loadModelsBtn;
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');

        btn.disabled = loading;
        btnText.classList.toggle('hidden', loading);
        btnSpinner.classList.toggle('hidden', !loading);

        if (loading) {
            btnText.textContent = 'Loading Models...';
        } else {
            btnText.textContent = 'Load Real AI Models';
        }
    }

    updateModelStatus(status = null) {
        if (this.mockMode || status === null) {
            this.elements.smallModelStatus.textContent = 'Mock Mode';
            this.elements.smallModelStatus.className = 'status-badge mock';
            this.elements.largeModelStatus.textContent = 'Mock Mode';
            this.elements.largeModelStatus.className = 'status-badge mock';
            this.elements.loadModelsBtn.style.display = 'block';
        } else if (status === 'loading') {
            this.elements.smallModelStatus.textContent = 'Loading...';
            this.elements.smallModelStatus.className = 'status-badge loading';
            this.elements.largeModelStatus.textContent = 'Loading...';
            this.elements.largeModelStatus.className = 'status-badge loading';
        } else if (status === 'error') {
            this.elements.smallModelStatus.textContent = 'Error';
            this.elements.smallModelStatus.className = 'status-badge error';
            this.elements.largeModelStatus.textContent = 'Error';
            this.elements.largeModelStatus.className = 'status-badge error';
        }
    }

    async handleGenerate() {
        const prompt = this.elements.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        if (this.isGenerating) {
            return;
        }

        this.isGenerating = true;
        this.setGeneratingState(true);
        this.clearOutput();
        this.resetStats();

        try {
            await this.runSpeculativeDecoding(prompt);
        } catch (error) {
            this.log(`Generation error: ${error.message}`, 'reject');
            console.error('Generation error:', error);
        } finally {
            this.isGenerating = false;
            this.setGeneratingState(false);
        }
    }

    handleReset() {
        this.clearOutput();
        this.clearLog();
        this.resetStats();
        this.elements.promptInput.value = '';
        this.updateProgressText('Ready to generate');
        this.updateCharacterCount(0);
    }

    setGeneratingState(generating) {
        this.elements.generateBtn.disabled = generating;
        this.elements.btnText.classList.toggle('hidden', generating);
        this.elements.btnSpinner.classList.toggle('hidden', !generating);

        if (generating) {
            this.updateProgressText('Generating...');
        }
    }

    showLoading(text = 'Loading...') {
        this.elements.loadingOverlay.classList.remove('hidden');
        const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    showLoadingWithProgress() {
        this.elements.loadingOverlay.classList.remove('hidden');
        const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
        const loadingSubtext = this.elements.loadingOverlay.querySelector('.loading-subtext');

        if (loadingText) {
            loadingText.textContent = 'Loading AI Models';
        }
        if (loadingSubtext) {
            loadingSubtext.textContent = 'This may take a few minutes on first load';
        }

        // Reset progress
        this.updateLoadingProgress(0, 'Initializing...');
    }

    updateLoadingProgress(percentage, details) {
        const progressFill = document.getElementById('progress-fill');
        const progressDetails = document.getElementById('progress-details');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressDetails) {
            progressDetails.textContent = details;
        }
    }

    clearOutput() {
        this.elements.outputArea.innerHTML = '<div class="placeholder-text">Generated tokens will appear here...</div>';
    }

    clearLog() {
        this.elements.logArea.innerHTML = '<div class="log-placeholder">Generation steps will be logged here...</div>';
    }

    resetStats() {
        this.stats = {
            totalTokens: 0,
            acceptedTokens: 0,
            rejectedTokens: 0,
            modelCallsSaved: 0
        };
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        this.elements.totalTokensEl.textContent = this.stats.totalTokens;
        this.elements.acceptedTokensEl.textContent = this.stats.acceptedTokens;
        this.elements.rejectedTokensEl.textContent = this.stats.rejectedTokens;

        const efficiency = this.stats.totalTokens > 0
            ? Math.round((this.stats.acceptedTokens / this.stats.totalTokens) * 100)
            : 0;
        this.elements.efficiencyRateEl.textContent = `${efficiency}%`;
        this.elements.modelCallsSavedEl.textContent = this.stats.modelCallsSaved;
    }

    updateProgressText(text) {
        this.elements.progressText.textContent = text;
    }

    updateCharacterCount(count) {
        this.elements.characterCount.textContent = `${count}/100 characters`;
    }

    log(message, type = 'info') {
        const logArea = this.elements.logArea;

        // Remove placeholder if it exists
        const placeholder = logArea.querySelector('.log-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

        logArea.appendChild(entry);
        logArea.scrollTop = logArea.scrollHeight;
    }

    async addDelay(ms) {
        if (this.artificialLatency) {
            await new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Token generation methods
    async generateWithSmallModel(prompt, numTokens = 4) {
        if (this.mockMode) {
            return this.mockGenerate(prompt, numTokens, 'small');
        }

        if (!this.smallModel) {
            throw new Error('Small model not loaded');
        }

        try {
            await this.addDelay(100); // Simulate small model latency

            const result = await this.smallModel(prompt, {
                max_new_tokens: numTokens,
                do_sample: true,
                temperature: 0.8,
                top_p: 0.9,
                pad_token_id: 50256,
                return_full_text: false
            });

            return result[0].generated_text;
        } catch (error) {
            this.log(`Small model error: ${error.message}`, 'reject');
            throw error;
        }
    }

    async generateWithLargeModel(prompt, numTokens = 1) {
        if (this.mockMode) {
            return this.mockGenerate(prompt, numTokens, 'large');
        }

        if (!this.largeModel) {
            throw new Error('Large model not loaded');
        }

        try {
            await this.addDelay(300); // Simulate large model latency

            const result = await this.largeModel(prompt, {
                max_new_tokens: numTokens,
                do_sample: true,
                temperature: 0.7,
                top_p: 0.9,
                pad_token_id: 50256,
                return_full_text: false
            });

            return result[0].generated_text;
        } catch (error) {
            this.log(`Large model error: ${error.message}`, 'reject');
            throw error;
        }
    }

    // Mock generation for testing without loading heavy models
    mockGenerate(prompt, numTokens, modelType) {
        // Context-aware word selection based on prompt
        const contextWords = this.getContextualWords(prompt.toLowerCase());
        const commonWords = [
            'the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that',
            'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at'
        ];

        let result = '';
        for (let i = 0; i < numTokens; i++) {
            if (i > 0) result += ' ';

            let selectedWord;

            if (modelType === 'small') {
                // Small model: 60% chance of contextual word, 40% random
                if (Math.random() < 0.6 && contextWords.length > 0) {
                    selectedWord = contextWords[Math.floor(Math.random() * contextWords.length)];
                } else {
                    selectedWord = commonWords[Math.floor(Math.random() * commonWords.length)];
                }

                // Small model occasionally makes mistakes
                if (Math.random() < 0.2) {
                    selectedWord = this.introduceTypo(selectedWord);
                }
            } else {
                // Large model: 80% chance of contextual word, more accurate
                if (Math.random() < 0.8 && contextWords.length > 0) {
                    selectedWord = contextWords[Math.floor(Math.random() * contextWords.length)];
                } else {
                    selectedWord = commonWords[Math.floor(Math.random() * commonWords.length)];
                }
            }

            result += selectedWord;
        }

        return result;
    }

    getContextualWords(prompt) {
        const contextMap = {
            'cat': ['sat', 'on', 'the', 'mat', 'purrs', 'sleeps', 'plays'],
            'dog': ['barks', 'runs', 'plays', 'fetch', 'tail', 'wags'],
            'quick': ['brown', 'fox', 'jumps', 'over', 'fast', 'speed'],
            'fox': ['brown', 'quick', 'jumps', 'over', 'clever', 'sly'],
            'sun': ['shines', 'bright', 'warm', 'light', 'day', 'sky'],
            'moon': ['glows', 'night', 'stars', 'bright', 'full', 'crescent'],
            'water': ['flows', 'river', 'stream', 'clear', 'blue', 'deep'],
            'tree': ['tall', 'green', 'leaves', 'branches', 'forest', 'oak']
        };

        let contextWords = [];
        for (const [key, words] of Object.entries(contextMap)) {
            if (prompt.includes(key)) {
                contextWords.push(...words);
            }
        }

        return contextWords;
    }

    introduceTypo(word) {
        if (word.length < 3) return word;

        const typoTypes = ['swap', 'duplicate', 'wrong'];
        const typoType = typoTypes[Math.floor(Math.random() * typoTypes.length)];

        switch (typoType) {
            case 'swap':
                // Swap two adjacent characters
                const pos = Math.floor(Math.random() * (word.length - 1));
                return word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
            case 'duplicate':
                // Duplicate a character
                const dupPos = Math.floor(Math.random() * word.length);
                return word.slice(0, dupPos) + word[dupPos] + word.slice(dupPos);
            case 'wrong':
                // Replace a character
                const wrongPos = Math.floor(Math.random() * word.length);
                const wrongChar = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
                return word.slice(0, wrongPos) + wrongChar + word.slice(wrongPos + 1);
            default:
                return word;
        }
    }

    // Tokenization helpers
    tokenize(text) {
        // Simple tokenization - split by spaces and punctuation
        return text.split(/(\s+|[.,!?;:])/g).filter(token => token.trim().length > 0);
    }

    // Token comparison for verification
    compareTokens(draftTokens, verifyTokens) {
        const results = [];
        const minLength = Math.min(draftTokens.length, verifyTokens.length);

        for (let i = 0; i < minLength; i++) {
            if (draftTokens[i].trim() === verifyTokens[i].trim()) {
                results.push({ token: draftTokens[i], status: 'accepted', index: i });
            } else {
                results.push({ token: draftTokens[i], status: 'rejected', index: i });
                // Stop at first mismatch
                break;
            }
        }

        return results;
    }

    // Core speculative decoding algorithm
    async runSpeculativeDecoding(prompt) {
        this.log('Starting speculative decoding...', 'info');

        let currentText = prompt;
        let generatedText = '';
        const maxCharacters = 100;
        const k = parseInt(this.elements.kValue.value) || 4;

        this.log(`Using k=${k} speculative tokens`, 'info');

        // Clear output and show initial prompt
        this.clearOutput();
        this.displayPrompt(prompt);

        while (generatedText.length < maxCharacters) {
            try {
                // Step 1: Small model drafts k tokens
                this.updateProgressText(`Drafting ${k} tokens with small model...`);
                this.log(`Drafting ${k} tokens: "${currentText}"`, 'draft');

                const draftText = await this.generateWithSmallModel(currentText, k);
                const draftTokens = this.tokenize(draftText);

                this.log(`Drafted tokens: [${draftTokens.join(', ')}]`, 'draft');

                // Display drafted tokens as pending
                await this.displayTokens(draftTokens, 'pending');
                await this.addDelay(500);

                // Step 2: Large model verifies the drafted tokens
                this.updateProgressText('Verifying tokens with large model...');
                this.log(`Verifying tokens with large model...`, 'verify');

                const verifyText = await this.generateWithLargeModel(currentText, draftTokens.length);
                const verifyTokens = this.tokenize(verifyText);

                this.log(`Verification tokens: [${verifyTokens.join(', ')}]`, 'verify');

                // Step 3: Compare and accept/reject tokens
                const comparisonResults = this.compareTokens(draftTokens, verifyTokens);
                let acceptedText = '';
                let rejectedCount = 0;

                // Process comparison results
                for (let i = 0; i < comparisonResults.length; i++) {
                    const result = comparisonResults[i];

                    if (result.status === 'accepted') {
                        acceptedText += result.token;
                        this.stats.acceptedTokens++;
                        this.log(`✓ Accepted: "${result.token}"`, 'verify');
                    } else {
                        rejectedCount = draftTokens.length - i;
                        this.stats.rejectedTokens += rejectedCount;
                        this.log(`✗ Rejected: "${result.token}" and ${rejectedCount - 1} following tokens`, 'reject');
                        break;
                    }
                }

                // Update visual display
                await this.updateTokenDisplay(comparisonResults, verifyTokens);

                // Step 4: Handle accepted tokens
                if (acceptedText.length > 0) {
                    generatedText += acceptedText;
                    currentText += acceptedText;

                    // Calculate model calls saved
                    const callsSaved = comparisonResults.length - 1; // -1 because we still need one large model call
                    this.stats.modelCallsSaved += Math.max(0, callsSaved);

                    this.log(`Accepted ${comparisonResults.length} tokens, saved ${callsSaved} large model calls`, 'verify');
                } else {
                    // Step 5: Fallback - use large model to generate next token
                    this.updateProgressText('Falling back to large model...');
                    this.log('No tokens accepted, falling back to large model', 'reject');

                    const fallbackText = await this.generateWithLargeModel(currentText, 1);
                    const fallbackTokens = this.tokenize(fallbackText);

                    if (fallbackTokens.length > 0) {
                        const fallbackToken = fallbackTokens[0];
                        generatedText += fallbackToken;
                        currentText += fallbackToken;

                        // Display fallback token as accepted
                        await this.displayTokens([fallbackToken], 'accepted');
                        this.stats.acceptedTokens++;

                        this.log(`Fallback token: "${fallbackToken}"`, 'verify');
                    }
                }

                // Update statistics
                this.stats.totalTokens += draftTokens.length;
                this.updateStatsDisplay();
                this.updateCharacterCount(generatedText.length);

                // Small delay between iterations
                await this.addDelay(200);

                // Check if we should stop
                if (this.shouldStopGeneration(generatedText, currentText)) {
                    break;
                }

            } catch (error) {
                this.log(`Error in speculative decoding: ${error.message}`, 'reject');
                break;
            }
        }

        this.updateProgressText(`Generation complete (${generatedText.length} characters)`);
        this.log(`Speculative decoding completed. Generated ${generatedText.length} characters.`, 'verify');

        // Final statistics
        const efficiency = this.stats.totalTokens > 0
            ? Math.round((this.stats.acceptedTokens / this.stats.totalTokens) * 100)
            : 0;
        this.log(`Final efficiency: ${efficiency}% (${this.stats.acceptedTokens}/${this.stats.totalTokens} tokens accepted)`, 'info');
        this.log(`Model calls saved: ${this.stats.modelCallsSaved}`, 'info');
    }

    shouldStopGeneration(generatedText, currentText) {
        // Stop if we've reached the character limit
        if (generatedText.length >= 100) {
            return true;
        }

        // Stop if we encounter common ending patterns
        const endPatterns = ['.', '!', '?'];
        const lastChar = currentText.slice(-1);
        if (endPatterns.includes(lastChar) && generatedText.length > 50) {
            return true;
        }

        return false;
    }

    // Visual display methods
    displayPrompt(prompt) {
        const outputArea = this.elements.outputArea;
        outputArea.innerHTML = '';

        const promptElement = document.createElement('span');
        promptElement.className = 'prompt-text';
        promptElement.textContent = prompt;
        promptElement.style.fontWeight = 'bold';
        promptElement.style.color = '#1f2937';

        outputArea.appendChild(promptElement);
    }

    async displayTokens(tokens, status, delay = 100) {
        const outputArea = this.elements.outputArea;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const tokenElement = document.createElement('span');
            tokenElement.className = `token ${status}`;
            tokenElement.textContent = token;
            tokenElement.dataset.originalStatus = status;

            outputArea.appendChild(tokenElement);

            // Add delay between token appearances for animation effect
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async updateTokenDisplay(comparisonResults, verifyTokens) {
        const outputArea = this.elements.outputArea;
        const pendingTokens = outputArea.querySelectorAll('.token.pending');

        // Update the status of pending tokens based on comparison results
        for (let i = 0; i < comparisonResults.length; i++) {
            const result = comparisonResults[i];

            if (i < pendingTokens.length) {
                const tokenElement = pendingTokens[i];

                // Remove pending class and add new status
                tokenElement.classList.remove('pending');
                tokenElement.classList.add(result.status);

                // Add visual feedback animation
                tokenElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    tokenElement.style.transform = 'scale(1)';
                }, 200);

                // Small delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }

        // Remove any remaining pending tokens that were rejected
        const remainingPending = outputArea.querySelectorAll('.token.pending');
        for (const tokenElement of remainingPending) {
            tokenElement.classList.remove('pending');
            tokenElement.classList.add('rejected');

            // Add strikethrough animation
            tokenElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                tokenElement.style.transform = 'scale(1)';
            }, 200);

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // If there were rejections, add the correct tokens from the large model
        const rejectedIndex = comparisonResults.findIndex(result => result.status === 'rejected');
        if (rejectedIndex !== -1 && rejectedIndex < verifyTokens.length) {
            // Add the correct token from the large model
            const correctToken = verifyTokens[rejectedIndex];
            await this.displayTokens([correctToken], 'accepted', 200);
        }
    }

    // Enhanced token animation effects
    animateTokenAcceptance(tokenElement) {
        tokenElement.style.transition = 'all 0.3s ease';
        tokenElement.style.transform = 'scale(1.2)';
        tokenElement.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.5)';

        setTimeout(() => {
            tokenElement.style.transform = 'scale(1)';
            tokenElement.style.boxShadow = 'none';
        }, 300);
    }

    animateTokenRejection(tokenElement) {
        tokenElement.style.transition = 'all 0.3s ease';
        tokenElement.style.transform = 'scale(1.1)';
        tokenElement.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';

        setTimeout(() => {
            tokenElement.style.transform = 'scale(1)';
            tokenElement.style.boxShadow = 'none';
        }, 300);
    }

    // Progress visualization
    updateProgressVisualization(step, totalSteps) {
        const progressText = this.elements.progressText;
        const steps = ['Drafting', 'Verifying', 'Processing', 'Complete'];

        if (step < steps.length) {
            progressText.textContent = `${steps[step]} (${step + 1}/${totalSteps})`;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.speculativeDemo = new SpeculativeDecodingDemo();
});
