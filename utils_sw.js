// SW utils.js

import { SENDER_ID } from "./global.js";
import { sendPostRequest } from "./services/api_services.js";
import { NotificationService } from "./services/notification_service.js";
import { StorageService } from "./services/storage_service.js";

export class SW {
  static async startListen() {
    await SW.registeroffScreen();
    chrome.runtime.sendMessage({
      action: "start-clip-listen",
      target: "offscreen",
    });
  }

  static stopListen() {
    chrome.runtime.sendMessage({
      action: "stop-clip-listen",
      target: "offscreen",
    });
  }

  static writeToClipboard(data) {
    chrome.runtime.sendMessage({
      action: "clip-write",
      target: "offscreen",
      data: data,
    });
  }

  static async getToken() {
    return new Promise(async (resolve, reject) => {
      const tokenParams = {
        authorizedEntity: SENDER_ID,
        scope: "GCM",
      };
      let token = await new Promise((resolve, reject) => {
        let r = chrome.instanceID.getToken(tokenParams, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });
      if (token) {
        StorageService.write("token", token);
        await SW.linkDevice(token).then(() => {
          resolve();
        });
      } else {
        reject("Token not generated");
      }
      console.log(token);
    });
  }

  static async registeroffScreen() {
    const isActive = await chrome.offscreen.hasDocument();

    if (isActive) return;
    await chrome.offscreen.createDocument({
      url: "./offscreen/offscreen.html",
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: "CLIPBOARD",
    });
  }

  static linkDevice(token) {
    return new Promise(async (resolve, reject) => {
      const deviceName = navigator.userAgentData["platform"];
      const userId = await StorageService.get("userId");
      console.log("Device Name:", deviceName);
      await sendPostRequest(
        {
          endpoint: "user/updateDeviceId",
          data: {
            userId: userId,
            firebaseId: token,
            deviceName: deviceName,
          },
        },
        async (responseData) => {
          console.log(responseData);
          if (responseData.status === "200") {
            StorageService.write("isRegistered", true);
            NotificationService.basicNotification({
              title: "Device Link Successful",
              message: `Your Device (${deviceName}) has been linked successfully`,
            });
            resolve();
          }
        },
        (error) => {
          console.log("Error:", error);
          NotificationService.basicNotification({
            title: "Error",
            message: "Please try again",
          });
          reject(error); // Reject the promise if there's an error in the request
        }
      );
    });
  }
}
