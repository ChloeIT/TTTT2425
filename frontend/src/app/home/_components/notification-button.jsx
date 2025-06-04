"use client";

import { updateReadNotifications } from "@/actions/notification-action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAction } from "@/hooks/use-action";
import { useNotification } from "@/hooks/use-notification";
import { format } from "date-fns";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

const NotificationContent = ({ title, message, isRead, createdAt }) => {
  const [isOverflow, setOverflow] = useState(false);
  useEffect(() => {
    if (message?.length > 100) {
      setOverflow(true);
    }
  }, [message]);
  return (
    <Alert variant={!isRead ? "green" : "default"}>
      <AlertTitle className="line-clamp-1">
        {title} - ({format(createdAt, "dd-MM-yyyy hh:mm")})
      </AlertTitle>
      <AlertDescription>
        {isOverflow ? `${message?.slice(0, 100)}...` : message}
        {isOverflow && (
          <Button
            size="sm"
            variant="link"
            className="pl-1"
            onClick={() => setOverflow(false)}
          >
            Chi tiết
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
const LoadMoreNotificationButton = ({ onClick, disabled }) => {
  return (
    <Button variant="success" size="sm" onClick={onClick} disabled={disabled}>
      Tải thêm thông báo
    </Button>
  );
};
const MarkReadNotificationButton = ({ onClick, disabled }) => {
  return (
    <Button variant="edit" size="sm" onClick={onClick} disabled={disabled}>
      Đánh dấu tất cả đã đọc
    </Button>
  );
};

export const NotificationButton = () => {
  const {
    data,
    hasNextPage,
    getNextPage,
    getNotificationIdsHaveNotRead,
    markNotificationHaveRead,
  } = useNotification();
  const haveNotReadIds = getNotificationIdsHaveNotRead();

  const { action } = useAction();

  const handleMarkRead = (ids) => {
    action(
      {
        fn: updateReadNotifications,
        onSuccess: () => {
          markNotificationHaveRead(ids);
        },
      },
      ids
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="outline">
          <Bell />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" alignOffset={10} sideOffset={10} asChild>
        <ScrollArea className="h-[450px] w-[450px] rounded-md p-4">
          <div className="text-md text-center font-bold mb-4">Thông báo</div>
          <div className="flex flex-col gap-2 items-center mb-4">
            {data.map((item, index) => {
              return (
                <NotificationContent
                  key={index}
                  title={item.title}
                  message={item.message}
                  isRead={item.isRead}
                  createdAt={item.createdAt}
                />
              );
            })}

            {data.length === 0 && (
              <div className="text-md">Không có thông báo</div>
            )}
          </div>
          <div className="flex justify-between">
            <MarkReadNotificationButton
              disabled={haveNotReadIds.length === 0}
              onClick={() => handleMarkRead(haveNotReadIds)}
            />
            <LoadMoreNotificationButton
              onClick={() => getNextPage()}
              disabled={!hasNextPage()}
            />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
