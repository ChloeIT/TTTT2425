"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function UploadFile({ file, setFile, preview, setPreview }) {
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      return alert("Vui lòng chọn file ảnh hợp lệ!");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFile(selectedFile);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Tải lên chữ ký ảnh</Label>
        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      {preview ? (
        <Card className="relative max-w-xs">
          <CardContent className="p-2">
            <AspectRatio ratio={4 / 2}>
              <img
                src={preview}
                alt="Preview chữ ký"
                className="rounded object-contain w-full h-full"
              />
            </AspectRatio>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2"
            >
              &times;
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">Chưa có chữ ký được chọn</p>
      )}

      {file && (
        <p className="text-sm text-muted-foreground">
          <strong>{file.name}</strong> — {(file.size / 1024).toFixed(2)} KB
        </p>
      )}
    </div>
  );
}
