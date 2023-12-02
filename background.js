import { g } from "./global.js";
import { sendPostRequest } from "./services/api_services.js";
import { ClipboardManager } from "./services/clipboard_service.js";
import { NotificationService } from "./services/notification_service.js";
import { StorageService } from "./services/storage_service.js";
import { SW } from "./utils_sw.js";

var sendTextId = "send-text";
var receiveTextId = "receive-text";
var welcomeId = "welcome-id";

var userId = "";

////////////////////////////////// SERVICE WORKER TEXT

// Inside your service worker
self.addEventListener("message", (event) => {
  switch (event.data.action) {
    case "clip-update":
      NotificationService.basicNotification({
        title: "Copy n Sync",
        message: "You just copied a text, click here to Sync!",
        id: sendTextId,
      });
      break;
    case "new-text":
      console.log(event.data.data);
      StorageService.write("g", event.data.data);
      break;
  }
});

////////////////////////////////// SERVICE WORKER TEXT ENDS

chrome.runtime.onInstalled.addListener(async (details) => {
  await SW.registeroffScreen();
  const registered = await StorageService.get("isRegistered");
  if (registered) {
    SW.startListen();

    NotificationService.basicNotification({
      title: "test",
      message: details.reason,
    });
  } else {
    console.log("Unregistered device");
  }
});

chrome.runtime.onStartup.addListener(async (details) => {});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  switch (message.action) {
    case "start":
      userId = await StorageService.get("userId");
      const token = await StorageService.get("token");
      const isRegistered = await StorageService.get("isRegistered");
      console.log(token);
      console.log(userId);
      if (!token) {
        console.log("No token about to get a token");
        await SW.getToken()
          .then(() => {
            SW.registeroffScreen();
            SW.startListen();
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        if (!isRegistered) {
          console.log("deice not registered on install make i reigster");
          await SW.linkDevice(token)
            .then(() => {
              console.log("Device registration successful");
              SW.registeroffScreen();
              SW.startListen();
              NotificationService.basicNotification({
                title: "Welcome to Copy n Sync",
                message: "Now you will copy and paste seemlessly",
                id: welcomeId,
              });
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          console.log("Device already registered");
          chrome.runtime.sendMessage({
            action: "start-clip-listen",
            target: "offscreen",
          });
        }
      }
      break;
    case "resume-service":
      await SW.registeroffScreen();
      SW.startListen();
      break;
    case "stop-service":
      SW.stopListen();
      break;
  }
});

chrome.instanceID.onTokenRefresh.addListener(() => {
  SW.getToken();
});

chrome.gcm.onMessage.addListener((message) => {
  const data = message.data["message"];
  console.log(data);
  SW.writeToClipboard(data);
  NotificationService.basicNotification({
    title: "You just received a Text",
    message: "Paste directly anywhere",
    id: receiveTextId,
  });
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === "send-text") {
    const token = await StorageService.get("token");
    const currentClipboardData = await StorageService.get("g");
    const id = await StorageService.get("userId");
    sendPostRequest(
      {
        endpoint: "send/text",
        data: {
          userId: id,
          firebaseId: token,
          text: currentClipboardData,
        },
      },
      (responseData) => {},
      (error) => {
        console.log("Error:", error);
        NotificationService.basicNotification({
          title: "Error",
          message: "Please try again",
        });
      }
    );

    console.log("Notification " + notificationId + " Clicked");
  }
});
