import DefaultTheme from 'vitepress/theme'
import QuillPlayground from './components/QuillPlayground.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuillPlayground', QuillPlayground)
  },
}
