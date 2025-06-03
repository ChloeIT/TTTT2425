import { Button } from "@/components/ui/button";

export default function UploadButton({ loading, onClick }) {
  return (
    <Button
      className="mt-6 w-full"
      onClick={onClick}
      disabled={loading}
      variant="default" 
    >
      {loading ? "Đang upload..." : "Upload chữ ký"}
    </Button>
  );
}
