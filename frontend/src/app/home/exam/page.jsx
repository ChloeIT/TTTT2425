import ExamList from "./_components/exam-list";

export async function generateMetadata() {
  return {
    title: "Danh sách Đề thi",
  };
}

const ViewExamsPage = async ({ searchParams }) => {
  const page = searchParams?.page || "1";
  const query = searchParams?.query || "";

  return <ExamList page={page} query={query} />;
};

export default ViewExamsPage;
