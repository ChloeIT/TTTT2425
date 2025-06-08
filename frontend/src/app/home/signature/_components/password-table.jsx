"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PasswordList = ({ passwords }) => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          
          <TableHead>Tiêu đề đề thi</TableHead>
          <TableHead>Mật khẩu</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Người tạo</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead>Ngày cập nhật</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {passwords.map((item) => (
          <TableRow key={item.id}>
          
            <TableCell>{item.title}</TableCell>
        
            <TableCell>{item.decryptedPassword || "-"}</TableCell>
            <TableCell>{statusMap[item.status] || item.status}</TableCell>
            <TableCell>{item.createdBy?.username || "Không rõ"}</TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell>{formatDate(item.updatedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PasswordList;
