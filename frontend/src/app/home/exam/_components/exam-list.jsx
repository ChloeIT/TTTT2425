"use client";
import { useEffect, useState } from "react";
import {
  ApprovedExamsList,
  approvedFull,
  getAllExams,
  getSignedExamFiles,
  openExam,
  statusChanged,
} from "@/actions/exams-action";
import { parseToNumber } from "@/lib/utils";


import { currentUser } from "@/actions/auth-action";
import { NavPagination } from "@/components/nav-pagination";
import { useSearchParams } from "next/navigation";
import FullScreenPdfViewer from "@/app/home/answer/components/FullScreenPdfViewer";
import DialogPassword from "./DialogPassword";
import ExamTable from "./exam-table";

const ExamViewList = ({ query, token }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [openedExamIds, setOpenedExamIds] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const currentPage = parseToNumber(page, 1);

  useEffect(() => {
    const getCurrentUser = async () => {
      const res = await currentUser();
      if (res.data.user) {
        setUser(res.data.user);
      }
    };
    getCurrentUser();
  }, []);
  useEffect(() => {
    const fetchExams = async () => {
      const { data, totalPage } = await approvedFull({
        page,
        query,
      });
      setData(data);
      console.log(data)
      setTotalPage(totalPage);
    };
    fetchExams();
  }, [currentPage, query, user, page]);

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Danh sách Đề Thi
        </h1>
      </div>

      <ExamTable setOpen={setOpen} setError={setError} data={data} setSelectedExam={setSelectedExam} setInputPassword={setInputPassword} />

      {/* Dialog nhập mật khẩu */}
      <DialogPassword setData={setData} setPreviewUrl={setPreviewUrl} setPreviewTitle={setPreviewTitle} setError={setError} error={error} open={open} setOpen={setOpen} selectedExam={selectedExam} setInputPassword={setInputPassword} inputPassword={inputPassword} />

      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>

      {/* PDF Viewer */}
      {previewUrl && (
        <FullScreenPdfViewer
          url={previewUrl}
          title={previewTitle}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default ExamViewList;
