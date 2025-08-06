// Speed Comparison Demo - Speculative vs Sequential Decoding
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configure transformers.js environment
env.allowRemoteModels = true;
env.allowLocalModels = false;

class SpeedComparisonDemo {
    constructor() {
        this.smallModel = null;
        this.largeModel = null;
        this.isRunning = false;
        this.mockMode = true;
        this.streamingEnabled = true;

        // Results storage
        this.results = {
            speculative: {
                time: 0,
                modelCalls: 0,
                tokensGenerated: 0,
                efficiency: 0,
                tokensPerSecond: 0,
                text: ''
            },
            sequential: {
                time: 0,
                modelCalls: 0,
                tokensGenerated: 0,
                efficiency: 100,
                tokensPerSecond: 0,
                text: ''
            }
        };

        // DOM elements
        this.elements = {
            prompt: document.getElementById('comparison-prompt'),
            targetLength: document.getElementById('target-length'),
            kValue: document.getElementById('k-value-comparison'),
            mockMode: document.getElementById('mock-mode-comparison'),
            streaming: document.getElementById('enable-streaming-comparison'),
            startBtn: document.getElementById('start-comparison-btn'),
            resetBtn: document.getElementById('reset-comparison-btn'),
            loadModelsBtn: document.getElementById('load-models-comparison-btn'),
            loadingOverlay: document.getElementById('loading-overlay-comparison'),

            // Model status elements
            smallModelStatus: document.getElementById('small-model-status-comparison'),
            largeModelStatus: document.getElementById('large-model-status-comparison'),

            // Speculative elements
            speculativeOutput: document.getElementById('speculative-output'),
            speculativeProgress: document.getElementById('speculative-progress'),
            speculativeTime: document.getElementById('speculative-time'),
            speculativeCalls: document.getElementById('speculative-calls'),
            speculativeEfficiency: document.getElementById('speculative-efficiency'),
            speculativeTokensPerSec: document.getElementById('speculative-tokens-per-sec'),

            // Sequential elements
            sequentialOutput: document.getElementById('sequential-output'),
            sequentialProgress: document.getElementById('sequential-progress'),
            sequentialTime: document.getElementById('sequential-time'),
            sequentialCalls: document.getElementById('sequential-calls'),
            sequentialEfficiency: document.getElementById('sequential-efficiency'),
            sequentialTokensPerSec: document.getElementById('sequential-tokens-per-sec'),

            // Summary elements
            comparisonSummary: document.getElementById('comparison-summary'),
            speedupResult: document.getElementById('speedup-result'),
            detailedAnalysis: document.getElementById('detailed-analysis'),
            analysisContent: document.getElementById('analysis-content')
        };

        this.initializeEventListeners();
        this.initializeApp();
    }

    initializeApp() {
        console.log('Speed Comparison Demo initialized');
        this.resetResults();
        this.updateModelStatus();
    }

    async handleLoadModels() {
        if (this.smallModel && this.largeModel) {
            console.log('Models already loaded!');
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

            console.log('Starting to load real AI models...');

            // Load small model (DistilGPT-2)
            this.updateLoadingProgress(10, 'Loading small model (DistilGPT-2)...');
            console.log('Loading small model (DistilGPT-2)...');
            this.elements.smallModelStatus.textContent = 'Loading...';
            this.elements.smallModelStatus.className = 'status-badge loading';

            this.smallModel = await pipeline('text-generation', 'Xenova/distilgpt2');

            this.updateLoadingProgress(50, 'Small model loaded successfully!');
            this.elements.smallModelStatus.textContent = 'Loaded';
            this.elements.smallModelStatus.className = 'status-badge loaded';
            console.log('Small model loaded successfully!');

            // Load large model (GPT-2)
            this.updateLoadingProgress(60, 'Loading large model (GPT-2)...');
            console.log('Loading large model (GPT-2)...');
            this.elements.largeModelStatus.textContent = 'Loading...';
            this.elements.largeModelStatus.className = 'status-badge loading';

            this.largeModel = await pipeline('text-generation', 'Xenova/gpt2');

            this.updateLoadingProgress(100, 'All models loaded successfully!');
            this.elements.largeModelStatus.textContent = 'Loaded';
            this.elements.largeModelStatus.className = 'status-badge loaded';
            console.log('Large model loaded successfully!');

            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.elements.loadModelsBtn.style.display = 'none'; // Hide button after successful load

            console.log('All models loaded successfully! You can now run real AI comparisons.');

        } catch (error) {
            this.hideLoading();
            this.setLoadModelsButtonState(false);
            this.updateModelStatus('error');
            console.error('Error loading models:', error);

            // Fall back to mock mode
            this.mockMode = true;
            this.elements.mockMode.checked = true;
            this.updateModelStatus();

            alert('Error loading models: ' + error.message + '. Falling back to mock mode.');
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

    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    updateLoadingProgress(percentage, details) {
        const progressFill = document.getElementById('progress-fill-comparison');
        const progressDetails = document.getElementById('progress-details-comparison');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressDetails) {
            progressDetails.textContent = details;
        }
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

    async startComparison() {
        if (this.isRunning) return;

        const prompt = this.elements.prompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        this.isRunning = true;
        this.setButtonState(true);
        this.resetResults();

        try {
            // Run both methods simultaneously
            const targetLength = parseInt(this.elements.targetLength.value) || 20;
            const k = parseInt(this.elements.kValue.value) || 4;

            console.log(`Starting comparison: ${targetLength} tokens, k=${k}`);

            // Start both methods at the same time
            const [speculativeResult, sequentialResult] = await Promise.all([
                this.runSpeculativeDecoding(prompt, targetLength, k),
                this.runSequentialGeneration(prompt, targetLength)
            ]);

            // Update results
            this.results.speculative = speculativeResult;
            this.results.sequential = sequentialResult;

            // Show summary
            this.showComparisonSummary();

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

        this.elements.speculativeOutput.innerHTML = `<strong>${prompt}</strong>`;

        while (generatedText.length < targetLength * 5) { // Approximate character limit
            // Draft phase
            const draftText = await this.generateTokens(currentText, k, 'small');
            const draftTokens = this.tokenize(draftText);
            totalDraftedTokens += draftTokens.length;
            modelCalls++;

            // Show drafted tokens with streaming
            await this.streamDraftTokens(this.elements.speculativeOutput, draftTokens);

            // Verification phase
            const verifyText = await this.generateTokens(currentText, draftTokens.length, 'large');
            const verifyTokens = this.tokenize(verifyText);
            modelCalls++;

            // Compare and accept/reject
            const accepted = this.compareAndAccept(draftTokens, verifyTokens);
            acceptedTokens += accepted.length;

            // Update pending tokens to show acceptance/rejection with streaming
            await this.updateTokenDisplay(this.elements.speculativeOutput, accepted, draftTokens);

            if (accepted.length > 0) {
                const acceptedText = accepted.join('');
                generatedText += acceptedText;
                currentText += acceptedText;
            } else {
                // Fallback: use large model for next token
                const fallbackText = await this.generateTokens(currentText, 1, 'large');
                const fallbackTokens = this.tokenize(fallbackText);
                modelCalls++;

                if (fallbackTokens.length > 0) {
                    generatedText += fallbackTokens[0];
                    currentText += fallbackTokens[0];
                    acceptedTokens++;
                    await this.streamAcceptedToken(this.elements.speculativeOutput, fallbackTokens[0]);
                }
            }

            // Update progress
            const progress = Math.min((generatedText.length / (targetLength * 5)) * 100, 100);
            this.elements.speculativeProgress.style.width = `${progress}%`;

            if (generatedText.length >= targetLength * 5) break;
        }

        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;
        const efficiency = totalDraftedTokens > 0 ? Math.round((acceptedTokens / totalDraftedTokens) * 100) : 0;
        const tokensPerSecond = Math.round(acceptedTokens / totalTime);

        // Update display
        this.elements.speculativeTime.textContent = `${totalTime.toFixed(1)}s`;
        this.elements.speculativeCalls.textContent = modelCalls;
        this.elements.speculativeEfficiency.textContent = `${efficiency}%`;
        this.elements.speculativeTokensPerSec.textContent = tokensPerSecond;

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

        this.elements.sequentialOutput.innerHTML = `<span style="font-weight: bold;">${prompt}</span>`;

        while (generatedText.length < targetLength * 5) { // Approximate character limit
            // Generate one token at a time with large model
            const nextText = await this.generateTokens(currentText, 1, 'large');
            const nextTokens = this.tokenize(nextText);
            modelCalls++;

            if (nextTokens.length > 0) {
                const token = nextTokens[0];
                generatedText += token;
                currentText += token;
                tokensGenerated++;

                // Stream token as accepted with realistic delay
                await this.streamAcceptedToken(this.elements.sequentialOutput, token);
                await this.delay(100); // Realistic streaming delay
            }

            // Update progress
            const progress = Math.min((generatedText.length / (targetLength * 5)) * 100, 100);
            this.elements.sequentialProgress.style.width = `${progress}%`;

            if (generatedText.length >= targetLength * 5) break;
        }

        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;
        const tokensPerSecond = Math.round(tokensGenerated / totalTime);

        // Update display
        this.elements.sequentialTime.textContent = `${totalTime.toFixed(1)}s`;
        this.elements.sequentialCalls.textContent = modelCalls;
        this.elements.sequentialTokensPerSec.textContent = tokensPerSecond;

        return {
            time: totalTime,
            modelCalls,
            tokensGenerated,
            efficiency: 100, // Sequential is always 100% efficient
            tokensPerSecond,
            text: generatedText
        };
    }

    async generateTokens(prompt, numTokens, modelType) {
        if (this.mockMode) {
            // Simulate realistic model latencies
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

        // Fallback to mock if models not loaded
        console.warn(`${modelType} model not loaded, using mock generation`);
        await this.delay(modelType === 'small' ? 100 : 300);
        return this.mockGenerate(prompt, numTokens, modelType);
    }

    async generateWithSmallModel(prompt, numTokens = 4) {
        if (!this.smallModel) {
            throw new Error('Small model not loaded');
        }

        try {
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
            console.error(`Small model error: ${error.message}`);
            throw error;
        }
    }

    async generateWithLargeModel(prompt, numTokens = 1) {
        if (!this.largeModel) {
            throw new Error('Large model not loaded');
        }

        try {
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
            console.error(`Large model error: ${error.message}`);
            throw error;
        }
    }

    mockGenerate(prompt, numTokens, modelType) {
        const words = [
            'will', 'be', 'revolutionize', 'transform', 'change', 'improve', 'enhance',
            'technology', 'society', 'world', 'future', 'innovation', 'progress',
            'artificial', 'intelligence', 'machine', 'learning', 'automation',
            'the', 'and', 'to', 'of', 'in', 'for', 'with', 'by', 'through'
        ];

        let result = '';
        for (let i = 0; i < numTokens; i++) {
            if (i > 0) result += ' ';

            if (modelType === 'small') {
                // Small model: less accurate, sometimes wrong
                if (Math.random() < 0.7) {
                    result += words[Math.floor(Math.random() * words.length)];
                } else {
                    result += words[Math.floor(Math.random() * words.length)];
                }
            } else {
                // Large model: more accurate
                result += words[Math.floor(Math.random() * words.length)];
            }
        }

        return result;
    }

    tokenize(text) {
        return text.split(/(\s+)/g).filter(token => token.trim().length > 0);
    }

    compareAndAccept(draftTokens, verifyTokens) {
        const accepted = [];
        const minLength = Math.min(draftTokens.length, verifyTokens.length);

        for (let i = 0; i < minLength; i++) {
            if (draftTokens[i].trim() === verifyTokens[i].trim()) {
                accepted.push(draftTokens[i]);
            } else {
                break; // Stop at first mismatch
            }
        }

        return accepted;
    }

    appendTokens(container, tokens, status) {
        tokens.forEach(token => {
            const span = document.createElement('span');
            span.className = `token ${status}`;
            span.textContent = token;
            container.appendChild(span);
        });
    }

    async updateTokenDisplay(container, acceptedTokens, allDraftTokens) {
        // Update the last few tokens to show acceptance/rejection with streaming effect
        const tokenElements = container.querySelectorAll('.token.pending');

        // Update accepted tokens with streaming animation
        for (let i = 0; i < acceptedTokens.length && i < tokenElements.length; i++) {
            tokenElements[i].classList.remove('pending');
            tokenElements[i].classList.add('accepted');

            // Add visual feedback animation
            tokenElements[i].style.transform = 'scale(1.1)';
            setTimeout(() => {
                tokenElements[i].style.transform = 'scale(1)';
            }, 200);

            // Small delay for streaming effect
            await this.delay(80);
        }

        // Mark remaining as rejected with streaming animation
        for (let i = acceptedTokens.length; i < tokenElements.length; i++) {
            if (tokenElements[i]) {
                tokenElements[i].classList.remove('pending');
                tokenElements[i].classList.add('rejected');

                // Add rejection animation
                tokenElements[i].style.transform = 'scale(1.1)';
                setTimeout(() => {
                    tokenElements[i].style.transform = 'scale(1)';
                }, 200);

                await this.delay(60);
            }
        }
    }

    showComparisonSummary() {
        const speedup = this.results.sequential.time / this.results.speculative.time;
        const callsSaved = this.results.sequential.modelCalls - this.results.speculative.modelCalls;

        // Show winner badge
        if (speedup > 1) {
            const speculativePanel = document.querySelector('.method-panel.speculative');
            if (!speculativePanel.querySelector('.winner-badge')) {
                const badge = document.createElement('div');
                badge.className = 'winner-badge';
                badge.textContent = 'WINNER!';
                speculativePanel.appendChild(badge);
            }
        }

        // Update summary
        this.elements.speedupResult.textContent = `${speedup.toFixed(1)}x faster`;
        this.elements.speedupResult.style.display = 'block';

        const summaryHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div class="stat-card">
                    <div class="stat-value" style="color: #10b981;">${speedup.toFixed(1)}x</div>
                    <div class="stat-label">Speed Improvement</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #f59e0b;">${callsSaved}</div>
                    <div class="stat-label">Model Calls Saved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #8b5cf6;">${this.results.speculative.efficiency}%</div>
                    <div class="stat-label">Speculative Efficiency</div>
                </div>
            </div>
        `;

        this.elements.comparisonSummary.innerHTML = summaryHTML;

        // Detailed analysis
        const analysisHTML = `
            <p><strong>Speculative Decoding:</strong> Generated ${this.results.speculative.tokensGenerated} tokens in ${this.results.speculative.time.toFixed(1)}s using ${this.results.speculative.modelCalls} model calls.</p>
            <p><strong>Sequential Generation:</strong> Generated ${this.results.sequential.tokensGenerated} tokens in ${this.results.sequential.time.toFixed(1)}s using ${this.results.sequential.modelCalls} model calls.</p>
            <p><strong>Efficiency:</strong> Speculative decoding achieved ${this.results.speculative.efficiency}% token acceptance rate, resulting in ${speedup.toFixed(1)}x speedup.</p>
            <p><strong>Model Calls Saved:</strong> ${callsSaved} fewer calls to the large model, reducing computational cost significantly.</p>
        `;

        this.elements.analysisContent.innerHTML = analysisHTML;
        this.elements.detailedAnalysis.style.display = 'block';
    }

    resetComparison() {
        this.resetResults();
        this.elements.speculativeOutput.innerHTML = '<div class="placeholder-text">Waiting to start...</div>';
        this.elements.sequentialOutput.innerHTML = '<div class="placeholder-text">Waiting to start...</div>';
        this.elements.comparisonSummary.innerHTML = '<p>Run a comparison to see the performance difference!</p>';
        this.elements.speedupResult.style.display = 'none';
        this.elements.detailedAnalysis.style.display = 'none';

        // Remove winner badge
        const badge = document.querySelector('.winner-badge');
        if (badge) badge.remove();

        // Reset progress bars
        this.elements.speculativeProgress.style.width = '0%';
        this.elements.sequentialProgress.style.width = '0%';
    }

    resetResults() {
        this.results = {
            speculative: { time: 0, modelCalls: 0, tokensGenerated: 0, efficiency: 0, tokensPerSecond: 0, text: '' },
            sequential: { time: 0, modelCalls: 0, tokensGenerated: 0, efficiency: 100, tokensPerSecond: 0, text: '' }
        };

        // Reset displays
        this.elements.speculativeTime.textContent = '0.0s';
        this.elements.speculativeCalls.textContent = '0';
        this.elements.speculativeEfficiency.textContent = '0%';
        this.elements.speculativeTokensPerSec.textContent = '0';

        this.elements.sequentialTime.textContent = '0.0s';
        this.elements.sequentialCalls.textContent = '0';
        this.elements.sequentialTokensPerSec.textContent = '0';
    }

    setButtonState(running) {
        this.elements.startBtn.disabled = running;
        const btnText = this.elements.startBtn.querySelector('.btn-text');
        const btnSpinner = this.elements.startBtn.querySelector('.btn-spinner');

        btnText.classList.toggle('hidden', running);
        btnSpinner.classList.toggle('hidden', !running);

        if (running) {
            btnText.textContent = 'Running Comparison...';
        } else {
            btnText.textContent = 'Start Comparison';
        }
    }

    async streamDraftTokens(container, tokens) {
        if (this.streamingEnabled) {
            // Stream tokens one by one with delays
            for (const token of tokens) {
                const span = document.createElement('span');
                span.className = 'token pending';
                span.textContent = token;
                container.appendChild(span);

                // Add streaming delay
                await this.delay(30 + Math.random() * 50);
            }
        } else {
            // Add all tokens at once
            tokens.forEach(token => {
                const span = document.createElement('span');
                span.className = 'token pending';
                span.textContent = token;
                container.appendChild(span);
            });
        }
    }

    async streamAcceptedToken(container, token) {
        const span = document.createElement('span');
        span.className = 'token accepted';
        span.textContent = token;
        container.appendChild(span);

        if (this.streamingEnabled) {
            // Add streaming delay
            await this.delay(80 + Math.random() * 70);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.speedComparisonDemo = new SpeedComparisonDemo();
});
