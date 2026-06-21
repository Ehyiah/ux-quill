<template>
  <div class="quill-playground">
    <div class="playground-controls">
      <label>
        Theme
        <select v-model="theme">
          <option value="snow">Snow</option>
          <option value="bubble">Bubble</option>
        </select>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" v-model="readOnly" />
        Read only
      </label>

      <div v-if="showStats" class="playground-stats">
        <span class="playground-stat" id="playground-counter"></span>
        <span class="playground-stat" id="playground-reading-time"></span>
      </div>
    </div>

    <div class="playground-editor">
      <div ref="editorRef"></div>
    </div>

    <div class="playground-output">
      <div class="playground-output-header">
        <span>HTML Output</span>
        <button @click="copyOutput" :disabled="!htmlOutput">Copy</button>
      </div>
      <pre><code>{{ htmlOutput }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  enabled?: string
  placeholder?: string
}>(), {
  enabled: 'all',
  placeholder: 'Try all the features… type @ to mention someone, paste a URL for smart links, etc.',
})

const enabledList = computed(() => {
  if (props.enabled === 'all') return ['all']
  return props.enabled.split(',').map(s => s.trim()).filter(Boolean)
})

interface ModuleDefEntry {
  toolbar: any[]
  config: Record<string, any>
}

const MODULE_DEFS: Record<string, ModuleDefEntry> = {
  imageSelection: {
    toolbar: ['image'],
    config: { imageSelection: {}, resize: {} },
  },
  table: {
    toolbar: ['table-better'],
    config: { table: false, 'table-better': { toolbarTable: true } },
  },
  emoji: {
    toolbar: ['emoji'],
    config: { 'emoji-toolbar': {} },
  },
  divider: {
    toolbar: ['divider', 'pageBreak'],
    config: { divider: {}, pageBreak: {} },
  },
  markdown: {
    toolbar: [],
    config: { markdown: true },
  },
  smartLinks: {
    toolbar: [],
    config: { smartLinks: { linkRegex: '/https?:\\/\\/[^\\s]+/' } },
  },
  linkAttributes: {
    toolbar: [],
    config: { linkAttributes: {} },
  },
  pasteSanitizer: {
    toolbar: [],
    config: { pasteSanitizer: { plainText: false } },
  },
  nodeMover: {
    toolbar: [],
    config: { nodeMover: {} },
  },
  autosave: {
    toolbar: [],
    config: { autosave: { key: 'playground-demo', interval: 30000 } },
  },
  speechToText: {
    toolbar: [],
    config: { speechToText: { language: 'en-US' } },
  },
  mention: {
    toolbar: [],
    config: {
      mention: {
        trigger: '@',
        min_chars: 1,
        max_results: 8,
        data: [
          { id: 1, value: 'Alice Johnson' },
          { id: 2, value: 'Bob Smith' },
          { id: 3, value: 'Charlie Brown' },
          { id: 4, value: 'Diana Prince' },
          { id: 5, value: 'Eve Wilson' },
          { id: 6, value: 'Frank Castle' },
        ],
      },
    },
  },
  counter: {
    toolbar: [],
    config: { counter: { container: '#playground-counter', unit: 'word' } },
  },
  readingTime: {
    toolbar: [],
    config: { readingTime: { container: '#playground-reading-time', wordsPerMinute: 200 } },
  },
  toggleFullscreen: {
    toolbar: [],
    config: { toggleFullscreen: {} },
  },
  htmlEditButton: {
    toolbar: [],
    config: { htmlEditButton: {} },
  },
  imageGallery: {
    toolbar: ['imageGallery'],
    config: {
      imageGallery: {
        listEndpoint: '/ux-quill/gallery-mock.json',
        searchEndpoint: '/ux-quill/gallery-mock.json',
        uploadEndpoint: 'https://httpbin.org/post',
        buttonTitle: 'Open the media gallery',
        uploadTitle: '⬆️ Upload',
        messageTitleOption: 'Media gallery',
        messageLoadingOption: 'Loading…',
        messageNextPageOption: 'Next page >',
        messagePrevPageOption: '< Previous page',
        messageErrorOption: 'Error',
        messageNoImageOption: 'No image',
        messageSearchPlaceholderOption: 'Search…',
        messageCloseOption: 'Close',
      },
    },
  },
}

const BASE_TOOLBAR = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block', 'formula'],
  [{ script: 'sub' }, { script: 'super' }],
  [{ color: [] }, { background: [] }],
  ['clean'],
]

const isAll = () => enabledList.value.length === 1 && enabledList.value[0] === 'all'

const showStats = computed(() => isAll() || enabledList.value.includes('counter') || enabledList.value.includes('readingTime'))

const editorRef = ref<HTMLDivElement>()
const htmlOutput = ref('')
const theme = ref('snow')
const readOnly = ref(false)

let quill: any = null
let mounted = false

function buildConfig() {
  const toolbar: any[] = isAll() ? [...BASE_TOOLBAR] : []
  const modules: Record<string, any> = {}

  if (isAll()) {
    return {
      toolbar: [
        ...BASE_TOOLBAR,
        ['link', 'image', 'video'],
        ['emoji'],
        ['table-better'],
        ['divider', 'pageBreak'],
        ['imageGallery'],
      ],
      modules: {
        table: false,
        'table-better': { toolbarTable: true },
        'emoji-toolbar': {},
        toggleFullscreen: {},
        htmlEditButton: {},
        imageGallery: {
          listEndpoint: '/ux-quill/gallery-mock.json',
          searchEndpoint: '/ux-quill/gallery-mock.json',
          uploadEndpoint: 'https://httpbin.org/post',
          buttonTitle: 'Open the media gallery',
          uploadTitle: '⬆️ Upload',
          messageTitleOption: 'Media gallery',
          messageLoadingOption: 'Loading…',
          messageNextPageOption: 'Next page >',
          messagePrevPageOption: '< Previous page',
          messageErrorOption: 'Error',
          messageNoImageOption: 'No image',
          messageSearchPlaceholderOption: 'Search…',
          messageCloseOption: 'Close',
        },
        counter: { container: '#playground-counter', unit: 'word' },
        readingTime: { container: '#playground-reading-time', wordsPerMinute: 200 },
        markdown: true,
        smartLinks: { linkRegex: '/https?:\\/\\/[^\\s]+/' },
        linkAttributes: {},
        pasteSanitizer: { plainText: false },
        imageSelection: {},
        nodeMover: {},
        divider: {},
        pageBreak: {},
        autosave: { key: 'playground-demo', interval: 30000 },
        speechToText: { language: 'en-US' },
        mention: {
          trigger: '@',
          min_chars: 1,
          max_results: 8,
          data: [
            { id: 1, value: 'Alice Johnson' },
            { id: 2, value: 'Bob Smith' },
            { id: 3, value: 'Charlie Brown' },
            { id: 4, value: 'Diana Prince' },
            { id: 5, value: 'Eve Wilson' },
            { id: 6, value: 'Frank Castle' },
          ],
        },
      },
    }
  }

  if (enabledList.value.includes('counter')) {
    modules.counter = { container: '#playground-counter', unit: 'word' }
  }
  if (enabledList.value.includes('readingTime')) {
    modules.readingTime = { container: '#playground-reading-time', wordsPerMinute: 200 }
  }

  for (const name of enabledList.value) {
    const def = MODULE_DEFS[name]
    if (!def) continue
    if (def.toolbar.length > 0) {
      toolbar.push(def.toolbar)
    }
    Object.assign(modules, def.config)
  }

  return { toolbar, modules }
}

async function initEditor() {
  if (!editorRef.value) return

  await import('../playground-register')
  const { default: Quill } = await import('quill')

  const { toolbar, modules } = buildConfig()

  const config = {
    theme: theme.value,
    readOnly: readOnly.value,
    placeholder: props.placeholder,
    modules: {
      toolbar,
      ...modules,
    },
  }

  quill = new Quill(editorRef.value, config)

  htmlOutput.value = quill.root.innerHTML

  quill.on('text-change', () => {
    htmlOutput.value = quill.root.innerHTML
  })
}

onMounted(async () => {
  mounted = true
  await nextTick()
  await initEditor()
})

watch(theme, async () => {
  if (mounted) {
    quill = null
    await nextTick()
    const el = editorRef.value
    if (el) {
      const parent = el.parentElement
      if (parent) {
        parent.querySelectorAll('.ql-toolbar, .ql-stt-bar, .ql-table-menus-container').forEach(t => t.remove())
        parent.classList.remove('ql-container')
      }
      el.className = ''
      el.innerHTML = ''
    }
    await initEditor()
  }
})

watch(readOnly, (val) => {
  if (quill) {
    quill.enable(!val)
  }
})

function copyOutput() {
  if (navigator.clipboard && htmlOutput.value) {
    navigator.clipboard.writeText(htmlOutput.value)
  }
}

onBeforeUnmount(() => {
  quill = null
  mounted = false
})
</script>

<style>
.quill-playground {
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.playground-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #d0d5dd;
  font-size: 14px;
  flex-wrap: wrap;
}

.playground-controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.playground-controls select {
  padding: 4px 8px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #344054;
}

.playground-controls .checkbox-label input {
  margin: 0;
}

.playground-stats {
  margin-left: auto;
  display: flex;
  gap: 16px;
}

.playground-stat {
  font-size: 12px;
  color: #667085;
}

.playground-stat:empty {
  display: none;
}

.playground-editor .ql-editor {
  min-height: 320px;
  font-size: 15px;
  line-height: 1.7;
}

.playground-editor .ql-toolbar {
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.playground-output {
  border-top: 1px solid #d0d5dd;
}

.playground-output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  color: #344054;
}

.playground-output-header button {
  padding: 4px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  color: #344054;
}

.playground-output-header button:hover:not(:disabled) {
  background: #f0f1f3;
}

.playground-output-header button:disabled {
  opacity: 0.5;
  cursor: default;
}

.playground-output pre {
  margin: 0;
  padding: 16px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.playground-output code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Ensure quill-table-better columns have visible width from the start */
.ql-editor table.ql-table-better {
  table-layout: fixed;
}
.ql-editor td {
  min-width: 100px;
}
</style>
