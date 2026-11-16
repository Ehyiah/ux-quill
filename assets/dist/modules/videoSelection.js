function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
import { transformVideoUrl, addProvider } from "../utils/videoProviders.js";
const VIDEO_SELECTOR = 'figure.ql-video-figure';
const ICONS = {
  play: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon></svg>',
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  editUrl: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
  editTitle: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  editCaption: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path></svg>',
  loading: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
  paraBefore: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 3H21"></path></svg>',
  paraAfter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 21H21"></path></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
};
export default class VideoSelection {
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.selectedFigure = null;
    this.overlay = null;
    this.toolbar = null;
    this.inputBar = null;
    this.dragHandle = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartWidth = 0;
    this.dragStartHeight = 0;
    this.isResizing = false;
    this.repositionHandler = void 0;
    this.observer = null;
    this.handleMouseDown = e => {
      e.preventDefault();
      e.stopPropagation();
      this.isResizing = true;
      this.dragHandle = e.target;
      const rect = this.selectedFigure ? this.selectedFigure.getBoundingClientRect() : {
        width: 0,
        height: 0
      };
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragStartWidth = rect.width;
      this.dragStartHeight = rect.height;
      window.addEventListener('mousemove', this.handleMouseMove, true);
      window.addEventListener('mouseup', this.handleMouseUp, true);
    };
    this.handleMouseMove = e => {
      if (!this.selectedFigure || !this.dragHandle) return;
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
      this.selectedFigure.style.width = newWidth + "px";
      const iframe = this.getIframe();
      if (iframe) iframe.style.height = newHeight + "px";
      this.reposition();
    };
    this.handleMouseUp = e => {
      if (!this.isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      this.isResizing = false;
      this.dragHandle = null;
      window.removeEventListener('mousemove', this.handleMouseMove, true);
      window.removeEventListener('mouseup', this.handleMouseUp, true);
      if (this.selectedFigure) {
        this.saveVideoStyles();
      }
      this.updateActiveButtons();
    };
    this.quill = quill;
    this.options = _extends({
      borderColor: '#007bff',
      borderWidth: '4px',
      playTitle: 'Play video',
      editUrlTitle: 'Edit video URL',
      editTitleTitle: 'Edit title',
      editCaptionTitle: 'Edit caption',
      buttonBeforeLabel: ICONS.paraBefore,
      buttonAfterLabel: ICONS.paraAfter,
      buttonBeforeTitle: 'Insert a paragraph before',
      buttonAfterTitle: 'Insert a paragraph after',
      deleteTitle: 'Delete video',
      alignLabels: {
        left: 'Left (wrapped)',
        leftBlock: 'Left (no wrap)',
        center: 'Center',
        right: 'Right (wrapped)'
      },
      sectionLabels: {
        size: 'Size',
        align: 'Align',
        video: 'Video',
        insert: 'Insert'
      }
    }, options);
    if (this.options.videoProviders) {
      for (const provider of this.options.videoProviders) {
        const regex = new RegExp(provider.match);
        addProvider(provider.name, regex, m => {
          let embed = provider.embed;
          for (let i = 1; i < m.length; i++) {
            embed = embed.replace(new RegExp("\\{" + i + "\\}", 'g'), m[i] || '');
          }
          return embed;
        });
      }
    }
    this.repositionHandler = () => {
      this.reposition();
    };
    this.injectStyles();
    this.observer = new MutationObserver(() => {
      if (this.selectedFigure && !document.contains(this.selectedFigure)) {
        this.selectedFigure = null;
        this.hideOverlay();
      } else if (this.selectedFigure) {
        this.reposition();
      }
    });
    this.observer.observe(quill.root, {
      childList: true,
      subtree: true
    });
    this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
    this.quill.root.addEventListener('scroll', this.repositionHandler, true);
    window.addEventListener('resize', this.repositionHandler);
  }
  getIframe() {
    var _this$selectedFigure;
    return ((_this$selectedFigure = this.selectedFigure) == null ? void 0 : _this$selectedFigure.querySelector('iframe')) || null;
  }
  injectStyles() {
    const styleId = 'ql-video-selection-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = "\n.ql-video-figure {\n    cursor: pointer;\n}\n.ql-video-figure iframe {\n    pointer-events: none;\n}\n.ql-video-selection-overlay {\n    position: absolute;\n    border: " + this.options.borderWidth + " solid " + this.options.borderColor + ";\n    box-sizing: border-box;\n    pointer-events: none;\n    z-index: 1000;\n    user-select: none;\n}\n.ql-video-handle {\n    position: absolute;\n    width: 14px;\n    height: 14px;\n    background: " + this.options.borderColor + ";\n    border: 1px solid white;\n    pointer-events: auto;\n    cursor: nwse-resize;\n    z-index: 1001;\n    box-sizing: border-box;\n}\n.ql-video-toolbar, .ql-video-input-bar {\n    position: absolute;\n    background: #333;\n    border-radius: 4px;\n    padding: 4px;\n    display: flex;\n    gap: 4px;\n    z-index: 1002;\n    pointer-events: auto;\n    user-select: none;\n    box-shadow: 0 2px 8px rgba(0,0,0,0.4);\n    align-items: flex-end;\n}\n.ql-video-toolbar-section {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n}\n.ql-video-toolbar-section-label {\n    font-size: 12px;\n    color: #aaa;\n    text-transform: uppercase;\n    font-weight: bold;\n    pointer-events: none;\n    user-select: none;\n}\n.ql-video-toolbar-section-buttons {\n    display: flex;\n    gap: 4px;\n    align-items: center;\n}\n.ql-video-toolbar button, .ql-video-input-bar button {\n    background: transparent;\n    border: none;\n    color: #ddd;\n    padding: 6px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 3px;\n    transition: background 0.2s, color 0.2s;\n    min-width: 28px;\n    font-weight: bold;\n    font-size: 11px;\n}\n.ql-video-toolbar button:hover, .ql-video-input-bar button:hover {\n    background: #444;\n    color: white;\n}\n.ql-video-toolbar button.active, .ql-video-input-bar button.active {\n    background: " + this.options.borderColor + " !important;\n    color: white !important;\n}\n.ql-video-input-bar input {\n    background: #444;\n    border: 1px solid #555;\n    color: white;\n    border-radius: 3px;\n    padding: 4px 8px;\n    font-size: 12px;\n    outline: none;\n}\n.ql-video-input-bar input:focus {\n    border-color: " + this.options.borderColor + ";\n}\n.ql-video-toolbar .ql-toolbar-separator {\n    width: 1px;\n    background: #444;\n    margin: 4px 2px;\n    height: 16px;\n}\n";
    document.head.appendChild(style);
  }
  handleClick(e) {
    const target = e.target;
    const figure = target.closest(VIDEO_SELECTOR);
    if (figure && this.quill.root.contains(figure)) {
      e.preventDefault();
      e.stopPropagation();
      this.selectVideo(figure);
      return;
    }
    if (this.toolbar && this.toolbar.contains(target)) return;
    if (this.inputBar && this.inputBar.contains(target)) return;
    if (this.overlay && this.overlay.contains(target)) return;
    this.deselectVideo();
  }
  selectVideo(figure) {
    if (this.selectedFigure === figure) return;
    this.deselectVideo();
    this.selectedFigure = figure;
    this.showOverlay();
  }
  deselectVideo() {
    if (this.isResizing) return;
    if (this.selectedFigure) {
      this.selectedFigure = null;
    }
    this.hideOverlay();
  }
  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    if (this.inputBar) {
      this.inputBar.remove();
      this.inputBar = null;
    }
  }
  showOverlay() {
    if (!this.selectedFigure) return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'ql-video-selection-overlay';
    this.quill.container.appendChild(this.overlay);
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'ql-video-toolbar';
    this.quill.container.appendChild(this.toolbar);
    this.setupToolbar();
    this.updateActiveButtons();
    this.updateLoadingButton();
    this.setupHandles();
    this.reposition();
  }
  handlePlay() {
    const iframe = this.getIframe();
    if (!iframe) return;
    window.open(iframe.src, '_blank');
  }
  setupToolbar() {
    var _this$options$section, _this$options$section2, _this$options$section3, _this$options$section4, _this$options$section5;
    if (!this.toolbar) return;
    this.addSection((_this$options$section = this.options.sectionLabels) == null ? void 0 : _this$options$section.insert, container => {
      const btnBefore = document.createElement('button');
      btnBefore.type = 'button';
      btnBefore.innerHTML = this.options.buttonBeforeLabel;
      btnBefore.title = this.options.buttonBeforeTitle;
      btnBefore.onclick = e => {
        e.stopPropagation();
        this.insertParagraphBefore();
      };
      container.appendChild(btnBefore);
    });
    this.addSeparator();
    this.addSection(undefined, container => {
      const btnPlay = document.createElement('button');
      btnPlay.type = 'button';
      btnPlay.innerHTML = ICONS.play;
      btnPlay.title = this.options.playTitle;
      btnPlay.onclick = e => {
        e.stopPropagation();
        this.handlePlay();
      };
      container.appendChild(btnPlay);
    });
    this.addSeparator();
    this.addSection((_this$options$section2 = this.options.sectionLabels) == null ? void 0 : _this$options$section2.size, container => {
      const sizes = ['25%', '50%', '75%', '100%'];
      sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = size;
        btn.title = "Set width to " + size;
        btn.dataset.size = size;
        btn.onclick = e => {
          e.stopPropagation();
          this.setSize(size);
        };
        container.appendChild(btn);
      });
      const btnCustom = document.createElement('button');
      btnCustom.type = 'button';
      btnCustom.innerHTML = ICONS.sizeCustom;
      btnCustom.title = 'Set custom width';
      btnCustom.onclick = e => {
        e.stopPropagation();
        this.showSizeInput();
      };
      container.appendChild(btnCustom);
    });
    this.addSeparator();
    this.addSection((_this$options$section3 = this.options.sectionLabels) == null ? void 0 : _this$options$section3.align, container => {
      const aligns = [{
        name: 'left',
        icon: ICONS.alignLeft
      }, {
        name: 'leftBlock',
        icon: ICONS.alignLeftBlock
      }, {
        name: 'center',
        icon: ICONS.alignCenter
      }, {
        name: 'right',
        icon: ICONS.alignRight
      }];
      aligns.forEach(a => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = a.icon;
        btn.title = this.options.alignLabels[a.name] || a.name;
        btn.dataset.align = a.name;
        btn.onclick = e => {
          e.stopPropagation();
          this.alignVideo(a.name);
        };
        container.appendChild(btn);
      });
    });
    this.addSeparator();
    this.addSection((_this$options$section4 = this.options.sectionLabels) == null ? void 0 : _this$options$section4.video, container => {
      const btnUrl = document.createElement('button');
      btnUrl.type = 'button';
      btnUrl.innerHTML = ICONS.editUrl;
      btnUrl.title = this.options.editUrlTitle;
      btnUrl.onclick = e => {
        e.stopPropagation();
        this.showUrlInput();
      };
      container.appendChild(btnUrl);
      const btnTitle = document.createElement('button');
      btnTitle.type = 'button';
      btnTitle.innerHTML = ICONS.editTitle;
      btnTitle.title = this.options.editTitleTitle;
      btnTitle.onclick = e => {
        e.stopPropagation();
        this.showTitleInput();
      };
      container.appendChild(btnTitle);
      const btnCaption = document.createElement('button');
      btnCaption.type = 'button';
      btnCaption.innerHTML = ICONS.editCaption;
      btnCaption.title = this.options.editCaptionTitle;
      btnCaption.onclick = e => {
        e.stopPropagation();
        this.showCaptionInput();
      };
      container.appendChild(btnCaption);
      const btnLoading = document.createElement('button');
      btnLoading.type = 'button';
      btnLoading.innerHTML = ICONS.loading + ' <span style="font-size:9px;opacity:.7">Lazy</span>';
      btnLoading.title = 'Toggle lazy loading';
      btnLoading.dataset.action = 'loading';
      btnLoading.onclick = e => {
        e.stopPropagation();
        this.toggleLoading();
      };
      container.appendChild(btnLoading);
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.innerHTML = ICONS.trash;
      btnDelete.title = this.options.deleteTitle;
      btnDelete.style.color = '#ff4d4d';
      btnDelete.onclick = e => {
        e.stopPropagation();
        this.deleteVideo();
      };
      container.appendChild(btnDelete);
    });
    this.addSeparator();
    this.addSection((_this$options$section5 = this.options.sectionLabels) == null ? void 0 : _this$options$section5.insert, container => {
      const btnAfter = document.createElement('button');
      btnAfter.type = 'button';
      btnAfter.innerHTML = this.options.buttonAfterLabel;
      btnAfter.title = this.options.buttonAfterTitle;
      btnAfter.onclick = e => {
        e.stopPropagation();
        this.insertParagraphAfter();
      };
      container.appendChild(btnAfter);
    });
  }
  showUrlInput() {
    const iframe = this.getIframe();
    if (!iframe) return;
    const currentUrl = iframe.src || '';
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
    btnOk.onclick = e => {
      e.stopPropagation();
      this.setVideoUrl(input.value);
      this.hideInputBar();
    };
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.onclick = e => {
      e.stopPropagation();
      this.hideInputBar();
    };
    input.onkeydown = e => {
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
  showTitleInput() {
    const iframe = this.getIframe();
    if (!iframe) return;
    const currentTitle = iframe.getAttribute('title') || '';
    if (this.toolbar) this.toolbar.style.display = 'none';
    this.inputBar = document.createElement('div');
    this.inputBar.className = 'ql-video-input-bar';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.placeholder = 'Video title (accessibility)';
    input.style.width = '250px';
    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.innerHTML = ICONS.check;
    btnOk.onclick = e => {
      e.stopPropagation();
      this.setTitle(input.value);
      this.hideInputBar();
    };
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.onclick = e => {
      e.stopPropagation();
      this.hideInputBar();
    };
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        this.setTitle(input.value);
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
  showCaptionInput() {
    var _figcaption$textConte;
    if (!this.selectedFigure) return;
    const figcaption = this.selectedFigure.querySelector('figcaption');
    const currentCaption = (figcaption == null || (_figcaption$textConte = figcaption.textContent) == null ? void 0 : _figcaption$textConte.trim()) || '';
    if (this.toolbar) this.toolbar.style.display = 'none';
    this.inputBar = document.createElement('div');
    this.inputBar.className = 'ql-video-input-bar';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentCaption;
    input.placeholder = 'Video caption';
    input.style.width = '250px';
    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.innerHTML = ICONS.check;
    btnOk.onclick = e => {
      e.stopPropagation();
      this.setCaption(input.value);
      this.hideInputBar();
    };
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.onclick = e => {
      e.stopPropagation();
      this.hideInputBar();
    };
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        this.setCaption(input.value);
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
  hideInputBar() {
    if (this.inputBar) {
      this.inputBar.remove();
      this.inputBar = null;
    }
    if (this.toolbar) {
      this.toolbar.style.display = 'flex';
      this.reposition();
    }
  }
  setVideoUrl(url) {
    const iframe = this.getIframe();
    if (!iframe) return;
    const cleanUrl = url.trim();
    if (cleanUrl) {
      iframe.src = transformVideoUrl(cleanUrl);
    }
  }
  setTitle(title) {
    const iframe = this.getIframe();
    if (!iframe) return;
    const clean = title.trim();
    if (clean) {
      iframe.setAttribute('title', clean);
    } else {
      iframe.removeAttribute('title');
    }
  }
  setCaption(caption) {
    if (!this.selectedFigure) return;
    const figcaption = this.selectedFigure.querySelector('figcaption');
    if (!figcaption) return;
    const clean = caption.trim();
    if (clean) {
      figcaption.textContent = clean;
      figcaption.style.display = 'table-caption';
    } else {
      figcaption.textContent = '';
      figcaption.style.display = 'none';
    }
  }
  toggleLoading() {
    const iframe = this.getIframe();
    if (!iframe) return;
    const current = iframe.getAttribute('loading') || 'lazy';
    iframe.setAttribute('loading', current === 'lazy' ? 'eager' : 'lazy');
    this.updateLoadingButton();
  }
  updateLoadingButton() {
    if (!this.toolbar) return;
    const btn = this.toolbar.querySelector('[data-action="loading"]');
    if (!btn) return;
    const iframe = this.getIframe();
    const loading = (iframe == null ? void 0 : iframe.getAttribute('loading')) || 'lazy';
    const label = loading === 'eager' ? 'Eager' : 'Lazy';
    btn.innerHTML = ICONS.loading + (" <span style=\"font-size:9px;opacity:.7\">" + label + "</span>");
    btn.title = "Toggle lazy loading (currently: " + loading + ")";
    btn.classList.toggle('active', loading === 'eager');
  }
  setSize(size) {
    if (!this.selectedFigure) return;
    let finalSize = size.trim();
    if (/^\d+$/.test(finalSize)) finalSize += 'px';
    this.selectedFigure.style.width = finalSize;
    this.saveVideoStyles();
    this.updateActiveButtons();
    setTimeout(() => {
      this.reposition();
    }, 100);
  }
  showSizeInput() {
    if (!this.selectedFigure) return;
    let currentWidth = this.selectedFigure.style.width || Math.round(this.selectedFigure.getBoundingClientRect().width) + 'px';
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
    btnOk.onclick = e => {
      e.stopPropagation();
      this.setSize(input.value);
      this.hideInputBar();
    };
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.onclick = e => {
      e.stopPropagation();
      this.hideInputBar();
    };
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        this.setSize(input.value);
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
  alignVideo(align) {
    if (!this.selectedFigure) return;
    const el = this.selectedFigure;
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.float = '';
    el.style.margin = '';
    el.style.marginLeft = '';
    el.style.marginRight = '';
    el.style.verticalAlign = 'top';
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
    }, 100);
  }
  deleteVideo() {
    if (!this.selectedFigure) return;
    const blot = Quill.find(this.selectedFigure);
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.selectedFigure = null;
      this.hideOverlay();
      this.quill.deleteText(index, 1, 'user');
    }
  }
  insertParagraphBefore() {
    if (!this.selectedFigure) return;
    const blot = Quill.find(this.selectedFigure);
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index, 0, 'user');
      this.deselectVideo();
    }
  }
  insertParagraphAfter() {
    if (!this.selectedFigure) return;
    const blot = Quill.find(this.selectedFigure);
    if (blot) {
      const index = this.quill.getIndex(blot) + 1;
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index + 1, 0, 'user');
      this.deselectVideo();
    }
  }
  saveVideoStyles() {
    if (!this.selectedFigure) return;
    const blot = Quill.find(this.selectedFigure);
    if (blot) {
      const index = this.quill.getIndex(blot);
      if (index >= 0) {
        var _figcaption$textConte2;
        const iframe = this.getIframe();
        const figcaption = this.selectedFigure.querySelector('figcaption');
        let caption = (figcaption == null || (_figcaption$textConte2 = figcaption.textContent) == null ? void 0 : _figcaption$textConte2.trim()) || null;
        if (figcaption && figcaption.style.display === 'none') {
          caption = null;
        }
        const formats = {
          style: this.selectedFigure.getAttribute('style'),
          title: (iframe == null ? void 0 : iframe.getAttribute('title')) || null,
          loading: (iframe == null ? void 0 : iframe.getAttribute('loading')) || 'lazy',
          caption: caption
        };
        this.quill.formatText(index, 1, formats, 'user');
      }
    }
  }
  reposition() {
    if (!this.selectedFigure || !this.overlay) return;
    const rect = this.selectedFigure.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
    this.overlay.style.top = top + "px";
    this.overlay.style.left = left + "px";
    this.overlay.style.width = rect.width + "px";
    this.overlay.style.height = rect.height + "px";
    const activeBar = this.inputBar && this.inputBar.parentNode ? this.inputBar : this.toolbar;
    if (!activeBar) return;
    const barWidth = activeBar.offsetWidth || 300;
    let barLeft = left + rect.width / 2 - barWidth / 2;
    if (barLeft < 5) barLeft = 5;
    const maxLeft = containerRect.width - barWidth - 5;
    if (barLeft > maxLeft) barLeft = maxLeft;
    activeBar.style.left = barLeft + "px";
    const barHeight = activeBar.offsetHeight || 40;
    let barTop = top - barHeight - 10;
    if (barTop < 0) barTop = 5;
    activeBar.style.top = barTop + "px";
  }
  isCurrentAlign(name) {
    if (!this.selectedFigure) return false;
    const style = this.selectedFigure.style;
    switch (name) {
      case 'leftBlock':
        return style.display === 'flex' && (style.float === '' || style.float === 'none') && style.marginLeft === '0px';
      case 'center':
        return style.display === 'flex' && style.marginLeft === 'auto' && style.marginRight === 'auto';
      case 'left':
        return style.float === 'left';
      case 'right':
        return style.float === 'right';
    }
    return false;
  }
  updateActiveButtons() {
    if (!this.selectedFigure || !this.toolbar) return;
    this.toolbar.querySelectorAll('button[data-align]').forEach(btn => {
      const a = btn.dataset.align;
      if (a && this.isCurrentAlign(a)) btn.classList.add('active');else btn.classList.remove('active');
    });
    this.toolbar.querySelectorAll('button[data-size]').forEach(btn => {
      const s = btn.dataset.size;
      if (s && this.selectedFigure.style.width === s) btn.classList.add('active');else btn.classList.remove('active');
    });
  }
  addSection(label, callback) {
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
    this.toolbar.appendChild(section);
  }
  addSeparator() {
    const sep = document.createElement('div');
    sep.className = 'ql-toolbar-separator';
    this.toolbar.appendChild(sep);
  }
  setupHandles() {
    if (!this.overlay) return;
    const positions = [{
      top: '-7px',
      left: '-7px',
      side: 'nw'
    }, {
      top: '-7px',
      right: '-7px',
      side: 'ne'
    }, {
      bottom: '-7px',
      left: '-7px',
      side: 'sw'
    }, {
      bottom: '-7px',
      right: '-7px',
      side: 'se'
    }];
    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = 'ql-video-handle';
      if (pos.top) handle.style.top = pos.top;
      if (pos.bottom) handle.style.bottom = pos.bottom;
      if (pos.left) handle.style.left = pos.left;
      if (pos.right) handle.style.right = pos.right;
      handle.dataset.side = pos.side;
      handle.addEventListener('mousedown', this.handleMouseDown.bind(this));
      handle.addEventListener('dragstart', e => e.preventDefault());
      this.overlay.appendChild(handle);
    });
  }
}