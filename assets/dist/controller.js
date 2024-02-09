function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import axios from 'axios';
import ImageUploader from 'quill-image-uploader';
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
Quill.register('modules/imageUploader', ImageUploader);
import 'quill-emoji/dist/quill-emoji.css';
import * as Emoji from 'quill-emoji';
Quill.register('modules/emoji', Emoji);
var _default = /*#__PURE__*/function (_Controller) {
  _inheritsLoose(_default, _Controller);
  function _default() {
    return _callSuper(this, _default, arguments);
  }
  var _proto = _default.prototype;
  _proto.connect = function connect() {
    var _this = this;
    var toolbarOptionsValue = this.toolbarOptionsValue;
    var options = {
      debug: this.extraOptionsValue.debug,
      modules: {
        toolbar: toolbarOptionsValue,
        'emoji-toolbar': true,
        'emoji-shortname': true
      },
      placeholder: this.extraOptionsValue.placeholder,
      theme: this.extraOptionsValue.theme
    };
    if (this.extraOptionsValue.upload_handler.path !== null && this.extraOptionsValue.upload_handler.type === 'form') {
      Object.assign(options.modules, {
        imageUploader: {
          upload: function upload(file) {
            return new Promise(function (resolve, reject) {
              var formData = new FormData();
              formData.append('file', file);
              axios.post(_this.extraOptionsValue.upload_handler.path, formData).then(function (response) {
                resolve(response.data);
              })["catch"](function (err) {
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
          upload: function upload(file) {
            return new Promise(function (resolve, reject) {
              var reader = function reader(file) {
                return new Promise(function (resolve) {
                  var fileReader = new FileReader();
                  fileReader.onload = function () {
                    return resolve(fileReader.result);
                  };
                  fileReader.readAsDataURL(file);
                });
              };
              reader(file).then(function (result) {
                return axios.post(_this.extraOptionsValue.upload_handler.path, result, {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }).then(function (response) {
                  resolve(response.data);
                })["catch"](function (err) {
                  reject('Upload failed');
                  console.log(err);
                });
              });
            });
          }
        }
      });
    }
    var heightDefined = this.extraOptionsValue.height;
    if (null !== heightDefined) {
      this.editorContainerTarget.style.height = this.extraOptionsValue.height;
    }
    var quill = new Quill(this.editorContainerTarget, options);
    quill.on('text-change', function () {
      var quillContent = quill.root.innerHTML;
      var inputContent = _this.inputTarget;
      inputContent.value = quillContent;
    });
  };
  return _default;
}(Controller);
_default.targets = ['input', 'editorContainer'];
_default.values = {
  toolbarOptions: {
    type: Array,
    "default": []
  },
  extraOptions: {
    type: Object,
    "default": {}
  }
};
export { _default as default };