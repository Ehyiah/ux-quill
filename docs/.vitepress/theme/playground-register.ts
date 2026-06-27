// ============================================================
// CSS — imported here so they load only when playground is used
// ============================================================
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'quill-table-better/dist/quill-table-better.css'
import 'quill2-emoji/dist/style.css'
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'
import 'leaflet/dist/leaflet.css'
import '../../../assets/dist/styles/gallery/gallery.css'
import '../../../assets/dist/styles/map-modal.css'
import '../../../assets/dist/styles/quill-content.css'

// ============================================================
// Module registrations (reuse the already‑compiled dist files)
// ============================================================

// The main registration file registers ALL custom modules + third‑party ones
// (smartLinks, counter, readingTime, imageSelection, nodeMover, divider,
//  pageBreak, markdown, linkAttributes, autosave, pasteSanitizer, speechToText,
//  imageUploader, emoji, resize, fullscreen, htmlEditButton, imageGallery)
// It also exposes hljs and katex on window.
import '../../../assets/dist/register-modules.js'

// Extra registrations that register-modules.js does NOT handle
import Quill from 'quill'
import ImageFigure from '../../../assets/dist/blots/imageFigure.js'
import QuillTableBetter from 'quill-table-better'
import { Mention } from '../../../assets/dist/modules/mention.js'

Quill.register(ImageFigure, true)

// Save original Toolbar.attach before TableToolbar potentially overrides it
const OriginalToolbar = Quill.import('modules/toolbar')
const originalAttach = OriginalToolbar.prototype.attach

// This registers table formats + overrides modules/toolbar with TableToolbar
QuillTableBetter.register()

// Wrap TableToolbar.attach to not crash when table-better module is absent
const TableToolbar = Quill.import('modules/toolbar')
const tableToolbarAttach = TableToolbar.prototype.attach
TableToolbar.prototype.attach = function (this: any, input: HTMLElement) {
  const tableBetter = this.quill?.getModule('table-better')
  if (!tableBetter) {
    return originalAttach.call(this, input)
  }
  return tableToolbarAttach.call(this, input)
}

Quill.register('modules/table-better', QuillTableBetter, true)
Quill.register('modules/mention', Mention)


