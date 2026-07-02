function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
class QuillHtmlLogger {
  constructor() {
    this.debug = false;
  }
  setDebug(debug) {
    this.debug = debug;
  }
  get log() {
    if (!this.debug) return function () {};
    const prefix = '</> quill-html-edit-button: ';
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return console.log(prefix, ...args);
    };
  }
}
const Logger = new QuillHtmlLogger();
function $create(elName) {
  return document.createElement(elName);
}
function $setAttr(el, key, value) {
  return el.setAttribute(key, value);
}
function convertMultipleSpacesToSingle(input) {
  return input.replace(/\s+/g, ' ').trim();
}
function preserveNewlinesBr(input) {
  return input.replace(/<br([\s]*[/]?>)/g, '<p> </p>');
}
function preserveNewlinesPTags(input) {
  return input.replace(/<p><\/p>/g, '<p> </p>');
}
function fixTagSpaceOpenTag(input) {
  return input.replace(/(<(?!\/)[\w=\."'\s]*>) /g, '$1');
}
function fixTagSpaceCloseTag(input) {
  return input.replace(/ (<\/[\w]+>)/g, '$1');
}
function compose(functions, input) {
  return functions.reduce((acc, cur) => cur(acc), input);
}
function outputHTMLParser(inputHtmlFromQuillPopup) {
  return compose([convertMultipleSpacesToSingle, fixTagSpaceOpenTag, fixTagSpaceCloseTag, preserveNewlinesBr, preserveNewlinesPTags], inputHtmlFromQuillPopup);
}
function formatHTMLStringIndentation(code) {
  let stripWhiteSpaces = true;
  let stripEmptyLines = true;
  const whitespace = '  ';
  let currentIndent = 0;
  const newlineChar = '\n';
  let prevChar = null;
  let char = null;
  let nextChar = null;
  let result = '';
  for (let pos = 0; pos <= code.length; pos++) {
    prevChar = char;
    char = code.substr(pos, 1);
    nextChar = code.substr(pos + 1, 1);
    const isBrTag = code.substr(pos, 4) === '<br>';
    const isOpeningTag = char === '<' && nextChar !== '/' && !isBrTag;
    const isClosingTag = char === '<' && nextChar === '/' && !isBrTag;
    const isTagEnd = prevChar === '>' && char !== '<' && currentIndent > 0;
    const isTagNext = !isBrTag && !isOpeningTag && !isClosingTag && isTagEnd && code.substr(pos, code.substr(pos).indexOf('<')).trim() === '';
    if (isBrTag) {
      result += newlineChar;
      currentIndent--;
      pos += 4;
    }
    if (isOpeningTag) {
      result += newlineChar + whitespace.repeat(currentIndent);
      currentIndent++;
    } else if (isClosingTag) {
      if (--currentIndent < 0) currentIndent = 0;
      result += newlineChar + whitespace.repeat(currentIndent);
    } else if (stripWhiteSpaces && char === ' ' && nextChar === ' ') {
      continue;
    } else if (stripEmptyLines && char === newlineChar) {
      if (code.substr(pos, code.substr(pos).indexOf('<')).trim() === '') {
        continue;
      }
    }
    if (isTagEnd && !isTagNext) {
      result += newlineChar + whitespace.repeat(currentIndent);
    }
    result += char;
  }
  Logger.log('formatHTML', {
    before: code,
    after: result
  });
  return result;
}
function launchPopupEditor(quill, options, saveCallback) {
  const htmlFromEditor = quill.container.querySelector('.ql-editor').innerHTML;
  const popupContainer = $create('div');
  const overlayContainer = $create('div');
  const msg = options.msg || 'Edit HTML here, when you click "OK" the quill editor\'s contents will be replaced';
  const cancelText = options.cancelText || 'Cancel';
  const okText = options.okText || 'Ok';
  const closeOnClickOverlay = options.closeOnClickOverlay !== false;
  $setAttr(overlayContainer, 'class', 'ql-html-overlayContainer');
  $setAttr(popupContainer, 'class', 'ql-html-popupContainer');
  const popupTitle = $create('span');
  $setAttr(popupTitle, 'class', 'ql-html-popupTitle');
  popupTitle.innerText = msg;
  const textContainer = $create('div');
  textContainer.appendChild(popupTitle);
  $setAttr(textContainer, 'class', 'ql-html-textContainer');
  const codeBlock = $create('pre');
  $setAttr(codeBlock, 'data-language', 'xml');
  codeBlock.innerText = formatHTMLStringIndentation(htmlFromEditor);
  const htmlEditor = $create('div');
  $setAttr(htmlEditor, 'class', 'ql-html-textArea');
  const buttonCancel = $create('button');
  buttonCancel.innerHTML = cancelText;
  $setAttr(buttonCancel, 'class', 'ql-html-buttonCancel');
  const buttonOk = $create('button');
  buttonOk.innerHTML = okText;
  $setAttr(buttonOk, 'class', 'ql-html-buttonOk');
  const buttonGroup = $create('div');
  $setAttr(buttonGroup, 'class', 'ql-html-buttonGroup');
  const prependSelector = options.prependSelector ? document.querySelector(options.prependSelector) : null;
  buttonGroup.appendChild(buttonCancel);
  buttonGroup.appendChild(buttonOk);
  htmlEditor.appendChild(codeBlock);
  textContainer.appendChild(htmlEditor);
  textContainer.appendChild(buttonGroup);
  popupContainer.appendChild(textContainer);
  overlayContainer.appendChild(popupContainer);
  if (prependSelector) {
    prependSelector.prepend(overlayContainer);
  } else {
    document.body.appendChild(overlayContainer);
  }
  const modules = options.editorModules;
  const hasModules = !!modules && !!Object.keys(modules).length;
  const modulesSafe = hasModules ? modules : {};
  const editor = new Quill(htmlEditor, {
    modules: _extends({
      syntax: options.syntax || false
    }, modulesSafe)
  });
  buttonCancel.onclick = function () {
    if (prependSelector) {
      prependSelector.removeChild(overlayContainer);
    } else {
      document.body.removeChild(overlayContainer);
    }
  };
  if (closeOnClickOverlay) {
    overlayContainer.onclick = buttonCancel.onclick;
  }
  popupContainer.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
  };
  buttonOk.onclick = function () {
    const container = editor.container;
    const qlElement = container.querySelector('.ql-editor');
    const htmlInputFromPopup = qlElement.innerText;
    const htmlOutputFormatted = outputHTMLParser(htmlInputFromPopup);
    Logger.log('OutputHTMLParser', {
      htmlInputFromPopup,
      htmlOutputFormatted
    });
    saveCallback(htmlOutputFormatted);
    if (prependSelector) {
      prependSelector.removeChild(overlayContainer);
    } else {
      document.body.removeChild(overlayContainer);
    }
  };
}
export class HtmlEditButton {
  constructor(quill, optionsInput) {
    if (optionsInput === void 0) {
      optionsInput = {};
    }
    const options = optionsInput || {};
    const debug = !!(options && options.debug);
    Logger.setDebug(debug);
    Logger.log('logging enabled');
    const toolbarModule = quill.getModule('toolbar');
    if (!toolbarModule) {
      throw new Error('quill.htmlEditButton requires the "toolbar" module to be included too');
    }
    const toolbarEl = toolbarModule.container;
    const buttonContainer = $create('span');
    $setAttr(buttonContainer, 'class', 'ql-formats');
    const button = $create('button');
    button.innerHTML = options.buttonHTML || '&lt;&gt;';
    button.title = options.buttonTitle || 'Show HTML source';
    button.type = 'button';
    const onSave = html => {
      quill.clipboard.dangerouslyPasteHTML(html);
    };
    button.onclick = function (e) {
      e.preventDefault();
      launchPopupEditor(quill, options, onSave);
    };
    buttonContainer.appendChild(button);
    toolbarEl == null || toolbarEl.appendChild(buttonContainer);
  }
}
export default HtmlEditButton;