import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { getSignedExamsWithDocuments } from "@/actions/secretary-password-action";
  import DocumentList from "./_components/document-table";
  
  export async function generateMetadata() {
    return {
      title: "Quản lý danh sách đề đã ký",
    };
  }
  
  const SignedExamListPage = async ({ searchParams }) => {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);
    const query = params.query || "";
    const department = params.department || "";
    const year = params.year || "";
    const month = params.month || "";
    const result = await getSignedExamsWithDocuments({ page, query,department,year,month });
    const data = result.data;
    const totalPage = result.totalPage;
  
    return (
      <div className="flex flex-col gap-y-4 py-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Danh sách đề thi đã ký
              </h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={data}
              totalPage={totalPage}
              currentPage={page}
            />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default SignedExamListPage;
  