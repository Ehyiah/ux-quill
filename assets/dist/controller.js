import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import ImageUploader from './imageUploader.js';
Quill.register('modules/imageUploader', ImageUploader);
import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
Quill.register('modules/emoji', Emoji);
import axios from 'axios';
export default class _Class extends Controller {
  connect() {
    const toolbarOptionsValue = this.toolbarOptionsValue;
    const options = {
      debug: this.extraOptionsValue.debug,
      modules: {
        toolbar: toolbarOptionsValue,
        'emoji-toolbar': true
      },
      placeholder: this.extraOptionsValue.placeholder,
      theme: this.extraOptionsValue.theme
    };
    if (this.extraOptionsValue.upload_handler.path !== null && this.extraOptionsValue.upload_handler.type === 'form') {
      Object.assign(options.modules, {
        imageUploader: {
          upload: file => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('file', file);
              axios.post(this.extraOptionsValue.upload_handler.path, formData).then(response => {
                resolve(response.data);
              }).catch(err => {
                reject('Upload failed');
                console.log(err);
              });
            });
          }
        }
      });
    }
    if (this.extraOptionsValue.upload_handler.path !== null && this.extraOptionsValue.upload_handler.type === 'json') {
      Object.assign(options.modules, {
        imageUploader: {
          upload: file => {
            return new Promise((resolve, reject) => {
              const reader = file => {
                return new Promise(resolve => {
                  const fileReader = new FileReader();
                  fileReader.onload = () => resolve(fileReader.result);
                  fileReader.readAsDataURL(file);
                });
              };
              reader(file).then(result => axios.post(this.extraOptionsValue.upload_handler.path, result, {
                headers: {
                  'Content-Type': 'application/json'
                }
              }).then(response => {
                resolve(response.data);
              }).catch(err => {
                reject('Upload failed');
                console.log(err);
              }));
            });
          }
        }
      });
    }
    const heightDefined = this.extraOptionsValue.height;
    if (null !== heightDefined) {
      this.editorContainerTarget.style.height = heightDefined;
    }
    const quill = new Quill(this.editorContainerTarget, options);
    quill.on('text-change', () => {
      const quillContent = quill.root.innerHTML;
      const inputContent = this.inputTarget;
      inputContent.value = quillContent;
    });
  }
}
_Class.targets = ['input', 'editorContainer'];
_Class.values = {
  toolbarOptions: {
    type: Array,
    default: []
  },
  extraOptions: {
    type: Object,
    default: {}
  }
};