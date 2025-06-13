import ExamList from "./_components/exam-list";

export async function generateMetadata() {
  return {
    title: "Đề thi",
  };
}

const ViewExamsPage = async ({ searchParams }) => {
  const page = (await searchParams?.page) || "1";
  const query = (await searchParams?.query) || "";

  return <ExamList page={page} query={query} />;
};

export default ViewExamsPage;
