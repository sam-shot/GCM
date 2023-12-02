// clipboard.js
import { g } from "../global.js";
import { sendSWMessage } from "../offscreen/utils.js";
import { StorageService } from "./storage_service.js";


export class ClipboardManager{
  static startClipboardListen(onClipboardChanged) {
    g.clipboardInterval = setInterval(() => {
      const text = document.createElement("textarea");
      text.value = "";
      document.body.append(text);
      text.select();
      document.execCommand("paste");
      
      g.currentClipboardData = text.value;
      console.log(g.currentClipboardData);
      if (
        g.previousClipboardData !== g.currentClipboardData &&
        g.currentClipboardData !== "" &&
        g.previousClipboardData !== "" && !g.firstClipboardData
      ) {
        
        
        
          sendSWMessage({
            action: "new-text",
            data: g.currentClipboardData
          });
          onClipboardChanged();
       
      }
      g.firstClipboardData = false;
      g.previousClipboardData = g.currentClipboardData;
      text.remove();
    }, 900);
  }
  
  static stopClipboardListen() {
    clearInterval(g.clipboardInterval);
    g.firstClipboardData = true;
    g.clipboardInterval = null;
  }

  static writeText(data){
    const text2 = document.createElement("textarea");
    document.body.append(text2);
    text2.value = data;
    text2.select();
    document.execCommand("copy");
    text2.remove();
    g.previousClipboardData = data;
  }
}

