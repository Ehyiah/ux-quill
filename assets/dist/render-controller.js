import { Controller } from '@hotwired/stimulus';

/*
 * This controller is used to ensure that the necessary styles for rendering
 * Quill content are loaded via Symfony UX auto-import.
 */
export default class extends Controller {
  connect() {
    // No logic needed, just being here triggers the CSS auto-import
  }
}