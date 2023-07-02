// storage_service.js


export class StorageService {
  static get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }
  
  static write(key, value) {
    const data = {
      [key]: value,
    };
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Data saved to local storage");
      }
    });
  }
}

  