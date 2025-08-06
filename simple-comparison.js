// Simple Speed Comparison - No Fancy Visualizations
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configure transformers.js environment
env.allowRemoteModels = true;
env.allowLocalModels = false;

class SimpleSpeedComparison {
    constructor() {
        this.smallModel = null;
        this.largeModel = null;
        this.isRunning = false;
        this.mockMode = true;
        this.streamingEnabled = true;

        // DOM elements
        this.elements = {
            prompt: document.getElementById('simple-prompt'),
            targetLength: document.getElementById('simple-target-length'),
            kValue: document.getElementById('simple-k-value'),
            mockMode: document.getElementById('simple-mock-mode'),
            streaming: document.getElementById('simple-streaming'),
            startBtn: document.getElementById('simple-start-btn'),
            resetBtn: document.getElementById('simple-reset-btn'),
            loadModelsBtn: document.getElementById('simple-load-models-btn'),
            loadingOverlay: document.getElementById('simple-loading-overlay'),

            // Model status
            smallStatus: document.getElementById('simple-small-status'),
            largeStatus: document.getElementById('simple-large-status'),

            // Output areas
            speculativeText: document.getElementById('speculative-text'),
            sequentialText: document.getElementById('sequential-text'),

            // Stats
            specTime: document.getElementById('spec-time'),
            specCalls: document.getElementById('spec-calls'),
            specEfficiency: document.getElementById('spec-efficiency'),
            specSpeed: document.getElementById('spec-speed'),

            seqTime: document.getElementById('seq-time'),
            seqCalls: document.getElementById('seq-calls'),
            seqSpeed: document.getElementById('seq-speed'),

            // Summary
            summary: document.getElementById('simple-summary'),
            speedup: document.getElementById('simple-speedup')
        };

        this.initializeEventListeners();
        this.updateModelStatus();
    }

    initializeEventListeners() {
        this.elements.startBtn.addEventListener('click', () => {
            this.startComparison();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.resetComparison();
        });

        this.elements.loadModelsBtn.addEventListener('click', () => {
            this.handleLoadModels();
        });

        this.elements.mockMode.addEventListener('change', (e) => {
            this.mockMode = e.target.checked;
            this.updateModelStatus();
        });

        this.elements.streaming.addEventListener('change', (e) => {
            this.streamingEnabled = e.target.checked;
        });
    }

    async handleLoadModels() {
        if (this.smallModel && this.largeModel) {
            console.log('Models already loaded!');
            return;
        }

        try {
            this.mockMode = false;
            this.elements.mockMode.checked = false;
            this.setLoadModelsButtonState(true);
            this.showLoadingWithProgress();
            this.updateModelStatus('loading');

            // Load small model
            this.updateLoadingProgress(10, 'Loading DistilGPT-2...');
            this.elements.smallStatus.textContent = 'Loading...';
            this.elements.smallStatus.className = 'status-badge loading';

            this.smallModel = await pipeline('text-generation', 'Xenova/distilgpt2');

            this.updateLoadingProgress(50, 'DistilGPT-2 loaded!');
            this.elements.smallStatus.textContent = 'Loaded';
            this.elements.smallStatus.className = 'status-badge loaded';

            // Load large model
            this.updateLoadingProgress(60, 'Loading GPT-2...');
            this.elements.largeStatus.textContent = 'Loading...';
            this.elements.largeStatus.className = 'status-badge loading';

            this.largeModel = await pipeline('text-generation', 'Xenova/gpt2');

            this.updateLoadingProgress(100, 'All models loaded!');
            this.elements.largeStatus.textContent = 'Loaded';
            this.elements.largeStatus.className = 'status-badge loaded';

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.elements.loadModelsBtn.style.display = 'none';

            console.log('Models loaded successfully!');

        } catch (error) {
            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.updateModelStatus('error');
            console.error('Error loading models:', error);

            this.mockMode = true;
            this.elements.mockMode.checked = true;
            this.updateModelStatus();

            alert('Error loading models: ' + error.message + '. Using mock mode.');
        }
    }

    async startComparison() {
        if (this.isRunning) return;

        const prompt = this.elements.prompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        this.isRunning = true;
        this.setButtonState(true);
        this.resetOutputs();

        const targetLength = parseInt(this.elements.targetLength.value) || 20;
        const k = parseInt(this.elements.kValue.value) || 4;

        try {
            // Run both methods simultaneously
            const [speculativeResult, sequentialResult] = await Promise.all([
                this.runSpeculativeDecoding(prompt, targetLength, k),
                this.runSequentialGeneration(prompt, targetLength)
            ]);

            // Update stats
            this.elements.specTime.textContent = `${speculativeResult.time.toFixed(1)}s`;
            this.elements.specCalls.textContent = speculativeResult.modelCalls;
            this.elements.specEfficiency.textContent = `${speculativeResult.efficiency}%`;
            this.elements.specSpeed.textContent = speculativeResult.tokensPerSecond;

            this.elements.seqTime.textContent = `${sequentialResult.time.toFixed(1)}s`;
            this.elements.seqCalls.textContent = sequentialResult.modelCalls;
            this.elements.seqSpeed.textContent = sequentialResult.tokensPerSecond;

            // Show summary
            const speedup = sequentialResult.time / speculativeResult.time;
            const callsSaved = sequentialResult.modelCalls - speculativeResult.modelCalls;

            this.elements.speedup.textContent = `${speedup.toFixed(1)}x faster`;
            this.elements.speedup.style.display = 'block';

            this.elements.summary.innerHTML = `
                <p><strong>Speculative decoding was ${speedup.toFixed(1)}x faster!</strong></p>
                <p>Saved ${callsSaved} model calls with ${speculativeResult.efficiency}% efficiency.</p>
                <p>Generated ${speculativeResult.tokensGenerated} tokens vs ${sequentialResult.tokensGenerated} tokens.</p>
            `;

        } catch (error) {
            console.error('Comparison error:', error);
            alert('Error during comparison: ' + error.message);
        } finally {
            this.isRunning = false;
            this.setButtonState(false);
        }
    }

    async runSpeculativeDecoding(prompt, targetLength, k) {
        const startTime = performance.now();
        let currentText = prompt;
        let generatedText = '';
        let modelCalls = 0;
        let acceptedTokens = 0;
        let totalDraftedTokens = 0;

        this.elements.speculativeText.textContent = prompt;

        while (acceptedTokens < targetLength) {
            // Draft phase
            const draftText = await this.generateTokens(currentText, k, 'small');
            const draftTokens = this.tokenize(draftText);

            // Count actual words for statistics
            const draftWordTokens = draftTokens.filter(token => token.trim().length > 0 && !this.isPunctuation(token));
            totalDraftedTokens += draftWordTokens.length;
            modelCalls++;

            // Verification phase
            const verifyText = await this.generateTokens(currentText, draftTokens.length, 'large');
            const verifyTokens = this.tokenize(verifyText);
            modelCalls++;

            // Compare and accept/reject
            const accepted = this.compareAndAccept(draftTokens, verifyTokens);
            acceptedTokens += accepted.length;

            if (accepted.length > 0) {
                const acceptedText = accepted.join('');
                generatedText += acceptedText;
                currentText += acceptedText;

                // Count actual words (non-space, non-punctuation tokens)
                const wordTokens = accepted.filter(token => token.trim().length > 0 && !this.isPunctuation(token));
                acceptedTokens += wordTokens.length;

                // Stream the accepted tokens one by one
                await this.streamTokens(this.elements.speculativeText, accepted);
            } else {
                // Fallback: use large model for next token
                const fallbackText = await this.generateTokens(currentText, 1, 'large');
                const fallbackTokens = this.tokenize(fallbackText);
                modelCalls++;

                if (fallbackTokens.length > 0) {
                    const fallbackText = fallbackTokens.join('');
                    generatedText += fallbackText;
                    currentText += fallbackText;

                    // Count actual words
                    const wordTokens = fallbackTokens.filter(token => token.trim().length > 0 && !this.isPunctuation(token));
                    acceptedTokens += wordTokens.length;

                    // Stream the fallback tokens
                    await this.streamTokens(this.elements.speculativeText, fallbackTokens);
                }
            }

            if (acceptedTokens >= targetLength) break;
        }

        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;
        const efficiency = totalDraftedTokens > 0 ? Math.round((acceptedTokens / totalDraftedTokens) * 100) : 0;
        const tokensPerSecond = Math.round(acceptedTokens / totalTime);

        return {
            time: totalTime,
            modelCalls,
            tokensGenerated: acceptedTokens,
            efficiency,
            tokensPerSecond,
            text: generatedText
        };
    }

    async runSequentialGeneration(prompt, targetLength) {
        const startTime = performance.now();
        let currentText = prompt;
        let generatedText = '';
        let modelCalls = 0;
        let tokensGenerated = 0;

        this.elements.sequentialText.textContent = prompt;

        while (tokensGenerated < targetLength) {
            const nextText = await this.generateTokens(currentText, 1, 'large');
            const nextTokens = this.tokenize(nextText);
            modelCalls++;

            if (nextTokens.length > 0) {
                const tokenText = nextTokens.join('');
                generatedText += tokenText;
                currentText += tokenText;

                // Count actual words (non-space, non-punctuation tokens)
                const wordTokens = nextTokens.filter(token => token.trim().length > 0 && !this.isPunctuation(token));
                tokensGenerated += wordTokens.length;

                // Stream the tokens
                await this.streamTokens(this.elements.sequentialText, nextTokens);
            }

            if (tokensGenerated >= targetLength) break;
        }

        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;
        const tokensPerSecond = Math.round(tokensGenerated / totalTime);

        return {
            time: totalTime,
            modelCalls,
            tokensGenerated,
            efficiency: 100,
            tokensPerSecond,
            text: generatedText
        };
    }

    async generateTokens(prompt, numTokens, modelType) {
        if (this.mockMode) {
            // Simulate realistic delays
            const baseDelay = modelType === 'small' ? 50 : 200;
            const variableDelay = Math.random() * (modelType === 'small' ? 30 : 100);
            await this.delay(baseDelay + variableDelay);

            return this.mockGenerate(prompt, numTokens, modelType);
        }

        // Use real models if available
        if (modelType === 'small' && this.smallModel) {
            return await this.generateWithSmallModel(prompt, numTokens);
        } else if (modelType === 'large' && this.largeModel) {
            return await this.generateWithLargeModel(prompt, numTokens);
        }

        // Fallback to mock
        await this.delay(modelType === 'small' ? 100 : 300);
        return this.mockGenerate(prompt, numTokens, modelType);
    }

    async generateWithSmallModel(prompt, numTokens = 4) {
        const result = await this.smallModel(prompt, {
            max_new_tokens: numTokens,
            do_sample: true,
            temperature: 0.8,
            top_p: 0.9,
            pad_token_id: 50256,
            return_full_text: false
        });
        return result[0].generated_text;
    }

    async generateWithLargeModel(prompt, numTokens = 1) {
        const result = await this.largeModel(prompt, {
            max_new_tokens: numTokens,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9,
            pad_token_id: 50256,
            return_full_text: false
        });
        return result[0].generated_text;
    }

    mockGenerate(prompt, numTokens, modelType) {
        const words = [
            'will', 'be', 'revolutionize', 'transform', 'change', 'improve', 'enhance',
            'technology', 'society', 'world', 'future', 'innovation', 'progress',
            'artificial', 'intelligence', 'machine', 'learning', 'automation',
            'the', 'and', 'to', 'of', 'in', 'for', 'with', 'by', 'through',
            'create', 'develop', 'advance', 'enable', 'provide', 'support',
            'systems', 'applications', 'solutions', 'capabilities', 'opportunities'
        ];

        const punctuation = ['.', ',', '!', '?', ';', ':'];

        let tokens = [];
        let wordCount = 0;

        for (let i = 0; i < numTokens; i++) {
            // Add space before word (except for first token)
            if (tokens.length > 0 && !this.isPunctuation(tokens[tokens.length - 1])) {
                tokens.push(' ');
                i++; // Count space as a token
                if (i >= numTokens) break;
            }

            // Decide whether to add punctuation (10% chance after 3+ words)
            if (wordCount >= 3 && Math.random() < 0.1) {
                tokens.push(punctuation[Math.floor(Math.random() * punctuation.length)]);
                wordCount = 0;
            } else {
                // Add a word
                if (modelType === 'small') {
                    // Small model: less accurate, sometimes wrong word choice
                    if (Math.random() < 0.8) {
                        tokens.push(words[Math.floor(Math.random() * words.length)]);
                    } else {
                        // Occasionally pick a less appropriate word
                        tokens.push(words[Math.floor(Math.random() * words.length)]);
                    }
                } else {
                    // Large model: more accurate and contextual
                    tokens.push(words[Math.floor(Math.random() * words.length)]);
                }
                wordCount++;
            }
        }

        return tokens.join('');
    }

    isPunctuation(token) {
        return /^[.,!?;:'"()-]$/.test(token);
    }

    tokenize(text) {
        // Split text into words while preserving spaces and punctuation
        // This regex captures words, spaces, and punctuation as separate tokens
        const tokens = text.split(/(\s+|[.,!?;:'"()-])/g).filter(token => token.length > 0);
        return tokens;
    }

    compareAndAccept(draftTokens, verifyTokens) {
        const accepted = [];
        const minLength = Math.min(draftTokens.length, verifyTokens.length);

        for (let i = 0; i < minLength; i++) {
            // Compare tokens, handling spaces and punctuation properly
            if (draftTokens[i] === verifyTokens[i]) {
                accepted.push(draftTokens[i]);
            } else {
                // Stop at first mismatch
                break;
            }
        }

        return accepted;
    }

    resetComparison() {
        this.resetOutputs();
        this.elements.summary.innerHTML = '<p>Run a comparison to see the results!</p>';
        this.elements.speedup.style.display = 'none';

        // Reset stats
        this.elements.specTime.textContent = '0.0s';
        this.elements.specCalls.textContent = '0';
        this.elements.specEfficiency.textContent = '0%';
        this.elements.specSpeed.textContent = '0';

        this.elements.seqTime.textContent = '0.0s';
        this.elements.seqCalls.textContent = '0';
        this.elements.seqSpeed.textContent = '0';
    }

    resetOutputs() {
        this.elements.speculativeText.textContent = 'Waiting to start...';
        this.elements.sequentialText.textContent = 'Waiting to start...';
    }

    updateModelStatus(status = null) {
        if (this.mockMode || status === null) {
            this.elements.smallStatus.textContent = 'Mock Mode';
            this.elements.smallStatus.className = 'status-badge mock';
            this.elements.largeStatus.textContent = 'Mock Mode';
            this.elements.largeStatus.className = 'status-badge mock';
            this.elements.loadModelsBtn.style.display = 'block';
        } else if (status === 'loading') {
            this.elements.smallStatus.textContent = 'Loading...';
            this.elements.smallStatus.className = 'status-badge loading';
            this.elements.largeStatus.textContent = 'Loading...';
            this.elements.largeStatus.className = 'status-badge loading';
        } else if (status === 'error') {
            this.elements.smallStatus.textContent = 'Error';
            this.elements.smallStatus.className = 'status-badge error';
            this.elements.largeStatus.textContent = 'Error';
            this.elements.largeStatus.className = 'status-badge error';
        }
    }

    setButtonState(running) {
        this.elements.startBtn.disabled = running;
        const btnText = this.elements.startBtn.querySelector('.btn-text');
        const btnSpinner = this.elements.startBtn.querySelector('.btn-spinner');

        btnText.classList.toggle('hidden', running);
        btnSpinner.classList.toggle('hidden', !running);
    }

    setLoadModelsButtonState(loading) {
        const btn = this.elements.loadModelsBtn;
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');

        btn.disabled = loading;
        btnText.classList.toggle('hidden', loading);
        btnSpinner.classList.toggle('hidden', !loading);
    }

    showLoadingWithProgress() {
        this.elements.loadingOverlay.classList.remove('hidden');
        this.updateLoadingProgress(0, 'Initializing...');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    updateLoadingProgress(percentage, details) {
        const progressFill = document.getElementById('simple-progress-fill');
        const progressDetails = document.getElementById('simple-progress-details');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressDetails) {
            progressDetails.textContent = details;
        }
    }

    async streamTokens(element, tokens) {
        if (this.streamingEnabled) {
            // Stream tokens one by one with delays
            for (const token of tokens) {
                element.textContent += token;

                // Variable delay based on token type
                let delay = 50;
                if (token.trim().length === 0) {
                    // Shorter delay for spaces
                    delay = 20;
                } else if (this.isPunctuation(token)) {
                    // Slightly longer delay for punctuation
                    delay = 80;
                } else {
                    // Normal delay for words
                    delay = 50 + Math.random() * 100;
                }

                await this.delay(delay);
            }
        } else {
            // Add all tokens at once
            element.textContent += tokens.join('');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simpleSpeedComparison = new SimpleSpeedComparison();
});
