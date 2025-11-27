import Quill from 'quill';

import ImageUploader from './imageUploader.ts'
Quill.register('modules/imageUploader', ImageUploader);

import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
Quill.register('modules/emoji', Emoji);

import QuillResizeImage from 'quill-resize-image';
Quill.register('modules/resize', QuillResizeImage);

import { SmartLinks } from './modules/smartLinks.ts';
Quill.register('modules/smartLinks', SmartLinks);

import { Counter } from './modules/counterModule.ts';
Quill.register('modules/counter', Counter);

import QuillToggleFullscreenButton from 'quill-toggle-fullscreen-button';
Quill.register('modules/toggleFullscreen', QuillToggleFullscreenButton);

import htmlEditButton from 'quill-html-edit-button';
Quill.register('modules/htmlEditButton', htmlEditButton.default || htmlEditButton);

import { TableContainerBlot, TableBodyBlot, TableRowBlot, TableCellBlot, TableCellBlock } from './blots/tableBlots.ts';
import { TableModule } from './modules/tableModule.ts';

Quill.register({
    'formats/table': TableContainerBlot,
    'formats/table-body': TableBodyBlot,
    'formats/table-row': TableRowBlot,
    'formats/table-cell': TableCellBlot,
    'formats/table-cell-block': TableCellBlock,
    'modules/table': TableModule,
}, true);

// Register table icon in Quill's icon registry to replace the default "TABLE" text
const icons = Quill.import('ui/icons');
icons['table'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>';
