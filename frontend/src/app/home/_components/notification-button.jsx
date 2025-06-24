"use client";

import { updateReadNotifications } from "@/actions/notification-action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAction } from "@/hooks/use-action";
import { useNotification } from "@/hooks/use-notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { ArrowLeft, ArrowRight, Bell, Search } from "lucide-react";

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
      <AlertTitle>
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
const PaginationButton = ({
  hasNextPage,
  getNextPage,
  hasPreviousPage,
  getPreviousPage,
}) => {
  return (
    <div className="flex gap-x-2">
      <Button
        variant="blue"
        size="sm"
        disabled={!hasPreviousPage}
        onClick={getPreviousPage}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="blue"
        size="sm"
        disabled={!hasNextPage}
        onClick={getNextPage}
      >
        <ArrowRight />
      </Button>
    </div>
  );
};
const MarkReadNotificationButton = ({ onClick, disabled }) => {
  return (
    <Button variant="edit" size="sm" onClick={onClick} disabled={disabled}>
      Đánh dấu đã đọc
    </Button>
  );
};
const InputSearch = ({ handleSearch }) => {
  return (
    <div className={cn("relative w-full px-2 my-2")}>
      <Search className="absolute left-4 top-2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={"Nhập tiêu đề, nội dung thông báo..."}
        className={cn("pl-8 h-8")}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};

export const NotificationButton = () => {
  const {
    data,
    haveNotReadCount,
    hasNextPage,
    getNextPage,
    hasPreviousPage,
    getPreviousPage,
    markNotificationHaveRead,
    handleSearch,
  } = useNotification();

  const { action } = useAction();

  const handleMarkRead = () => {
    action({
      fn: updateReadNotifications,
      onSuccess: () => {
        markNotificationHaveRead();
      },
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="outline" className="relative">
          <Bell />
          {haveNotReadCount > 0 && (
            <div
              className="absolute -top-1 -right-1 text-xs 
          rounded-full bg-red-500 w-[18px] h-[18px] flex justify-center items-center text-white"
            >
              {haveNotReadCount > 99 ? "99+" : haveNotReadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" alignOffset={10} sideOffset={10} asChild>
        <ScrollArea className="h-[450px] lg:w-[450px] w-[350px] rounded-md p-4">
          <div className="text-md text-center font-bold my-2">Thông báo</div>
          <div className="text-sm text-center text-muted-foreground my-2">
            Thông báo chỉ tồn tại trong vòng 30 ngày. Nếu cần thông báo hơn 30
            ngày, vui lòng kiểm tra mail.
          </div>
          <InputSearch handleSearch={handleSearch} />

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
              disabled={haveNotReadCount === 0}
              onClick={() => handleMarkRead()}
            />
            <PaginationButton
              getNextPage={getNextPage}
              getPreviousPage={getPreviousPage}
              hasNextPage={hasNextPage()}
              hasPreviousPage={hasPreviousPage()}
            />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
