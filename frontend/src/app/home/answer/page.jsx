export default function AnswerPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">Đáp Án</h1>
      {/* <p>Đáp án đã duyệt.</p> */}

      <div className="max-w-xl mx-auto space-y-4">
  <div className="bg-blue-100 p-4 rounded shadow">
    <p className="font-semibold text-blue-800">Lý Luận Cơ Sở</p>
    <p>Thời gian: 120 phút</p>
  </div>
  <div className="bg-blue-100 p-4 rounded shadow">
    <p className="font-semibold text-blue-800">Nhà Nước Pháp Luật</p>
    <p>Thời gian: 120 phút</p>
  </div>
  <div className="bg-blue-100 p-4 rounded shadow">
    <p className="font-semibold text-blue-800">Xây Dựng Đảng</p>
    <p>Thời gian: 120 phút</p>
  </div>
</div>


    </div>
  );
}
