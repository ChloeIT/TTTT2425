"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmailUsers, notifyUserByEmail } from "@/actions/secretary-password-action";

const Notify = ({ isOpen, onClose, exam }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getEmailUsers()
        .then((emailList) => {
          setEmails(emailList);
          if (emailList.length > 0) {
            setSelectedEmail(emailList[0]);
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy email:", err);
          toast.error("Lỗi khi lấy danh sách email!");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendClick = async () => {
    if (!selectedEmail || !exam?.decryptedPassword || !exam?.title) {
      toast.error("Thiếu thông tin để gửi.");
      return;
    }

    setSending(true);
    try {
      await notifyUserByEmail(selectedEmail, exam.decryptedPassword, exam.title);
      toast.success("Gửi thông báo thành công!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Gửi thất bại:", error);
      toast.error("Gửi thông báo thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg sm:w-full">
          <DialogHeader>
            <DialogTitle>Gửi thông báo cho: {exam?.title}</DialogTitle>
            <DialogDescription>Thông báo</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email-select">Chọn email</Label>
              <Select
                value={selectedEmail}
                onValueChange={setSelectedEmail}
                id="email-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn email" />
                </SelectTrigger>
                <SelectContent>
                  {emails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="text"
                value={exam?.decryptedPassword || ""}
                readOnly
                placeholder="Mật khẩu sẽ hiển thị tại đây"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={onClose} className="mr-2" disabled={sending}>
              Đóng
            </Button>
            <Button
              disabled={!selectedEmail || !exam?.decryptedPassword || sending}
              onClick={handleSendClick}
            >
              {sending ? "Đang gửi..." : "Gửi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Notify;
