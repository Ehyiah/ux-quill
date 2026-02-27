import Quill from 'quill';

import ImageUploader from './imageUploader.ts'
Quill.register('modules/imageUploader', ImageUploader);

import * as Emoji from 'quill2-emoji';
Quill.register('modules/emoji', Emoji);

import QuillResizeImage from 'quill-resize-image';
Quill.register('modules/resize', QuillResizeImage);

import {SmartLinks} from './modules/smartLinks.ts';
Quill.register('modules/smartLinks', SmartLinks);

import {Counter} from './modules/counterModule.ts';
Quill.register('modules/counter', Counter);

import QuillToggleFullscreenButton from 'quill-toggle-fullscreen-button';
Quill.register('modules/toggleFullscreen', QuillToggleFullscreenButton);

import htmlEditButton from 'quill-html-edit-button';
Quill.register('modules/htmlEditButton', htmlEditButton.default || htmlEditButton);

import ReadingTime from './modules/readtimeModule.ts';
Quill.register('modules/readingTime', ReadingTime);

import NodeMover from './modules/nodeMover.ts';
Quill.register('modules/nodeMover', NodeMover);

import SpeechToText from './modules/speechToText.ts';
Quill.register('modules/speechToText', SpeechToText);

import * as hljsModule from 'highlight.js';
const hljs = hljsModule.default || hljsModule;
// @ts-ignore
window.hljs = hljs;

import * as katexModule from 'katex';
const katex = katexModule.default || katexModule;
// @ts-ignore
window.katex = katex;
