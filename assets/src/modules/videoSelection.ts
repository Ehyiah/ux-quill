import Quill from 'quill';

export interface VideoSelectionOptions {
    borderColor?: string;
    borderWidth?: string;
    playTitle?: string;
    editUrlTitle?: string;
    deleteTitle?: string;
    alignLabels?: {
        left?: string;
        leftBlock?: string;
        center?: string;
        right?: string;
    };
    sectionLabels?: {
        size?: string;
        align?: string;
        video?: string;
    };
}

const VIDEO_SELECTOR = 'iframe.ql-video';

const ICONS: Record<string, string> = {
    play: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon></svg>',
    alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    editUrl: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
};

export default class VideoSelection {
    private quill: Quill;
    private options: Required<VideoSelectionOptions>;
    private selectedVideo: HTMLIFrameElement | null = null;
    private overlay: HTMLDivElement | null = null;
    private videoOverlay: HTMLDivElement | null = null;
    private toolbar: HTMLDivElement | null = null;
    private inputBar: HTMLDivElement | null = null;
    private dragHandle: HTMLDivElement | null = null;
    private dragStartX = 0;
    private dragStartY = 0;
    private dragStartWidth = 0;
    private dragStartHeight = 0;
    private isResizing = false;
    private overlayBlocks = new Map<HTMLIFrameElement, HTMLDivElement>();

    private repositionHandler: () => void;
    private observer: MutationObserver | null = null;

    constructor(quill: Quill, options: VideoSelectionOptions = {}) {
        this.registerStyleAttributor();
        this.quill = quill;
        this.options = {
            borderColor: '#007bff',
            borderWidth: '4px',
            playTitle: 'Play video',
            editUrlTitle: 'Edit video URL',
            deleteTitle: 'Delete video',
            alignLabels: {
                left: 'Left (wrapped)',
                leftBlock: 'Left (no wrap)',
                center: 'Center',
                right: 'Right (wrapped)',
            },
            sectionLabels: {
                size: 'Size',
                align: 'Align',
                video: 'Video',
            },
            ...options,
        };

        if (this.options.sectionLabels === undefined) {
            this.options.sectionLabels = { size: 'Size', align: 'Align', video: 'Video' };
        }

        this.repositionHandler = () => {
            this.reposition();
            this.positionOverlays();
        };

        this.injectStyles();
        this.setupOverlays();
        this.observer = new MutationObserver(() => {
            const videos = quill.root.querySelectorAll<HTMLIFrameElement>(VIDEO_SELECTOR);
            let added = false;
            videos.forEach(v => {
                if (!this.overlayBlocks.has(v)) {
                    this.ensureOverlay(v);
                    added = true;
                }
            });
            if (added && this.selectedVideo) {
                this.reposition();
            }
            if (added) {
                this.positionOverlays();
            }
        });
        this.observer.observe(quill.root, { childList: true, subtree: true });

        this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
        this.quill.root.addEventListener('scroll', this.repositionHandler, true);
        window.addEventListener('resize', this.repositionHandler);

        requestAnimationFrame(() => {
            if (this.quill?.root?.querySelector(VIDEO_SELECTOR)) {
                this.setupOverlays();
            }
        });
    }

    private registerStyleAttributor(): void {
        const Parchment = Quill.import('parchment') as any;
        if (!Parchment || Parchment.Registry?.query?.('style', Parchment.Scope?.ATTRIBUTE)) return;
        const { Attributor, Scope } = Parchment;
        const styleAttr = new Attributor('style', 'style', { scope: Scope.BLOCK });
        Quill.register(styleAttr, true);
    }

    private setupOverlays(): void {
        const videos = this.quill.root.querySelectorAll<HTMLIFrameElement>(VIDEO_SELECTOR);
        videos.forEach(v => this.ensureOverlay(v));
        this.positionOverlays();
    }

    private ensureOverlay(video: HTMLIFrameElement): HTMLDivElement | undefined {
        const existing = this.overlayBlocks.get(video);
        if (existing) {
            if (document.contains(video)) return existing;
            existing.remove();
            return undefined;
        }
        if (!document.contains(video)) return undefined;

        const block = document.createElement('div');
        block.className = 'ql-video-overlay-block';
        block.addEventListener('click', (e) => {
            if (!document.contains(block)) return;
            e.stopPropagation();
            e.preventDefault();
            this.selectVideo(video);
        });
        this.quill.container.appendChild(block);
        this.overlayBlocks.set(video, block);
        return block;
    }

    private cleanOverlays(): void {
        const toRemove: HTMLIFrameElement[] = [];
        this.overlayBlocks.forEach((block, video) => {
            if (!document.contains(video)) {
                block.remove();
                toRemove.push(video);
            }
        });
        toRemove.forEach(v => this.overlayBlocks.delete(v));
    }

    private positionOverlays(): void {
        const containerRect = this.quill.container.getBoundingClientRect();
        this.cleanOverlays();
        this.overlayBlocks.forEach((block, video) => {
            if (!document.contains(video) || !document.contains(block)) return;
            const videoRect = video.getBoundingClientRect();
            block.style.top = `${videoRect.top - containerRect.top}px`;
            block.style.left = `${videoRect.left - containerRect.left}px`;
            block.style.width = `${videoRect.width}px`;
            block.style.height = `${videoRect.height}px`;
        });
    }

    private injectStyles(): void {
        const styleId = 'ql-video-selection-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
.ql-video-overlay-block {
    position: absolute;
    z-index: 5;
    cursor: pointer;
    background: transparent;
}
.ql-video-selection-overlay {
    position: absolute;
    border: ${this.options.borderWidth} solid ${this.options.borderColor};
    box-sizing: border-box;
    pointer-events: none;
    z-index: 1000;
    user-select: none;
}
.ql-video-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    background: ${this.options.borderColor};
    border: 1px solid white;
    pointer-events: auto;
    cursor: nwse-resize;
    z-index: 1001;
    box-sizing: border-box;
}
.ql-video-toolbar, .ql-video-input-bar {
    position: absolute;
    background: #333;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    gap: 4px;
    z-index: 1002;
    pointer-events: auto;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    align-items: flex-end;
}
.ql-video-toolbar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.ql-video-toolbar-section-label {
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    font-weight: bold;
    pointer-events: none;
    user-select: none;
}
.ql-video-toolbar-section-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
}
.ql-video-toolbar button, .ql-video-input-bar button {
    background: transparent;
    border: none;
    color: #ddd;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    transition: background 0.2s, color 0.2s;
    min-width: 28px;
    font-weight: bold;
    font-size: 11px;
}
.ql-video-toolbar button:hover, .ql-video-input-bar button:hover {
    background: #444;
    color: white;
}
.ql-video-toolbar button.active, .ql-video-input-bar button.active {
    background: ${this.options.borderColor} !important;
    color: white !important;
}
.ql-video-input-bar input {
    background: #444;
    border: 1px solid #555;
    color: white;
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 12px;
    outline: none;
}
.ql-video-input-bar input:focus {
    border-color: ${this.options.borderColor};
}
.ql-video-toolbar .ql-toolbar-separator {
    width: 1px;
    background: #444;
    margin: 4px 2px;
    height: 16px;
}
`;
        document.head.appendChild(style);
    }

    private handleClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;

        if (target.closest('.ql-video-overlay-block')) return;

        const video = target.closest<HTMLIFrameElement>(VIDEO_SELECTOR);

        if (video && this.quill.root.contains(video)) {
            e.preventDefault();
            e.stopPropagation();
            this.selectVideo(video);
            return;
        }

        if (this.toolbar && this.toolbar.contains(target)) return;
        if (this.inputBar && this.inputBar.contains(target)) return;
        if (this.overlay && this.overlay.contains(target)) return;

        this.deselectVideo();
    }

    private selectVideo(video: HTMLIFrameElement): void {
        if (this.selectedVideo === video) return;
        this.deselectVideo();
        this.selectedVideo = video;
        this.showOverlay();
    }

    private deselectVideo(): void {
        if (this.isResizing) return;
        if (this.selectedVideo) {
            this.selectedVideo = null;
        }
        this.hideOverlay();
    }

    private hideOverlay(): void {
        if (this.overlay) { this.overlay.remove(); this.overlay = null; }
        if (this.toolbar) { this.toolbar.remove(); this.toolbar = null; }
        if (this.inputBar) { this.inputBar.remove(); this.inputBar = null; }
    }

    private showOverlay(): void {
        if (!this.selectedVideo) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'ql-video-selection-overlay';
        this.quill.container.appendChild(this.overlay);

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'ql-video-toolbar';
        this.quill.container.appendChild(this.toolbar);

        this.setupToolbar();
        this.updateActiveButtons();
        this.setupHandles();
        this.reposition();
    }

    private handlePlay(): void {
        if (!this.selectedVideo) return;
        window.open(this.selectedVideo.src, '_blank');
    }

    private setupToolbar(): void {
        if (!this.toolbar) return;

        this.addSection(undefined, (container) => {
            const btnPlay = document.createElement('button');
            btnPlay.type = 'button';
            btnPlay.innerHTML = ICONS.play;
            btnPlay.title = this.options.playTitle;
            btnPlay.onclick = (e) => { e.stopPropagation(); this.handlePlay(); };
            container.appendChild(btnPlay);
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels?.size, (container) => {
            const sizes = ['25%', '50%', '75%', '100%'];
            sizes.forEach(size => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = size;
                btn.title = `Set width to ${size}`;
                btn.dataset.size = size;
                btn.onclick = (e) => { e.stopPropagation(); this.setSize(size); };
                container.appendChild(btn);
            });

            const btnCustom = document.createElement('button');
            btnCustom.type = 'button';
            btnCustom.innerHTML = ICONS.sizeCustom;
            btnCustom.title = 'Set custom width';
            btnCustom.onclick = (e) => { e.stopPropagation(); this.showSizeInput(); };
            container.appendChild(btnCustom);
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels?.align, (container) => {
            const aligns = [
                { name: 'left', icon: ICONS.alignLeft },
                { name: 'leftBlock', icon: ICONS.alignLeftBlock },
                { name: 'center', icon: ICONS.alignCenter },
                { name: 'right', icon: ICONS.alignRight },
            ];
            aligns.forEach(a => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = a.icon;
                btn.title = (this.options.alignLabels as any)[a.name] || a.name;
                btn.dataset.align = a.name;
                btn.onclick = (e) => { e.stopPropagation(); this.alignVideo(a.name); };
                container.appendChild(btn);
            });
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels?.video, (container) => {
            const btnUrl = document.createElement('button');
            btnUrl.type = 'button';
            btnUrl.innerHTML = ICONS.editUrl;
            btnUrl.title = this.options.editUrlTitle;
            btnUrl.onclick = (e) => { e.stopPropagation(); this.showUrlInput(); };
            container.appendChild(btnUrl);

            const btnDelete = document.createElement('button');
            btnDelete.type = 'button';
            btnDelete.innerHTML = ICONS.trash;
            btnDelete.title = this.options.deleteTitle;
            btnDelete.style.color = '#ff4d4d';
            btnDelete.onclick = (e) => { e.stopPropagation(); this.deleteVideo(); };
            container.appendChild(btnDelete);
        });
    }

    private showUrlInput(): void {
        if (!this.selectedVideo) return;
        const currentUrl = this.selectedVideo.src || '';

        if (this.toolbar) this.toolbar.style.display = 'none';

        this.inputBar = document.createElement('div');
        this.inputBar.className = 'ql-video-input-bar';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentUrl;
        input.placeholder = 'https://www.youtube.com/embed/...';
        input.style.width = '300px';

        const btnOk = document.createElement('button');
        btnOk.type = 'button';
        btnOk.innerHTML = ICONS.check;
        btnOk.onclick = (e) => {
            e.stopPropagation();
            this.setVideoUrl(input.value);
            this.hideInputBar();
        };

        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerHTML = ICONS.cancel;
        btnCancel.onclick = (e) => {
            e.stopPropagation();
            this.hideInputBar();
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.setVideoUrl(input.value);
                this.hideInputBar();
            } else if (e.key === 'Escape') {
                this.hideInputBar();
            }
        };

        this.inputBar.appendChild(input);
        this.inputBar.appendChild(btnOk);
        this.inputBar.appendChild(btnCancel);
        this.quill.container.appendChild(this.inputBar);

        this.reposition();
        input.focus();
        input.select();
    }

    private hideInputBar(): void {
        if (this.inputBar) {
            this.inputBar.remove();
            this.inputBar = null;
        }
        if (this.toolbar) {
            this.toolbar.style.display = 'flex';
            this.reposition();
        }
    }

    private setVideoUrl(url: string): void {
        if (!this.selectedVideo) return;
        const cleanUrl = url.trim();
        if (cleanUrl) {
            this.selectedVideo.src = cleanUrl;
        }
    }

    private setSize(size: string): void {
        if (!this.selectedVideo) return;
        let finalSize = size.trim();
        if (/^\d+$/.test(finalSize)) finalSize += 'px';

        this.selectedVideo.style.width = finalSize;
        this.selectedVideo.style.height = 'auto';

        this.saveVideoStyles();
        this.updateActiveButtons();
        setTimeout(() => {
            this.reposition();
            this.positionOverlays();
        }, 100);
    }

    private showSizeInput(): void {
        if (!this.selectedVideo) return;
        let currentWidth = this.selectedVideo.style.width || Math.round(this.selectedVideo.getBoundingClientRect().width) + 'px';
        if (currentWidth.endsWith('px')) currentWidth = currentWidth.replace('px', '');

        if (this.toolbar) this.toolbar.style.display = 'none';
        this.inputBar = document.createElement('div');
        this.inputBar.className = 'ql-video-input-bar';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentWidth;
        input.placeholder = 'e.g. 560 or 75%';
        input.style.width = '100px';

        const btnOk = document.createElement('button');
        btnOk.type = 'button';
        btnOk.innerHTML = ICONS.check;
        btnOk.onclick = (e) => {
            e.stopPropagation();
            this.setSize(input.value);
            this.hideInputBar();
        };

        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerHTML = ICONS.cancel;
        btnCancel.onclick = (e) => {
            e.stopPropagation();
            this.hideInputBar();
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') { this.setSize(input.value); this.hideInputBar(); }
            else if (e.key === 'Escape') { this.hideInputBar(); }
        };

        this.inputBar.appendChild(input);
        this.inputBar.appendChild(btnOk);
        this.inputBar.appendChild(btnCancel);
        this.quill.container.appendChild(this.inputBar);

        this.reposition();
        input.focus();
        input.select();
    }

    private alignVideo(align: string): void {
        if (!this.selectedVideo) return;
        const el = this.selectedVideo;

        el.style.display = 'block';
        el.style.float = '';
        el.style.margin = '';
        el.style.marginLeft = '';
        el.style.marginRight = '';

        if (align === 'leftBlock') {
            el.style.marginLeft = '0';
            el.style.marginRight = 'auto';
            el.style.marginTop = '10px';
            el.style.marginBottom = '10px';
        } else if (align === 'center') {
            el.style.marginLeft = 'auto';
            el.style.marginRight = 'auto';
            el.style.marginTop = '10px';
            el.style.marginBottom = '10px';
        } else if (align === 'left') {
            el.style.float = 'left';
            el.style.margin = '0 10px 10px 0';
        } else if (align === 'right') {
            el.style.float = 'right';
            el.style.margin = '0 0 10px 10px';
        }

        this.saveVideoStyles();
        this.updateActiveButtons();
        setTimeout(() => {
            this.reposition();
            this.positionOverlays();
        }, 100);
    }

    private deleteVideo(): void {
        if (!this.selectedVideo) return;
        const blot = Quill.find(this.selectedVideo);
        if (blot) {
            const index = this.quill.getIndex(blot);
            this.selectedVideo = null;
            this.hideOverlay();
            this.quill.deleteText(index, 1, 'user');
        }
    }

    private saveVideoStyles(): void {
        if (!this.selectedVideo) return;
        const blot = Quill.find(this.selectedVideo);
        if (blot) {
            const index = this.quill.getIndex(blot);
            if (index >= 0) {
                this.quill.formatText(index, 1, {
                    style: this.selectedVideo.getAttribute('style'),
                }, 'user');
            }
        }
    }

    private reposition(): void {
        if (!this.selectedVideo || !this.overlay) return;

        const videoRect = this.selectedVideo.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = videoRect.top - containerRect.top;
        const left = videoRect.left - containerRect.left;

        this.overlay.style.top = `${top}px`;
        this.overlay.style.left = `${left}px`;
        this.overlay.style.width = `${videoRect.width}px`;
        this.overlay.style.height = `${videoRect.height}px`;

        const activeBar = (this.inputBar && this.inputBar.parentNode) ? this.inputBar : this.toolbar;
        if (!activeBar) return;

        const barWidth = activeBar.offsetWidth || 300;
        let barLeft = left + (videoRect.width / 2) - (barWidth / 2);
        if (barLeft < 5) barLeft = 5;
        const maxLeft = containerRect.width - barWidth - 5;
        if (barLeft > maxLeft) barLeft = maxLeft;
        activeBar.style.left = `${barLeft}px`;

        const barHeight = activeBar.offsetHeight || 40;
        let barTop = top - barHeight - 10;
        if (barTop < 0) barTop = 5;
        activeBar.style.top = `${barTop}px`;
    }

    private isCurrentAlign(name: string): boolean {
        if (!this.selectedVideo) return false;
        const style = this.selectedVideo.style;
        switch (name) {
            case 'leftBlock':
                return (style.display === 'block') && (style.float === '' || style.float === 'none') && style.marginLeft === '0px';
            case 'center':
                return (style.display === 'block') && style.marginLeft === 'auto' && style.marginRight === 'auto';
            case 'left': return style.float === 'left';
            case 'right': return style.float === 'right';
        }
        return false;
    }

    private updateActiveButtons(): void {
        if (!this.selectedVideo || !this.toolbar) return;

        this.toolbar.querySelectorAll('button[data-align]').forEach(btn => {
            const a = (btn as HTMLElement).dataset.align;
            if (a && this.isCurrentAlign(a)) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        this.toolbar.querySelectorAll('button[data-size]').forEach(btn => {
            const s = (btn as HTMLElement).dataset.size;
            if (s && this.selectedVideo!.style.width === s) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    private addSection(label: string | undefined, callback: (container: HTMLElement) => void): void {
        const section = document.createElement('div');
        section.className = 'ql-video-toolbar-section';
        if (label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'ql-video-toolbar-section-label';
            labelEl.innerText = label;
            section.appendChild(labelEl);
        }
        const buttons = document.createElement('div');
        buttons.className = 'ql-video-toolbar-section-buttons';
        callback(buttons);
        section.appendChild(buttons);
        this.toolbar!.appendChild(section);
    }

    private addSeparator(): void {
        const sep = document.createElement('div');
        sep.className = 'ql-toolbar-separator';
        this.toolbar!.appendChild(sep);
    }

    private setupHandles(): void {
        if (!this.overlay) return;
        const positions = [
            { top: '-7px', left: '-7px', side: 'nw' },
            { top: '-7px', right: '-7px', side: 'ne' },
            { bottom: '-7px', left: '-7px', side: 'sw' },
            { bottom: '-7px', right: '-7px', side: 'se' },
        ];

        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = 'ql-video-handle';
            if (pos.top) handle.style.top = pos.top;
            if (pos.bottom) handle.style.bottom = pos.bottom;
            if (pos.left) handle.style.left = pos.left;
            if (pos.right) handle.style.right = pos.right;
            handle.dataset.side = pos.side;
            handle.addEventListener('mousedown', this.handleMouseDown.bind(this));
            handle.addEventListener('dragstart', (e) => e.preventDefault());
            this.overlay!.appendChild(handle);
        });
    }

    private handleMouseDown = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        this.isResizing = true;
        this.dragHandle = e.target as HTMLDivElement;
        const rect = this.selectedVideo ? this.selectedVideo.getBoundingClientRect() : { width: 0, height: 0 };
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartWidth = rect.width;
        this.dragStartHeight = rect.height;

        window.addEventListener('mousemove', this.handleMouseMove, true);
        window.addEventListener('mouseup', this.handleMouseUp, true);
    };

    private handleMouseMove = (e: MouseEvent): void => {
        if (!this.selectedVideo || !this.dragHandle) return;
        e.preventDefault();
        e.stopPropagation();

        const side = this.dragHandle.dataset.side;
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        let newWidth = this.dragStartWidth;
        let newHeight = this.dragStartHeight;

        if (side === 'nw' || side === 'sw') {
            newWidth -= deltaX;
        } else {
            newWidth += deltaX;
        }

        if (side === 'nw' || side === 'ne') {
            newHeight -= deltaY;
        } else {
            newHeight += deltaY;
        }

        newWidth = Math.round(Math.max(newWidth, 60));
        newHeight = Math.round(Math.max(newHeight, 40));

        this.selectedVideo.style.width = `${newWidth}px`;
        this.selectedVideo.style.height = `${newHeight}px`;
        this.reposition();
        this.positionOverlays();
    };

    private handleMouseUp = (e: MouseEvent): void => {
        if (!this.isResizing) return;
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = false;
        this.dragHandle = null;
        window.removeEventListener('mousemove', this.handleMouseMove, true);
        window.removeEventListener('mouseup', this.handleMouseUp, true);

        if (this.selectedVideo) {
            this.saveVideoStyles();
        }
        this.updateActiveButtons();
    };

    public refresh(): void {
        this.cleanOverlays();
        this.setupOverlays();
    }
}
