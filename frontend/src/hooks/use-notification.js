import { getNotifications } from "@/actions/notification-action";
import { useCallback, useEffect, useState, useTransition } from "react";

export const useNotification = () => {
  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [haveNotReadCount, setHaveNotReadCount] = useState(0);

  useEffect(() => {
    const fetchNotification = () => {
      startTransition(() => {
        getNotifications({ page: currentPage })
          .then(({ data, totalPage, haveNotReadCount }) => {
            setData((prev) => [...prev, ...data]);
            setTotalPage(totalPage);
            setHaveNotReadCount(haveNotReadCount);
          })
          .catch(() => {
            setData([]);
            setTotalPage(0);
            setHaveNotReadCount(0);
          });
      });
    };

    fetchNotification();
  }, [currentPage]);
  const hasNextPage = useCallback(() => {
    if (currentPage >= totalPage) {
      return false;
    } else {
      return true;
    }
  }, [currentPage, totalPage]);
  const getNextPage = () => {
    if (hasNextPage()) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const markNotificationHaveRead = () => {
    setData((prev) => {
      return prev.map((item) => {
        return {
          ...item,
          isRead: true,
        };
      });
    });
    setHaveNotReadCount(0);
  };

  return {
    data,
    totalPage,
    haveNotReadCount,
    isPending,
    hasNextPage,
    getNextPage,
    markNotificationHaveRead,
  };
};
