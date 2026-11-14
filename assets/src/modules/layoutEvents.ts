/**
 * Emitted on the Quill emitter after a layout has been changed outside of the
 * regular text flow (preset switch, column added/removed, layout duplicated or
 * unwrapped). Content serialization lives in the DOM, so listeners must resync
 * the underlying form field when this fires.
 */
export const LAYOUT_CHANGE_EVENT = 'ux-quill:layout-change';
