function sendPostRequest({ endpoint, data, method }) {
  const baseUrl = "https://copy-n-sync-backend.vercel.app/";

  return new Promise((resolve, reject) => {
    fetch(baseUrl + endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

document.addEventListener('DOMContentLoaded', async function() {
    const id = await getStorage("userId")
    console.log(id);
    if(id){
        document.getElementById("home_container").style.display = "flex";
        loadData()
    } else {
        document.getElementById("main_container").style.display = "flex";
        
    }
});  

document.addEventListener("click", async function (event) {
  const e = event.target;
  if (e.matches("#start-service-btn")) {
    chrome.runtime.sendMessage({ action: "resume-service" });
    console.log("Start from UI");
  } else if(e.matches("#stop-service-btn")){
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
        data: data,
        method: "POST"
      })
        .then(({data}) => {
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
        loadData()
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


  async function loadData(){
    clipIsLoading(true);
    const id = await getStorage("userId");
    let texts = '';
    await sendPostRequest({
      endpoint: `get/texts/?id=${id}`,
      method: "GET"
    }).then((res) => {
      texts = res.data;
      console.log(res.data);
    }).catch(() => {

    })

    const reversed_text = texts.reverse();
    
    const all_clips = document.getElementById('all-clips');
    let html = '';
    reversed_text.forEach(element => {
      html += `<div class="clip_history_single">
      <div class="clip_history_text"><p>${element.text}</p></div>
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
    </div>`
    });
    clipIsLoading(false);
    all_clips.innerHTML = html;
  }
