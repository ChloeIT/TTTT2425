"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import UploadFile from "./_components/upload-file";
import PasswordInput from "./_components/password-input";
import UploadButton from "./_components/upload-button";
import { uploadSignature } from "@/actions/sign-action";
import { signatureSchema } from "@/schemas/sign.schema";

export default function SignaturePage({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
   
    const data = { file, password };
  
    const parsed = signatureSchema.safeParse(data);

if (!parsed.success) {
  const errors = parsed.error.format();
  const errorMessage =
    errors.file?._errors?.[0] ||
    errors.password?._errors?.[0] ||
    "Dữ liệu không hợp lệ";

  toast.error(errorMessage);
  return;
}
  
    setLoading(true);
    try {
      const res = await uploadSignature(file, password);
      toast.success(res.message || "Upload chữ ký thành công");
      setPassword("");
      setFile(null);
      setPreview(null);
      if (onUpload) onUpload(res.signature);
    } catch (error) {
      console.log("Lỗi server:", error.message);
      toast.error(error.message || "Lỗi upload chữ ký");
    }
    window.location.reload();
    setLoading(false);
  };
  

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Toaster position="top-right" />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Upload chữ ký tay</CardTitle>
          <CardDescription>Vui lòng chọn file chữ ký và nhập password để upload</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UploadFile file={file} setFile={setFile} preview={preview} setPreview={setPreview} />
          <PasswordInput password={password} setPassword={setPassword} />
          <div className="flex justify-end">
            <UploadButton loading={loading} onClick={handleUpload} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
