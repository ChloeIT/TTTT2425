"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Notify from "./notify"; 

const PasswordList = ({ passwords }) => {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  if (!passwords || passwords.length === 0) {
    return <p>Không có mật khẩu đề thi nào.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMap = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Không hoạt động",
    EXPIRED: "Hết hạn",
  };

  const handleOpenNotify = (exam) => {
    setSelectedExam(exam);
    setNotifyOpen(true);
  };

  const handleCloseNotify = () => {
    setNotifyOpen(false);
    setSelectedExam(null);
  };

  const handleSendNotification = (message) => {
    // TODO: Gọi API gửi thông báo với `selectedExam` và `message`
    alert(
      `Gửi thông báo cho đề thi "${selectedExam.title}" với nội dung:\n${message}`
    );
    // Đóng modal sau khi gửi
    handleCloseNotify();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Mật khẩu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Ngày duyệt</TableHead>
       
          </TableRow>
        </TableHeader>
        <TableBody>
          {passwords.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.decryptedPassword || "-"}</TableCell>
              <TableCell>{statusMap[item.status] || item.status}</TableCell>
              <TableCell>{item.createdBy?.fullName || "Không rõ"}</TableCell>
              <TableCell>{item.createdBy?.email || "Không rõ"}</TableCell>
              <TableCell>{item.createdBy?.department || "Không rõ"}</TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
              <TableCell>{formatDate(item.updatedAt)}</TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenNotify(item)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Gửi thông báo
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Notify */}
      <Notify
        isOpen={notifyOpen}
        onClose={handleCloseNotify}
        onSend={handleSendNotification}
        exam={selectedExam}
      />
    </>
  );
};

export default PasswordList;
