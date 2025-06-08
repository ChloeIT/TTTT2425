import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  import { getPasswords } from "@/actions/password-action";
  import PasswordList from "./_components/password-table";
  
  export async function generateMetadata() {
    return {
      title: "Quản lý mật khẩu đề thi",
    };
  }
  
  const PasswordManagementPage = async ({ searchParams }) => {
    // Tạm thời không dùng searchParams
    // const { page, query } = searchParams;
    // const currentPage = parseToNumber(page, 1);
  
    // Gọi action lấy dữ liệu mật khẩu đề thi, trang 1, query rỗng
    const { data } = await getPasswords({ page: 1, query: "" });
  
    return (
      <div className="flex flex-col gap-y-4 py-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách mật khẩu đề thi</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordList passwords={data} />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default PasswordManagementPage;
  