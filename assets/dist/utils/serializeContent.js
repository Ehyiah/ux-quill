export function serializeContent(root) {
  const content = document.createElement('div');
  content.innerHTML = root.innerHTML;
  return serializeHtml(content.innerHTML);
}
export function serializeHtml(html) {
  const content = document.createElement('div');
  content.innerHTML = html;
  content.querySelectorAll('.ql-cell-focused, .ql-cell-selected').forEach(cell => {
    cell.classList.remove('ql-cell-focused', 'ql-cell-selected');
    if (cell.classList.length === 0) {
      cell.removeAttribute('class');
    }
  });
  return content.innerHTML;
}