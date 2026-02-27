import Quill from 'quill';
import ImageUploader from "./imageUploader.js";
Quill.register('modules/imageUploader', ImageUploader);
import * as Emoji from 'quill2-emoji';
Quill.register('modules/emoji', Emoji);
import QuillResizeImage from 'quill-resize-image';
Quill.register('modules/resize', QuillResizeImage);
import { SmartLinks } from "./modules/smartLinks.js";
Quill.register('modules/smartLinks', SmartLinks);
import { Counter } from "./modules/counterModule.js";
Quill.register('modules/counter', Counter);
import QuillToggleFullscreenButton from 'quill-toggle-fullscreen-button';
Quill.register('modules/toggleFullscreen', QuillToggleFullscreenButton);
import htmlEditButton from 'quill-html-edit-button';
Quill.register('modules/htmlEditButton', htmlEditButton.default || htmlEditButton);
import ReadingTime from "./modules/readtimeModule.js";
Quill.register('modules/readingTime', ReadingTime);
import { Divider } from "./modules/divider.js";
Quill.register('modules/divider', Divider);
import { PageBreak } from "./modules/pageBreak.js";
Quill.register('modules/pageBreak', PageBreak);
import { Markdown } from "./modules/markdown.js";
Quill.register('modules/markdown', Markdown);
import { ImageAttributes } from "./modules/imageAttributes.js";
Quill.register('modules/imageAttributes', ImageAttributes);
import { LinkAttributes } from "./modules/linkAttributes.js";
Quill.register('modules/linkAttributes', LinkAttributes);
import { Autosave } from "./modules/autosave.js";
Quill.register('modules/autosave', Autosave);
import { PasteSanitizer } from "./modules/pasteSanitizer.js";
Quill.register('modules/pasteSanitizer', PasteSanitizer);
const icons = Quill.import('ui/icons');
if (icons) {
  icons['divider'] = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line></svg>';
  icons['pageBreak'] = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="5" y2="5" style="stroke-dasharray: 2, 2"/><line class="ql-stroke" x1="3" x2="15" y1="13" y2="13" style="stroke-dasharray: 2, 2"/><polyline class="ql-stroke" points="6 11 9 8 12 11"/><polyline class="ql-stroke" points="6 7 9 10 12 7"/></svg>';
}
import DragAndDrop from "./modules/dragAndDrop.js";
Quill.register('modules/dragAndDrop', DragAndDrop);
import SpeechToText from "./modules/speechToText.js";
Quill.register('modules/speechToText', SpeechToText);
import * as hljsModule from 'highlight.js';
const hljs = hljsModule.default || hljsModule;
// @ts-ignore
window.hljs = hljs;
import * as katexModule from 'katex';
const katex = katexModule.default || katexModule;
// @ts-ignore
window.katex = katex;