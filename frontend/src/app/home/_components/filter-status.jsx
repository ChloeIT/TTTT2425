// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";

// const statusMap = {
//   DANG_CHO: "Đang chờ",
//   DA_DUYET: "Đã duyệt",
//   TU_CHOI: "Đã từ chối",
// };

// const FilterStatus = () => {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const selectedStatus = searchParams.get("status");
//   const hasInit = useRef(false); // 🔐 đảm bảo chỉ chạy 1 lần duy nhất khi mount
//     // ✅ Chỉ gán status=DANG_CHO 1 lần nếu chưa có status khi lần đầu vào
//     useEffect(() => {
//       if (!hasInit.current && !selectedStatus) {
//         hasInit.current = true;
//         const params = new URLSearchParams(window.location.search);
//         params.set("status", "DANG_CHO");
//         params.set("page", "1");
//         router.push(`?${params.toString()}`);
//       }
//     }, [selectedStatus, router]);
  

//   const keys = ["ALL", "DANG_CHO", "DA_DUYET", "TU_CHOI"];

//   const handleClick = (key) => {
//     const params = new URLSearchParams(searchParams.toString());

//     if (key === "ALL") {
//       params.delete("status");
//     } else {
//       params.set("status", key);
//     }

//     params.set("page", "1"); // reset lại page khi lọc
//     router.push(`?${params.toString()}`);
//     router.refresh();
//   };

//   const currentStatus = selectedStatus || "DANG_CHO"; // dùng để tô nút active

//   return (
//     <div className="flex flex-wrap gap-2 mb-6">
//      {keys.map((key) => {
//   const isActive = (() => {
//     if (!selectedStatus) return key === "ALL";
//     return key === selectedStatus;
//   })();

//   return (
//     <Button
//       key={key}
//       variant={isActive ? "default" : "outline"}
//       onClick={() => handleClick(key)}
//     >
//       {key === "ALL" ? "Tất cả" : statusMap[key]}
//     </Button>
//   );
// })}

//     </div>
//   );
// };

// export default FilterStatus;
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const statusMap = {
  DANG_CHO: "Đang chờ",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Đã từ chối",
};

const FilterStatus = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedStatus = searchParams.get("status");
  const hasInit = useRef(false);

  useEffect(() => {
    if (!hasInit.current && !selectedStatus) {
      hasInit.current = true;
      const params = new URLSearchParams(window.location.search);
      params.set("status", "DANG_CHO");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }, [selectedStatus, router]);


  const keys = ["DANG_CHO", "DA_DUYET", "TU_CHOI"];

  const handleClick = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {keys.map((key) => (
        <Button
          key={key}
          variant={selectedStatus === key ? "default" : "outline"}
          onClick={() => handleClick(key)}
        >
          {statusMap[key]}
        </Button>
      ))}
    </div>
  );
};

export default FilterStatus;
