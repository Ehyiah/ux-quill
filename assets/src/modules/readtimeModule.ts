import Quill from 'quill';
import type { ReadingTimeOptions } from '../types.d.ts';

export default class ReadingTime {
    private quill: Quill;
    private wpm: number;
    private label: string;
    private suffix: string;
    private targetElement: HTMLElement;
    private readTimeOk: number;
    private readTimeMedium: number;
    private toolbarContainer: HTMLElement | null = null;
    private toolbarOriginalPaddingRight: string | null = null;
    private targetIsCustom = false;

    constructor(quill: Quill, options: ReadingTimeOptions = {}) {
        this.quill = quill;
        this.wpm = options.wpm || 200;
        this.label = options.label || '⏱ Reading time: ~ ';
        this.suffix = options.suffix || ' minute(s)';
        this.readTimeOk = options.readTimeOk || 5;
        this.readTimeMedium = options.readTimeMedium || 8;

        if (options.target) {
            const el = document.querySelector<HTMLElement>(options.target);
            if (!el) {
                throw new Error(`Cannot find target element: ${options.target}`);
            }
            this.targetElement = el;
            this.targetIsCustom = true;
        } else {
            this.targetElement = document.createElement('div');
            this.targetElement.classList.add('ql-reading-time');
            this.targetElement.style.cssText = `
                font-size: 12px;
                font-weight: 500;
                padding: 4px 10px;
                border-radius: 6px;
                background: #f5f5f5;
                color: #2e7d32;
                font-family: sans-serif;
                transition: background 0.3s ease, color 0.3s ease;
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                box-sizing: border-box;
                min-width: 48px; /* minimum to stabilise width */
            `;

            const toolbar = this.quill.getModule('toolbar') as any;
            if (toolbar?.container) {
                const tb = toolbar.container as HTMLElement;
                if (window.getComputedStyle(tb).position === 'static') {
                    tb.style.position = 'relative';
                }
                tb.appendChild(this.targetElement);
                this.toolbarContainer = tb;
                this.toolbarOriginalPaddingRight = window.getComputedStyle(tb).paddingRight || '';
            } else {
                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                this.quill.container.parentNode?.insertBefore(wrapper, this.quill.container);
                wrapper.appendChild(this.quill.container);
                wrapper.appendChild(this.targetElement);
                this.toolbarContainer = wrapper;
                this.toolbarOriginalPaddingRight = window.getComputedStyle(wrapper).paddingRight || '';
            }
        }

        this.updateReadingTime();
        this.quill.on('text-change', () => this.updateReadingTime());
        window.addEventListener('resize', this.onWindowResize);
    }

    private onWindowResize = () => {
        if (this.toolbarContainer && !this.targetIsCustom) {
            const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
            this.toolbarContainer.style.paddingRight = `${width + 12}px`;
        }
    };

    private updateReadingTime(): void {
        const text = this.quill.getText().trim();
        const words = text.length > 0 ? text.split(/\s+/).length : 0;
        const minutes = Math.max(1, Math.ceil(words / this.wpm));

        if (minutes <= this.readTimeOk) {
            this.setStyle('#2e7d32', '#e8f5e9');
        } else if (minutes <= this.readTimeMedium) {
            this.setStyle('#ef6c00', '#fff3e0');
        } else {
            this.setStyle('#c62828', '#ffebee');
        }

        this.targetElement.textContent = `${this.label}${minutes}${this.suffix}`;

        this.dispatch('reading-time:update', { minutes, words });

        if (this.toolbarContainer && !this.targetIsCustom) {
            const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
            this.toolbarContainer.style.paddingRight = `${width + 12}px`; // 12px marge
        }
    }

    private setStyle(color: string, background: string): void {
        this.targetElement.style.color = color;
        this.targetElement.style.background = background;
    }

    public destroy(): void {
        if (this.toolbarContainer && this.toolbarOriginalPaddingRight !== null && !this.targetIsCustom) {
            this.toolbarContainer.style.paddingRight = this.toolbarOriginalPaddingRight;
        }
        if (!this.targetIsCustom && this.targetElement.parentNode) {
            this.targetElement.parentNode.removeChild(this.targetElement);
        }
        window.removeEventListener('resize', this.onWindowResize);
    }

    private dispatch(name: string, detail: any) {
        this.quill.container.dispatchEvent(new CustomEvent(`quill:${name}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        }));
    }
}
