// utils.js


export function sendSWMessage({ action, data }) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action, data });
    }
  }
  