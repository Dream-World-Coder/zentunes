export const historyStack = [];

export function addToHistory(pathname) {
  if (historyStack.includes(pathname)) return;

  historyStack.push(pathname);
  if (historyStack.length > 6) {
    historyStack.shift(); // keep only last 6
  }

  localStorage.setItem("history", JSON.stringify(historyStack));
}

export function getLastRoutes() {
  const res = [...historyStack];
  if (res.length > 0) return res;

  const stored = localStorage.getItem("history");
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log("getLastRoutes : ", e);
    return [];
  }
}
