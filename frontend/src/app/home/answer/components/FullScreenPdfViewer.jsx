"use client";
import { useEffect, useRef } from "react";

export default function FullScreenPdfViewer({ url, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const enterFullscreen = async () => {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[10000] flex justify-center items-center"
    >
      {/* Nút đóng */}
      <button
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          onClose();
        }}
        className="absolute top-5 right-5 z-[10001] px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700"
      >
        ✕ Đóng
      </button>

      {/* iframe hiển thị PDF */}
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-[90vw] h-[90vh] relative z-[10000] rounded border"
        title="PDF Viewer"
      />
    </div>
  );
}
