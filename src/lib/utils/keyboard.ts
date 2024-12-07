export function getSubmitShortcut() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return {
    isMac,
    shortcut: isMac ? '⌘ + Enter' : 'Ctrl + Enter',
    icon: isMac ? '⌘' : 'Ctrl'
  };
}
