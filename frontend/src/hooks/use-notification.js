import { getNotifications } from "@/actions/notification-action";
import { useCallback, useEffect, useState, useTransition } from "react";

export const useNotification = () => {
  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchNotification = () => {
      startTransition(() => {
        getNotifications({ page: currentPage })
          .then(({ data, totalPage }) => {
            setData((prev) => [...prev, ...data]);
            setTotalPage(totalPage);
          })
          .catch(() => {
            setData([]);
            setTotalPage(0);
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
  const getNotificationIdsHaveNotRead = useCallback(() => {
    return data.filter((item) => item.isRead === false).map((item) => item.id);
  }, [data]);

  const markNotificationHaveRead = (ids = []) => {
    setData((prev) => {
      return prev.map((item) => {
        if (ids.includes(item.id)) {
          return {
            ...item,
            isRead: true,
          };
        } else {
          return item;
        }
      });
    });
  };

  return {
    data,
    totalPage,
    isPending,
    hasNextPage,
    getNextPage,
    getNotificationIdsHaveNotRead,
    markNotificationHaveRead,
  };
};
