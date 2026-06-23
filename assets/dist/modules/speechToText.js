const getSpeechRecognitionCtor = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = typeof window !== 'undefined' ? window : {};
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
const getAudioContextCtor = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = typeof window !== 'undefined' ? window : {};
  return w.AudioContext || w.webkitAudioContext || null;
};
const ensureBaseStyles = () => {
  if (document.getElementById('ql-stt-styles')) return;
  const style = document.createElement('style');
  style.id = 'ql-stt-styles';
  style.textContent = "\n.ql-stt-bar {\n  width: 100%;\n  min-height: 34px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 6px 12px;\n  border-radius: 10px;\n  background: #ffffff;\n  border: 1px solid #e4e7ec;\n  box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 0 0 1px rgba(16,24,40,0.02) inset;\n  box-sizing: border-box;\n  user-select: none;\n}\n.ql-stt-bar[data-compact=\"true\"] {\n  min-height: 28px;\n  padding: 4px 10px;\n  border-radius: 8px;\n}\n.ql-stt-mic {\n  width: 18px;\n  height: 18px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--stt-accent, #25D366);\n}\n.ql-stt-label {\n  font-size: 12px;\n  color: #667085;\n  min-width: 110px;\n  white-space: nowrap;\n}\n.ql-stt-bar.is-listening .ql-stt-label {\n  color: var(--stt-accent, #25D366);\n}\n.ql-stt-bars {\n  flex: 1 1 auto;\n  height: 16px;\n  display: flex;\n  align-items: flex-end;\n  gap: 2px;\n}\n.ql-stt-bar-col {\n  width: 4px;\n  height: 2px;\n  border-radius: 2px;\n  background: linear-gradient(180deg, var(--stt-accent, #25D366) 0%, var(--stt-accent-2, #4285f4) 100%);\n  transform-origin: 50% 100%;\n  opacity: .85;\n  transition: height 60ms linear, opacity 120ms ease;\n}\n.ql-stt-bar.is-listening .ql-stt-bar-col { opacity: 1; }\n\n.ql-stt-action {\n  width: 28px;\n  height: 28px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 9999px;\n  border: 1px solid #e4e7ec;\n  background: #fff;\n  color: #344054;\n  cursor: pointer;\n  padding: 0;\n  margin-right: 8px;\n  transition: background .15s ease, color .15s ease, border-color .15s ease, box-shadow .2s ease;\n}\n.ql-stt-action svg { width: 16px; height: 16px; display: block; }\n.ql-stt-action:hover { background: #f9fafb; }\n.ql-stt-bar.is-listening .ql-stt-action {\n  background: var(--stt-accent, #25D366);\n  color: #fff;\n  border-color: var(--stt-accent, #25D366);\n}\n.ql-stt-action:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,211,102,0.25); }\n";
  document.head.appendChild(style);
};
export default class SpeechToText {
  constructor(quill, options) {
    var _options$language, _options$continuous, _options$visualizer, _options$waveformColo, _options$histogramCol, _options$debug, _options$buttonTitleS, _options$buttonTitleS2, _options$titleInactiv, _options$titleStartin, _options$titleActive;
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.recognition = null;
    this.currentSttState = 'inactive';
    this.toolbarButton = null;
    this.actionButton = null;
    // Barre inférieure
    this.bottomBar = null;
    this.labelEl = null;
    this.barsContainer = null;
    this.barCols = [];
    // Ancrage de dictée (append à un seul endroit)
    this.dictationAnchorIndex = null;
    this.appendedChars = 0;
    // Audio
    this.audioCtx = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animationId = null;
    // Colors
    this.inactiveColor = void 0;
    this.startingColor = void 0;
    this.listeningColor = void 0;
    this.quill = quill;
    this.options = {
      language: (_options$language = options.language) != null ? _options$language : 'fr-FR',
      continuous: (_options$continuous = options.continuous) != null ? _options$continuous : false,
      visualizer: (_options$visualizer = options.visualizer) != null ? _options$visualizer : true,
      waveformColor: (_options$waveformColo = options.waveformColor) != null ? _options$waveformColo : '#4285f4',
      histogramColor: (_options$histogramCol = options.histogramColor) != null ? _options$histogramCol : '#25D366',
      debug: (_options$debug = options.debug) != null ? _options$debug : false,
      buttonTitleStart: (_options$buttonTitleS = options.buttonTitleStart) != null ? _options$buttonTitleS : 'Start listening',
      buttonTitleStop: (_options$buttonTitleS2 = options.buttonTitleStop) != null ? _options$buttonTitleS2 : 'Stop listening',
      titleInactive: (_options$titleInactiv = options.titleInactive) != null ? _options$titleInactiv : 'Inactive',
      titleStarting: (_options$titleStartin = options.titleStarting) != null ? _options$titleStartin : 'Starting...',
      titleActive: (_options$titleActive = options.titleActive) != null ? _options$titleActive : 'Listening...'
    };
    this.inactiveColor = '#0000ff';
    this.startingColor = '#FF0000';
    this.listeningColor = this.options.histogramColor;
    if (this.options.debug) {
      console.log('debug activated, Speak to see what is recognized');
      console.log("Language used: " + this.options.language);
    }
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      console.warn('[SpeechToText] Web Speech API is not supported by this browser.');
      this.renderUnavailableUI();
      return;
    }
    this.recognition = new SpeechRecognition();
    if (this.recognition) {
      var _this$options$continu;
      this.recognition.lang = this.options.language || 'en-EN';
      this.recognition.continuous = (_this$options$continu = this.options.continuous) != null ? _this$options$continu : false;
      this.recognition.interimResults = true;
    }
    this.bindRecognitionEvents();
    this.renderUI();
  }
  bindRecognitionEvents() {
    if (!this.recognition) return;
    this.recognition.onstart = async () => {
      if (this.options.debug) {
        console.log('[SpeechToText] Recognition service started (onstart event)');
      }
      this.dispatch('stt:listening-start', {});
      if (this.options.visualizer) {
        try {
          await this.startVisualizer();
          this.updateUIState('listening');
        } catch (e) {
          if (this.options.debug) {
            console.warn('[SpeechToText] Failed to start visualizer after recognition onstart', e);
          }
          this.updateUIState('inactive');
          this.stopRecognitionService();
        }
      } else {
        this.updateUIState('listening');
      }
    };
    this.recognition.onresult = event => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        var _res$;
        const res = event.results[i];
        const text = ((_res$ = res[0]) == null ? void 0 : _res$.transcript) || '';
        if (res.isFinal) {
          finalText += text + ' ';
        } else {
          interimText = text;
        }
      }
      if (interimText) {
        if (this.options.debug) {
          console.log('[SpeechToText] Interim result:', interimText);
        }
        this.dispatch('stt:result', {
          text: interimText,
          isFinal: false
        });
        if (this.labelEl) {
          this.labelEl.textContent = "STT: " + this.options.titleActive + " " + interimText;
        }
      }
      if (finalText) {
        if (this.options.debug) {
          console.log('[SpeechToText] segment final:', finalText);
        }
        this.dispatch('stt:result', {
          text: finalText,
          isFinal: true
        });
        this.insertFinalTranscript(finalText);
        if (this.labelEl) {
          this.labelEl.textContent = "STT: " + this.options.titleActive;
        }
      }
    };
    this.recognition.onerror = event => {
      const error = (event == null ? void 0 : event.error) || event;
      console.error('[SpeechToText] Voice recognition failed:', error);
      this.dispatch('stt:error', {
        error
      });
      this.updateUIState('inactive');
      this.stopVisualizer();
    };
    this.recognition.onend = () => {
      if (this.options.debug) {
        console.log('[SpeechToText] Recognition service ended (onend event)');
      }
      this.dispatch('stt:listening-stop', {});
      if (this.options.continuous && this.currentSttState === 'listening') {
        if (this.options.debug) {
          console.log('[SpeechToText] Attempting to restart (continuous mode)');
        }
        try {
          var _this$recognition;
          (_this$recognition = this.recognition) == null || _this$recognition.start();
        } catch (_unused) {
          setTimeout(() => {
            try {
              var _this$recognition2;
              (_this$recognition2 = this.recognition) == null || _this$recognition2.start();
            } catch (_unused2) {
              this.updateUIState('inactive');
              this.stopVisualizer();
            }
          }, 300);
        }
      } else {
        this.updateUIState('inactive');
        this.stopVisualizer();
      }
    };
  }
  insertFinalTranscript(text) {
    var _this$dictationAnchor;
    const baseIndex = (_this$dictationAnchor = this.dictationAnchorIndex) != null ? _this$dictationAnchor : this.quill.getLength();
    const insertIndex = baseIndex + this.appendedChars;
    this.quill.insertText(insertIndex, text, 'user');
    this.appendedChars += text.length;
    this.quill.setSelection(baseIndex + this.appendedChars, 0, 'user');
  }
  renderUI() {
    ensureBaseStyles();
    this.toolbarButton = null;
    const container = this.quill.container;
    const parent = container.parentElement;
    const bar = document.createElement('div');
    bar.className = 'ql-stt-bar';
    bar.style.setProperty('--stt-accent', this.options.histogramColor || '#25D366');
    bar.style.setProperty('--stt-accent-2', this.options.waveformColor || '#4285f4');
    const label = document.createElement('span');
    label.className = 'ql-stt-label';
    label.textContent = 'STT: ' + this.options.titleInactive;
    let bars = null;
    const cols = [];
    if (this.options.visualizer) {
      bars = document.createElement('div');
      bars.className = 'ql-stt-bars';
      for (let i = 0; i < 14; i++) {
        const col = document.createElement('div');
        col.className = 'ql-stt-bar-col';
        bars.appendChild(col);
        cols.push(col);
      }
    }
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'ql-stt-action';
    action.innerHTML = "\n<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">\n  <path fill=\"currentColor\" d=\"M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z\"/>\n</svg>".trim();
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
  renderUnavailableUI() {
    const toolbar = this.quill.getModule('toolbar');
    if (toolbar != null && toolbar.container) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ql-stt';
      btn.disabled = true;
      btn.innerText = '🎤';
      btn.title = 'Voice recognition not supported in this browser';
      toolbar.container.appendChild(btn);
      this.toolbarButton = btn;
    }
  }
  updateUIState(state) {
    this.currentSttState = state;
    const isListening = state === 'listening';
    if (this.toolbarButton) {
      this.toolbarButton.style.color = isListening ? this.options.histogramColor : '';
    }
    if (this.labelEl) {
      let labelText;
      let labelColor;
      switch (state) {
        case 'starting':
          labelText = this.options.titleStarting;
          labelColor = this.startingColor;
          break;
        case 'listening':
          labelText = this.options.titleActive;
          labelColor = this.options.histogramColor;
          break;
        case 'inactive':
        default:
          labelText = this.options.titleInactive;
          labelColor = this.inactiveColor;
          break;
      }
      this.labelEl.textContent = 'STT: ' + labelText;
      this.labelEl.style.color = labelColor;
    }
    if (this.bottomBar) {
      this.bottomBar.classList.toggle('is-listening', isListening);
    }
    if (this.actionButton) {
      this.actionButton.title = isListening ? this.options.buttonTitleStop : this.options.buttonTitleStart;
      this.actionButton.setAttribute('aria-pressed', isListening ? 'true' : 'false');
      this.actionButton.disabled = state === 'starting';
    }
    if (this.options.visualizer) {
      if (isListening) {
        // Le visualiseur est démarré dans onstart, pas ici
      } else {
        this.stopVisualizer();
      }
    }
  }
  async startVisualizer() {
    if (this.animationId) return;
    const AudioCtxCtor = getAudioContextCtor();
    if (!AudioCtxCtor) {
      this.startFallbackAnimation();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      this.mediaStream = stream;
      if (this.options.debug) {
        console.log('[SpeechToText] Visualizer started (stream obtained)');
      }
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
          const idx = Math.min(bufferLength - 1, Math.floor(Math.pow(percent, 0.8) * bufferLength));
          const v = dataArray[idx] / 255;
          const height = Math.max(2, Math.floor(2 + v * 16));
          this.barCols[i].style.height = height + "px";
        }
        this.animationId = requestAnimationFrame(draw);
      };
      this.animationId = requestAnimationFrame(draw);
    } catch (e) {
      if (this.options.debug) {
        console.warn('[SpeechToText] Failed to get audio stream for visualizer:', e);
      }
      this.startFallbackAnimation();
      throw e;
    }
  }
  startFallbackAnimation() {
    if (this.animationId) return;
    let t = 0;
    const draw = () => {
      const cols = this.barCols.length;
      for (let i = 0; i < cols; i++) {
        const phase = t * 0.12 + i * 0.45;
        const v = (Math.sin(phase) + 1) / 2;
        const height = Math.max(2, Math.floor(2 + v * 16));
        this.barCols[i].style.height = height + "px";
      }
      t++;
      this.animationId = requestAnimationFrame(draw);
    };
    this.animationId = requestAnimationFrame(draw);
  }
  stopVisualizer() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.barCols.length) {
      for (const col of this.barCols) {
        col.style.height = '2px';
      }
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        if (this.options.debug) {
          console.warn('[SpeechToText] analyser.disconnect() failed', e);
        }
      }
      this.analyser = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {
        if (this.options.debug) {
          console.warn('[SpeechToText] audioCtx.close() failed', e);
        }
      }
      this.audioCtx = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
  startRecognitionService() {
    if (!this.recognition || this.currentSttState !== 'inactive') return;
    if (this.options.debug) {
      console.log('[SpeechToText] Attempting to start recognition service...');
    }
    try {
      const sel = this.quill.getSelection(true);
      this.dictationAnchorIndex = sel ? sel.index : this.quill.getLength();
      this.appendedChars = 0;
      this.updateUIState('starting');
      this.recognition.start();
    } catch (e) {
      if (this.options.debug) {
        console.warn('[SpeechToText] recognition.start() failed immediately', e);
      }
      this.updateUIState('inactive');
    }
  }
  stopRecognitionService() {
    if (!this.recognition || this.currentSttState === 'inactive') return;
    if (this.options.debug) {
      console.log('[SpeechToText] Attempting to stop recognition service...');
    }
    try {
      this.recognition.stop();
    } catch (e) {
      if (this.options.debug) {
        console.warn('[SpeechToText] recognition.stop() failed', e);
      }
      try {
        this.recognition.abort();
      } catch (abortErr) {
        if (this.options.debug) {
          console.warn('[SpeechToText] recognition.abort() failed', abortErr);
        }
      }
    }
    this.dictationAnchorIndex = null;
    this.appendedChars = 0;
    this.updateUIState('inactive');
  }
  toggle() {
    if (this.currentSttState === 'inactive') {
      this.startRecognitionService();
    } else {
      this.stopRecognitionService();
    }
  }
  dispatch(name, detail) {
    this.quill.container.dispatchEvent(new CustomEvent("quill:" + name, {
      bubbles: true,
      cancelable: true,
      detail: detail
    }));
  }
}