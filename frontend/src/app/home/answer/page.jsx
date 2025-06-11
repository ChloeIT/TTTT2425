import ClientAnswerTongKe from "./components/ClientAnswerTonggle";
import { getAllDocumentsWithExam } from "@/actions/document-action";


export async function generateMetadata() {
  return { title: "Danh sách Đáp án" };
}

const ViewExams = async () => {
  const { data } = await getAllDocumentsWithExam();

  return <ClientAnswerTongKe data={data} />;
};

export default ViewExams;
