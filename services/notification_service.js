// notification_service.js


export class NotificationService {
  static basicNotification({ id, title, message }) {
    if (id) {
      return chrome.notifications.clear(id, () => {
        chrome.notifications.create(id, {
          type: "basic",
          iconUrl: "icon.png",
          title: title,
          message: message,
        });
      });
    } else {
      return chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: title,
        message: message,
      });
    }
  }

} 