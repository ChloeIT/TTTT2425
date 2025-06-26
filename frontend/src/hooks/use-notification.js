import { getNotifications } from "@/actions/notification-action";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useDebounceCallback } from "usehooks-ts";

export const useNotification = () => {
  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [haveNotReadCount, setHaveNotReadCount] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchNotification = () => {
      startTransition(() => {
        getNotifications({ page: currentPage, query })
          .then(({ data, totalPage, haveNotReadCount }) => {
            setData(data);
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
  }, [currentPage, query]);
  const hasNextPage = useCallback(() => {
    return currentPage < totalPage;
  }, [currentPage, totalPage]);
  const hasPreviousPage = useCallback(() => {
    return currentPage > 1;
  }, [currentPage, totalPage]);
  const getNextPage = () => {
    if (hasNextPage()) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const getPreviousPage = () => {
    if (hasPreviousPage()) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const markNotificationHaveRead = () => {
    setCurrentPage(1);
    setHaveNotReadCount(0);
  };
  const handleSearch = useDebounceCallback((term) => {
    setCurrentPage(1);
    setQuery(term);
  }, 300);

  return {
    data,
    totalPage,
    haveNotReadCount,
    isPending,
    hasNextPage,
    getNextPage,
    hasPreviousPage,
    getPreviousPage,
    markNotificationHaveRead,
    handleSearch,
  };
};
