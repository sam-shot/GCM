// api services.js

export function sendPostRequest({ endpoint, data }, onSuccess, onError) {
    const baseUrl = "https://copy-n-sync-backend.vercel.app/";
  
    return fetch(baseUrl + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => onSuccess(responseData))
      .catch((error) => onError(error));
  }