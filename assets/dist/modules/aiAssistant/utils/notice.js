export function showAiNotice(messageText, closeLabel, anchor) {
  var _document$querySelect;
  (_document$querySelect = document.querySelector('.ai-assistant-notice')) == null || _document$querySelect.remove();
  const notice = document.createElement('div');
  notice.className = 'ai-assistant-notice';
  const message = document.createElement('span');
  message.className = 'ai-assistant-notice-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.textContent = messageText;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'ai-assistant-notice-close';
  closeButton.setAttribute('aria-label', closeLabel);
  closeButton.textContent = '\u00D7';
  notice.append(message, closeButton);
  const editorRect = anchor.getBoundingClientRect();
  const visibleLeft = Math.max(0, editorRect.left);
  const visibleRight = Math.min(window.innerWidth, editorRect.right);
  const visibleTop = Math.max(0, editorRect.top);
  const visibleBottom = Math.min(window.innerHeight, editorRect.bottom);
  const centerX = visibleRight > visibleLeft ? (visibleLeft + visibleRight) / 2 : window.innerWidth / 2;
  const centerY = visibleBottom > visibleTop ? (visibleTop + visibleBottom) / 2 : window.innerHeight / 2;
  notice.style.left = centerX + "px";
  notice.style.top = centerY + "px";
  document.body.appendChild(notice);
  const dismissTimeout = window.setTimeout(() => notice.remove(), 6000);
  closeButton.addEventListener('click', () => {
    window.clearTimeout(dismissTimeout);
    notice.remove();
  });
}