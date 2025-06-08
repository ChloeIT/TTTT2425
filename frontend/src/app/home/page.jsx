"use client";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();

  const cards = [
    { title: "Soạn đề ", icon: "📘" },
    { title: "Duyệt đề ", icon: "📊" },
    { title: "Đề thi", icon: "📄" },
    { title: "Đáp án", icon: "📝" },
    { title: "Văn Thư", icon: "🏆", link: "/van-thu" },
   
  ];

  // Xử lý khi click vào card
  const handleCardClick = (link) => {
    router.push(link);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex items-center">
        <div className="grid grid-cols-4 gap-6 p-8 max-w-6xl mx-auto w-full">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-800 rounded-lg p-6 flex flex-col items-start justify-between shadow-lg hover:bg-green-500 transition duration-300 cursor-pointer"
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <div className="text-xl font-semibold">{card.title}</div>
              <div className="text-right w-full text-xl">＋</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
