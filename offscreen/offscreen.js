import { ClipboardManager } from "../services/clipboard_service.js";
import { sendSWMessage } from "./utils.js";

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
  if (message.target !== "offscreen") return;
  //
  switch (message.action) {
    case "start-clip-listen":
      ClipboardManager.startClipboardListen(() => {
        sendSWMessage({
          action: "clip-update"
        });
      });
      break;

    case "stop-clip-listen":
      ClipboardManager.stopClipboardListen();
    break;
    case "clip-write":
      ClipboardManager.writeText(message.data)
    break;
  }
}
