"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PasswordInput({ password, setPassword }) {
  return (
    <div className="mt-6 w-full">
      <Label htmlFor="password">Mật khẩu</Label>
      <Input
        id="password"
        type="password"
        placeholder="Nhập password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
}
