import { useEffect } from "react";

export const usePushStateListener = (callback: (url: string) => void): void => {
  useEffect(() => {
    // make a copy of original function to avoid complications
    const originalPushState = history.pushState;

    history.pushState = function (data, title, url) {
      originalPushState.apply(history, [data, title, url]);
      // Ensure that url is a string before calling the callback
      if (typeof url === "string") {
        callback(url);
      }
    };

    return () => {
      history.pushState = originalPushState; // restore the original function
    };
  }, [callback]);
};
