import Quill from 'quill';

type SpeechToTextOptions = {
    language?: string;
    continuous?: boolean;
    visualizer?: boolean;
    waveformColor?: string;
    histogramColor?: string;
    debug?: boolean;
    buttonTitleStart?: string;
    buttonTitleStop?: string;
    titleInactive?: string;
    titleActive?: string;
};

type MaybeRecognition = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((this: any, ev: any) => any) | null;
    onerror: ((this: any, ev: any) => any) | null;
    onend: ((this: any, ev: any) => any) | null;
};

const getSpeechRecognitionCtor = (): new () => MaybeRecognition | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = typeof window !== 'undefined' ? window : {};
    return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as new () => MaybeRecognition | null;
};

const getAudioContextCtor = (): { new (): AudioContext } | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = typeof window !== 'undefined' ? window : {};
    return (w.AudioContext || w.webkitAudioContext || null) as { new (): AudioContext } | null;
};

const ensureBaseStyles = () => {
    if (document.getElementById('ql-stt-styles')) return;
    const style = document.createElement('style');
    style.id = 'ql-stt-styles';
    style.textContent = `
.ql-stt-bar {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e4e7ec;
  box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 0 0 1px rgba(16,24,40,0.02) inset;
  box-sizing: border-box;
  user-select: none;
}
.ql-stt-bar[data-compact="true"] {
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 8px;
}
.ql-stt-mic {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--stt-accent, #25D366);
}
.ql-stt-label {
  font-size: 12px;
  color: #667085;
  min-width: 110px;
  white-space: nowrap;
}
.ql-stt-bar.is-listening .ql-stt-label {
  color: var(--stt-accent, #25D366);
}
.ql-stt-bars {
  flex: 1 1 auto;
  height: 16px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
}
.ql-stt-bar-col {
  width: 4px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--stt-accent, #25D366) 0%, var(--stt-accent-2, #4285f4) 100%);
  transform-origin: 50% 100%;
  opacity: .85;
  transition: height 60ms linear, opacity 120ms ease;
}
.ql-stt-bar.is-listening .ql-stt-bar-col { opacity: 1; }

.ql-stt-action {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid #e4e7ec;
  background: #fff;
  color: #344054;
  cursor: pointer;
  padding: 0;
  margin-right: 8px;
  transition: background .15s ease, color .15s ease, border-color .15s ease, box-shadow .2s ease;
}
.ql-stt-action svg { width: 16px; height: 16px; display: block; }
.ql-stt-action:hover { background: #f9fafb; }
.ql-stt-bar.is-listening .ql-stt-action {
  background: var(--stt-accent, #25D366);
  color: #fff;
  border-color: var(--stt-accent, #25D366);
}
.ql-stt-action:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,211,102,0.25); }
`;
    document.head.appendChild(style);
};

export default class SpeechToText {
    private quill: Quill;
    private options: Required<SpeechToTextOptions>;
    private recognition: MaybeRecognition | null = null;
    private isListening = false;

    private toolbarButton: HTMLButtonElement | null = null;
    private actionButton: HTMLButtonElement | null = null;

    // Barre inférieure
    private bottomBar: HTMLDivElement | null = null;
    private labelEl: HTMLSpanElement | null = null;
    private barsContainer: HTMLDivElement | null = null;
    private barCols: HTMLDivElement[] = [];

    // Ancrage de dictée (append à un seul endroit)
    private dictationAnchorIndex: number | null = null;
    private appendedChars = 0;

    // Audio
    private audioCtx: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;
    private animationId: number | null = null;

    constructor(quill: Quill, options: SpeechToTextOptions = {}) {
        this.quill = quill;
        this.options = {
            language: options.language ?? 'fr-FR',
            continuous: options.continuous ?? false,
            visualizer: options.visualizer ?? true,
            waveformColor: options.waveformColor ?? '#4285f4',
            histogramColor: options.histogramColor ?? '#25D366',
            debug: options.debug ?? false,
            buttonTitleStart: options.buttonTitleStart ?? 'Start listening',
            buttonTitleStop: options.buttonTitleStop ?? 'Stop listening',
            titleInactive: options.titleInactive ?? 'Inactive',
            titleActive: options.titleActive ?? 'Listening...',
        };
        if (this.options.debug) {
            console.log('debug activated, Speak to see what is recognized');
        }

        const SpeechRecognition = getSpeechRecognitionCtor();
        if (!SpeechRecognition) {
            console.warn('[SpeechToText] Web Speech API non supportée par ce navigateur.');
            this.renderUnavailableUI();
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.options.language;
        this.recognition.continuous = this.options.continuous;
        this.recognition.interimResults = true;

        this.bindRecognitionEvents();
        this.renderUI();
    }

    private bindRecognitionEvents() {
        if (!this.recognition) return;

        this.recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const res = event.results[i];
                const text = res[0]?.transcript || '';
                if (res.isFinal) {
                    finalText += text + ' ';
                } else {
                    // on ne garde que le dernier interim pour l’aperçu
                    interimText = text;
                }
            }

            if (interimText && this.labelEl) {
                this.labelEl.textContent = `STT: ${this.options.titleActive} ${interimText}`;
            }

            if (finalText) {
                if (this.options.debug) {
                    console.log('[SpeechToText] segment final:', finalText);
                }
                this.insertFinalTranscript(finalText);
                if (this.labelEl) {
                    this.labelEl.textContent = `STT: ${this.options.titleActive}`;
                }
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('[SpeechToText] Erreur de reconnaissance vocale:', event?.error || event);
            this.updateUIState(false);
            this.stopVisualizer();
        };

        this.recognition.onend = () => {
            if (this.options.continuous && this.isListening) {
                try {
                    this.recognition?.start();
                } catch {
                    setTimeout(() => {
                        try {
                            this.recognition?.start();
                        } catch {
                            this.updateUIState(false);
                            this.stopVisualizer();
                        }
                    }, 300);
                }
            } else {
                this.updateUIState(false);
                this.stopVisualizer();
            }
        };
    }

    private insertTranscript(text: string) {
        const sel = this.quill.getSelection(true);
        const index = sel ? sel.index : this.quill.getLength();
        this.quill.insertText(index, text, 'user');
        this.quill.setSelection(index + text.length, 0, 'user');
    }

    private insertFinalTranscript(text: string) {
        // Insère à la position d’ancrage + longueur déjà ajoutée
        const baseIndex = this.dictationAnchorIndex ?? this.quill.getLength();
        const insertIndex = baseIndex + this.appendedChars;

        this.quill.insertText(insertIndex, text, 'user');
        this.appendedChars += text.length;

        // Positionner le curseur en fin de dictée
        this.quill.setSelection(baseIndex + this.appendedChars, 0, 'user');
    }

    private renderUI() {
        ensureBaseStyles();

        // Bouton placé à côté de la barre sous l’éditeur (aucun bouton dans la toolbar)
        this.toolbarButton = null;

        // Barre en dessous (toujours visible); l’égaliseur n’est créé que si visualizer=true
        const container = (this.quill as any).container as HTMLElement;
        const parent = container.parentElement;

        const bar = document.createElement('div');
        bar.className = 'ql-stt-bar';
        // Expose couleurs via CSS variables
        bar.style.setProperty('--stt-accent', this.options.histogramColor);
        bar.style.setProperty('--stt-accent-2', this.options.waveformColor);

        const label = document.createElement('span');
        label.className = 'ql-stt-label';
        label.textContent = 'STT: ' + this.options.titleInactive;

        let bars: HTMLDivElement | null = null;
        const cols: HTMLDivElement[] = [];
        if (this.options.visualizer) {
            bars = document.createElement('div');
            bars.className = 'ql-stt-bars';

            // Crée un égaliseur de 14 colonnes
            for (let i = 0; i < 14; i++) {
                const col = document.createElement('div');
                col.className = 'ql-stt-bar-col';
                bars.appendChild(col);
                cols.push(col);
            }
        }

        // Bouton icône (start/stop) placé tout à gauche
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'ql-stt-action';
        action.innerHTML = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
</svg>`.trim();
        action.title = this.options.buttonTitleStart;
        action.setAttribute('aria-pressed', 'false');
        action.onclick = () => this.toggle();

        bar.appendChild(action);
        bar.appendChild(label);
        if (bars) {
            bar.appendChild(bars);
        }

        if (parent) {
            parent.insertBefore(bar, container.nextSibling);
        } else {
            container.appendChild(bar);
        }

        this.bottomBar = bar;
        this.labelEl = label;
        this.barsContainer = bars;
        this.barCols = cols;
        this.actionButton = action;
    }

    private renderUnavailableUI() {
        const toolbar: any = this.quill.getModule('toolbar');
        if (toolbar?.container) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ql-stt';
            btn.disabled = true;
            btn.innerText = '🎤';
            btn.title = 'Reconnaissance vocale non supportée';
            toolbar.container.appendChild(btn);
            this.toolbarButton = btn;
        }
    }

    private updateUIState(listening: boolean) {
        this.isListening = listening;

        if (this.toolbarButton) {
            this.toolbarButton.style.color = listening ? this.options.histogramColor : '';
        }

        if (this.labelEl) {
            this.labelEl.textContent = listening ? 'STT: ' + this.options.titleActive : 'STT: ' + this.options.titleInactive;
            this.labelEl.style.color = listening ? this.options.histogramColor : '#667085';
        }

        if (this.bottomBar) {
            this.bottomBar.classList.toggle('is-listening', listening);
        }

        if (this.actionButton) {
            this.actionButton.title = listening ? this.options.buttonTitleStop : this.options.buttonTitleStart;
            this.actionButton.setAttribute('aria-pressed', listening ? 'true' : 'false');
        }

        if (this.options.visualizer) {
            if (listening) {
                this.startVisualizer().catch(() => {
                    // Repli: animation douce même sans micro
                    this.startFallbackAnimation();
                });
            } else {
                this.stopVisualizer();
            }
        }
    }

    private async startVisualizer() {
        // si déjà actif, ne pas dupliquer
        if (this.animationId) return;

        const AudioCtxCtor = getAudioContextCtor();
        if (!AudioCtxCtor) {
            this.startFallbackAnimation();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;

            this.audioCtx = new AudioCtxCtor();
            const source = this.audioCtx.createMediaStreamSource(stream);

            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 128;
            this.analyser.smoothingTimeConstant = 0.85;

            source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                if (!this.analyser || !this.barCols.length) return;
                this.analyser.getByteFrequencyData(dataArray);

                const cols = this.barCols.length;
                for (let i = 0; i < cols; i++) {
                    const percent = i / (cols - 1 || 1);
                    // map index non-linéaire pour une animation agréable
                    const idx = Math.min(bufferLength - 1, Math.floor(Math.pow(percent, 0.8) * bufferLength));
                    const v = dataArray[idx] / 255; // 0..1
                    const height = Math.max(2, Math.floor(2 + v * 16)); // 2..18px
                    this.barCols[i].style.height = `${height}px`;
                }

                this.animationId = requestAnimationFrame(draw);
            };

            this.animationId = requestAnimationFrame(draw);
        } catch (e) {
            // Permission micro refusée
            this.startFallbackAnimation();
        }
    }

    private startFallbackAnimation() {
        if (this.animationId) return;
        // Animation douce pseudo-aléatoire
        let t = 0;
        const draw = () => {
            const cols = this.barCols.length;
            for (let i = 0; i < cols; i++) {
                const phase = (t * 0.12 + i * 0.45);
                const v = (Math.sin(phase) + 1) / 2; // 0..1
                const height = Math.max(2, Math.floor(2 + v * 16));
                this.barCols[i].style.height = `${height}px`;
            }
            t++;
            this.animationId = requestAnimationFrame(draw);
        };
        this.animationId = requestAnimationFrame(draw);
    }

    private stopVisualizer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Réinitialise les colonnes
        if (this.barCols.length) {
            for (const col of this.barCols) {
                col.style.height = '2px';
            }
        }
        if (this.analyser) {
            try { this.analyser.disconnect(); } catch (e) { if (this.options.debug) { console.warn('[SpeechToText] analyser.disconnect() a échoué', e); } }
            this.analyser = null;
        }
        if (this.audioCtx) {
            try { this.audioCtx.close(); } catch (e) { if (this.options.debug) { console.warn('[SpeechToText] audioCtx.close() a échoué', e); } }
            this.audioCtx = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
    }

    private start() {
        if (!this.recognition || this.isListening) return;
        try {
            const sel = this.quill.getSelection(true);
            this.dictationAnchorIndex = sel ? sel.index : this.quill.getLength();
            this.appendedChars = 0;

            this.recognition.start();
            this.updateUIState(true);
        } catch (e) {
            if (this.options.debug) {
                console.warn('[SpeechToText] recognition.start() a échoué (peut-être déjà en cours)', e);
            }
        }
    }

    private stop() {
        if (!this.recognition || !this.isListening) return;
        try {
            this.recognition.stop();
        } catch (e) {
            if (this.options.debug) {
                console.warn('[SpeechToText] recognition.stop() a échoué, tentative abort()', e);
            }
            try {
                this.recognition.abort();
            } catch (abortErr) {
                if (this.options.debug) {
                    console.warn('[SpeechToText] recognition.abort() a échoué', abortErr);
                }
            }
        }
        // Réinit de la session de dictée
        this.dictationAnchorIndex = null;
        this.appendedChars = 0;

        this.updateUIState(false);
    }

    private toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }
}
