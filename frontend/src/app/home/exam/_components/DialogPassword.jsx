"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { currentUser } from "@/actions/auth-action";
import { getSignedExamFiles, openExam } from "@/actions/exams-action";


export default function DialogPassword({ setData, setPreviewUrl, setPreviewTitle, setError, error, open, setOpen,
  selectedExam, inputPassword, setInputPassword }) {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const res = await currentUser();
      if (res.data.user) {
        setUser(res.data.user);
      }
    };
    getCurrentUser();
  }, []);

  const handleCheckPassword = async () => {
    if (!selectedExam) return;

    try {
      const res = await openExam(selectedExam.id, user.id, inputPassword)
      const resFile = await getSignedExamFiles(selectedExam.id)
      setPreviewUrl(resFile.data.questionFile);
      setPreviewTitle(selectedExam.title);
      setOpen(false);
      setData((prevData) =>
        prevData.map((exam) =>
          exam.id === selectedExam.id
            ? {
              ...exam,
              attemptCount: Math.min((exam.attemptCount || 0) + 1, 3),
              status: "DA_THI",
            }
            : exam
        )
      );
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối tới server");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập mật khẩu</DialogTitle>
            <DialogDescription>
              Đề thi: <strong>{selectedExam?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input type="password" placeholder="Nhập mật khẩu đề thi" value={inputPassword} onChange={(e) =>
            setInputPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCheckPassword}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
