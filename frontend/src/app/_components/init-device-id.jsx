// app/_components/InitDeviceId.tsx
"use client";

import { useEffect } from "react";

export function InitDeviceId() {
  useEffect(() => {
    const cookieName = "deviceId";

    const getCookie = (name) => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? match[2] : null;
    };

    const setCookie = (name, value, days) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; path=/; expires=${expires}`;
    };

    const deviceId = getCookie(cookieName);

    if (!deviceId) {
      const newDeviceId = crypto.randomUUID();
      setCookie(cookieName, newDeviceId, 365); // Lưu 1 năm
      console.log("New deviceId set:", newDeviceId);
    } else {
      console.log("Existing deviceId:", deviceId);
    }
  }, []);

  return null;
}
