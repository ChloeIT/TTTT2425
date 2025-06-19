import { cookies } from "next/headers";
import ExamList from "./_components/exam-list";

export async function generateMetadata() {
  return {
    title: "Đề thi",
  };
}

const ViewExamsPage = async ({ searchParams }) => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  const { page = 1, query, month, year, department } = await searchParams;

  return <ExamList page={page} query={query} token={token} />;
};

export default ViewExamsPage;
