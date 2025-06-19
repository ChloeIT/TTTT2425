"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function FullScreenPdfViewer({ url, onClose, title }) {
  const containerRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const enterFullscreen = async () => {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    };
    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      // Thoát fullscreen khi component bị unmount
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[10000] flex justify-center items-center"
    >
      {/* Nút Đóng */}
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute top-5 right-5 z-[10001] px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700"
      >
        ✕ Đóng
      </button>

      {/* Hiển thị PDF */}
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-[90vw] h-[90vh] relative z-[10000] rounded border"
        title="PDF Viewer"
      />

      {/* Dialog xác nhận (custom, không dùng Portal) */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10002] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Xác nhận đóng đề thi</h2>
            <p className="text-sm mb-4">
              Bạn có chắc chắn muốn đóng đề thi <strong>{title}</strong> không?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  onClose();
                }}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
