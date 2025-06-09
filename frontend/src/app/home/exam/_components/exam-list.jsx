"use client";

import { useEffect, useState } from "react";
import { ApprovedExamsList } from "@/actions/exams-action";
import { parseToNumber } from "@/lib/utils";
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
import ExamQuestion from "../../sign/sign_exam/_components/exam";

const ExamList = ({ page, query }) => {
  const [data, setData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [examToOpen, setExamToOpen] = useState(null); 
  const currentPage = parseToNumber(page, 1);

  useEffect(() => {
    const fetchExams = async () => {
      const res = await ApprovedExamsList({ page: currentPage, query });
      setData(res.data);
    };
    fetchExams();
  }, [currentPage, query]);

  const handleOpen = (exam) => {
    setSelectedExam(exam);
    setInputPassword("");
    setError("");
    setOpen(true);
  };

  useEffect(()=> {

  },[])

const handleCheckPassword = async () => {
  if (!selectedExam) return;

  try {
    const res = await fetch("http://localhost:5000/exams/verify-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 👈 THÊM DÒNG NÀY
      body: JSON.stringify({
        examId: selectedExam.id,
        password: inputPassword,
      }),
    });

    const result = await res.json();
    console.log(result)

    if (res.ok) {
      setOpen(false);
      setExamToOpen(selectedExam);
      
      // window.open(result.fileUrl, "_blank");
      // setOpen(false);
    } else {
      setError(result.error || "Đã xảy ra lỗi");
    }
  } catch (err) {
    setError("Lỗi kết nối tới server");
  }
};


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">
        Đề Thi
      </h1>

      {data.map((exam, id) => (
        <div
          key={id}
          className="max-w-xl mx-auto space-y-4 cursor-pointer"
          onClick={() => handleOpen(exam)}
        >
          <div className="bg-blue-100 p-4 rounded shadow hover:bg-blue-200">
            <p className="font-semibold text-blue-800">{exam.title}</p>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập mật khẩu</DialogTitle>
            <DialogDescription>
              Đề thi: <strong>{selectedExam?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Nhập mật khẩu đề thi"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
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
      <ExamQuestion exam={examToOpen} onClose={() => setExamToOpen(null)} />
      
    </div>
  );
};

export default ExamList;
