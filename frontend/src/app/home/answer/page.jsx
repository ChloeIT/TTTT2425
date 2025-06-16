import ClientAnswerTonggle from "./components/ClientAnswerTonggle";
import ClientAnswerTongKe from "./components/ClientAnswerTonggle";
import { getAllDocumentsWithExam } from "@/actions/document-action";
import { cookies } from "next/headers";


export async function generateMetadata() {
  return { title: "Đáp án" };
}

const ViewExams = async () => {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  return <ClientAnswerTonggle token = { token } />;
};

export default ViewExams;
