import ExamList from "./_components/exam-list";

export async function generateMetadata() {
  return {
    title: "Đề thi",
  };
}

const ViewExamsPage = async ({ searchParams }) => {
  const { page = 1, query } = await searchParams;

  return <ExamList page={page} query={query} />;
};

export default ViewExamsPage;
