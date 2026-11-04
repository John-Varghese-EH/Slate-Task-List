export const registerServiceWorker = (): void => {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.update();
        })
        .catch(() => {});
    });
  }
};
