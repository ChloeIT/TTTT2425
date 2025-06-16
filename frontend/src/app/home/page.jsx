"use client";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();

  const cards = [
    { title: "Soạn đề ", icon: "📘", link: "/home/examsUpload" },
    { title: "Duyệt đề ", icon: "📊", link: "/home/sign/sign_exam" },
    { title: "Đề thi", icon: "📄", link: "/home/exam" },
    { title: "Văn thư", icon: "🗃️", link: "/home/archive" },
    { title: "Đáp án", icon: "📝", link: "/home/answer" },
  ];

  // Xử lý khi click vào card
  const handleCardClick = (link) => {
    router.push(link);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex items-center">
        <div className="grid lg:grid-cols-5 sm:grid-cols-1 md:grid-cols-3 gap-6 p-8 max-w-6xl mx-auto w-full">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.link)}
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
