import Quill from 'quill';
import ImageUploader from "./imageUploader.js";
Quill.register('modules/imageUploader', ImageUploader);
import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
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
import { TableContainerBlot, TableBodyBlot, TableRowBlot, TableCellBlot, TableCellBlock } from "./blots/tableBlots.js";
import { TableModule } from "./modules/tableModule.js";
Quill.register({
  'formats/table': TableContainerBlot,
  'formats/table-body': TableBodyBlot,
  'formats/table-row': TableRowBlot,
  'formats/table-cell': TableCellBlot,
  'formats/table-cell-block': TableCellBlock,
  'modules/table': TableModule
}, true);