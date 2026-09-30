export const AI_SUBMENU_DISMISS_EVENT = 'ai-assistant:dismiss-submenus';

export function dismissAiSubmenu(): void {
  document.dispatchEvent(new Event(AI_SUBMENU_DISMISS_EVENT));
}
