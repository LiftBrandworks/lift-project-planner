"use client";

import { useEffect } from "react";

const messageType = "project-planner:resize";

export function EmbedResizeBridge() {
  useEffect(() => {
    if (window.parent === window) {
      return;
    }

    let animationFrame = 0;

    function sendHeight() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.ceil(
          Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          )
        );

        window.parent.postMessage({ type: messageType, height }, "*");
      });
    }

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    sendHeight();

    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
    };
  }, []);

  return null;
}
