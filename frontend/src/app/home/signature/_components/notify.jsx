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

import { getUserEmail, notifyUserByEmail } from "@/actions/secretary-password-action";

const Notify = ({ isOpen, onClose, exam }) => {
  const [groupedEmails, setGroupedEmails] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [displayEmails, setDisplayEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUserEmail() 
        .then((data) => {
          setGroupedEmails(data); 
          const departments = Object.keys(data); 
          if (departments.length > 0) {
            const firstDepartment = departments[0];
            setSelectedDepartment(firstDepartment);
            const emailsForFirstDepartment = data[firstDepartment] || [];
            setDisplayEmails(emailsForFirstDepartment);
            if (emailsForFirstDepartment.length > 0) {
              setSelectedEmail(emailsForFirstDepartment[0]);
            } else {
              setSelectedEmail("");
            }
          } else {
            setSelectedDepartment("");
            setDisplayEmails([]);
            setSelectedEmail("");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách email được nhóm:", err);
          toast.error("Lỗi khi lấy danh sách email!");
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartment && groupedEmails[selectedDepartment]) {
      const emailsForSelectedDepartment = groupedEmails[selectedDepartment];
      setDisplayEmails(emailsForSelectedDepartment); 
      if (emailsForSelectedDepartment.length > 0) {
        setSelectedEmail(emailsForSelectedDepartment[0]);
      } else {
        setSelectedEmail(""); 
      }
    } else {
      setDisplayEmails([]);
      setSelectedEmail("");
    }
  }, [selectedDepartment, groupedEmails]);

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
            {/* Dropdown để chọn Phòng ban */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="department-select">Chọn phòng ban</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                id="department-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(groupedEmails).length > 0 ? (
                    Object.keys(groupedEmails).map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-department" disabled> 
                      Không có phòng ban nào
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown để chọn Email */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email-select">Chọn email</Label>
              <Select
                value={selectedEmail}
                onValueChange={setSelectedEmail}
                id="email-select"
                disabled={!selectedDepartment || displayEmails.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn email" />
                </SelectTrigger>
                <SelectContent>
                  {displayEmails.length > 0 ? (
                    displayEmails.map((email) => (
                      <SelectItem key={email} value={email}>
                        {email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-email" disabled> 
                      Không có email nào cho phòng ban này
                    </SelectItem>
                  )}
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