export const historyStack = [];

export function addToHistory(pathname) {
  if (historyStack.includes(pathname)) return;

  historyStack.push(pathname);
  if (historyStack.length > 6) {
    historyStack.shift(); // keep only last 6
  }
}

export function getLastRoutes() {
  return [...historyStack];
}
