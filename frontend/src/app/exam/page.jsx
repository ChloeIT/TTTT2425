import { ApprovedExamsList, getExams } from "@/actions/sign-action";
import { parseToNumber } from "@/lib/utils";

  export async function generateMetadata() {
    return {
      title: "Danh sách Đề thi",
    };
  }

const ViewExams = async ({ searchParams }) => {
    const { page, query } = searchParams;
        const currentPage = parseToNumber(page, 1);
      
        const { data, totalPage } = await ApprovedExamsList({ page: currentPage, query });
     console.log(data)
  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">Đề Thi</h1>
        {
            data.map((exam, id) => {
                return (
                <div index={id} className="max-w-xl mx-auto space-y-4">
                    <div className="bg-blue-100 p-4 rounded shadow">
                        <p className="font-semibold text-blue-800">{exam.title}</p>
                        {/* <p>Thời gian: 120 phút</p> */}
                    </div>
                </div>
                )
            })
        }

    </div>
  );
}
export default ViewExams;
