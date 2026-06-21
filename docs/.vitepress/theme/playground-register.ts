// ============================================================
// CSS — imported here so they load only when playground is used
// ============================================================
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'quill-table-better/dist/quill-table-better.css'
import 'quill2-emoji/dist/style.css'
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'
import '../../../assets/dist/styles/gallery/gallery.css'
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
QuillTableBetter.register()
Quill.register('modules/table-better', QuillTableBetter, true)
Quill.register('modules/mention', Mention)


