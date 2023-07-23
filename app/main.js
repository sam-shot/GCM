function sendPostRequest({ endpoint, body, method}) {
  const baseUrl = "https://copy-n-sync-backend.vercel.app/";
  // const baseUrl = "http://127.0.0.1:3000";

  return new Promise((resolve, reject) => {
    fetch(baseUrl + endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body,
    })
      .then((response) => response.json())
      .then((responseData) => resolve(responseData))
      .catch((error) => reject(error));
  });
}
function sendImageRequest({ body}) {
  const baseUrl = "https://copy-n-sync-backend.vercel.app/upload";
  // const baseUrl = "http://127.0.0.1:3000";

  return new Promise((resolve, reject) => {
    fetch(baseUrl, {
      method: "POST",
      body: body,
    })
      .then((response) => response.json())
      .then((responseData) => resolve(responseData))
      .catch((error) => reject(error));
  });
}

function isLoading(status) {
  if (status) {
    document.getElementById("overlay").style.display = "flex";
  } else {
    document.getElementById("overlay").style.display = "none";
  }
}
function clipIsLoading(status) {
  if (status) {
    document.getElementById("clip-loader").style.display = "flex";
  } else {
    document.getElementById("clip-loader").style.display = "none";
  }
}

function notify(data) {
  document.getElementById("notification").style.display = "flex";
  document.getElementById("notification_text").innerHTML = data;
}
function notifyOff() {
  document.getElementById("notification").style.display = "none";
}

function getStorage(key) {
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

function setStorage(key, value) {
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

document.addEventListener("DOMContentLoaded", async function () {
  const id = await getStorage("userId");
  console.log(id);
  if (id) {
    document.getElementById("home_container").style.display = "flex";
    loadData();
  } else {
    document.getElementById("main_container").style.display = "flex";
  }
});

document.addEventListener("click", async function (event) {
  const e = event.target;
  if (e.matches("#start-service-btn")) {
    chrome.runtime.sendMessage({ action: "resume-service" });
    console.log("Start from UI");
  } else if (e.matches("#stop-service-btn")) {
    chrome.runtime.sendMessage({ action: "stop-service" });
    console.log("Stop from UI");
  }
});

document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    var emailValue = document.getElementById("email-input").value.trim();
    var passwordValue = document.getElementById("password-input").value.trim();
    event.preventDefault();

    if (emailValue !== "" && passwordValue !== "") {
      isLoading(true);

      const data = {
        email: emailValue,
        password: passwordValue,
      };


      await sendPostRequest({
        endpoint: "auth/login",
        body: JSON.stringify(data),
        method: "POST",
      })
        .then(({ data }) => {
          if (!data) {
            notify("Incorrect Password or Email!");
          setTimeout(() => {
            notifyOff();
          }, 3000);
          } else {
            console.log(data.id);
          setStorage("userId", data.id);
          chrome.runtime.sendMessage({ action: "start" });
          isLoading(false);
          notify("Login Successful");
          setTimeout(() => {
            notifyOff();
          }, 3000);
          document.getElementById("main_container").style.display = "none";
          document.getElementById("home_container").style.display = "flex";
          loadData();
          }
        })
        .catch((e) => {
          console.log(e);
          notify(e);
          setTimeout(() => {
            notifyOff();
          }, 3000);
        });

      isLoading(false);
    } else {
    }
  });

document
  .getElementById("upload-file")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData();
    const file = document.getElementById("file-input");

    if (file.files.length == 0) {
      notify("No File Selected!");
      setTimeout(() => {
        notifyOff();
      }, 1000);
    } else {
      
    isLoading(true);
      const id = await getStorage("userId");
      const token = await getStorage("token");

      formData.append("file", file.files[0]);
      formData.append("userId", id);
      formData.append("deviceId", token);
      await sendImageRequest({
        body: formData
      })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          notify(e.message);
          setTimeout(() => {
            notifyOff();
          }, 1000);
          console.log(e);
        });
      isLoading(false);
    }
  });

  document.getElementById("file-input").addEventListener("change", function (event) {
    event.preventDefault();
    const file = document.getElementById("file-input");
    const fileNameRenderer = document.getElementById("file-name");

    if (file.files.length !== 0) {
      console.log(file.files[0].name);
      fileNameRenderer.innerHTML = file.files[0].name
    } else if ( file.files.length <= 1){
      
      fileNameRenderer.innerHTML = "Choose one file only!"
    } else{
      
      fileNameRenderer.innerHTML = "No File Selected!"
    }

    
  });


async function loadData() {
  clipIsLoading(true);
  const id = await getStorage("userId");
  let texts = "";
  await sendPostRequest({
    endpoint: `get/texts/?id=${id}`,
    method: "GET",
  })
    .then((res) => {
      texts = res.data;
      console.log(res.data);
    })
    .catch(() => {});

  const reversed_text = texts.reverse();

  const all_clips = document.getElementById("all-clips");
  let html = "";
  reversed_text.forEach((element) => {
    html += `<div class="clip_history_single">
      <div class="clip_history_text"><p>${element.text.toString()}</p></div>
      <div class="clip_history_actions">
          <div class="time">
              <p>${element.time}</p>
          </div>
          <div class="icons">
              <i class="uil uil-message history_action"></i>
          <i class="uil uil-clipboard-notes history_action"></i>
          <i class="uil uil-trash history_action"></i>
          </div>
      </div>
    </div>`;
  });
  clipIsLoading(false);
  all_clips.innerHTML = html;
}
