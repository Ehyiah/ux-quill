import Quill from 'quill';

import ImageUploader from './imageUploader.ts'
Quill.register('modules/imageUploader', ImageUploader);

import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
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

import SpeechToText from './modules/speechToText.ts';
Quill.register('modules/speechToText', SpeechToText);

import {PlaceholderModule} from './modules/placeHolderModule/placeHolderModule.ts';
// import './modules/placeHolderModule/placeHolderModule.css';
Quill.register('modules/placeholder', PlaceholderModule);
