"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export const NotificationContent = ({ title, message, isRead }) => {
  const [isOverflow, setOverflow] = useState(false);
  useEffect(() => {
    if (message?.length > 80) {
      setOverflow(true);
    }
  }, [message]);
  return (
    <Alert variant={isRead ? "green" : "default"}>
      <AlertTitle className="line-clamp-1">{title}</AlertTitle>
      <AlertDescription>
        {isOverflow ? `${message?.slice(0, 80)}...` : message}
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
export const LoadMoreNotificationButton = () => {
  return (
    <Button variant="success" size="sm">
      Tải thêm thông báo
    </Button>
  );
};

export const NotificationButton = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="outline">
          <Bell />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" alignOffset={10} sideOffset={10} asChild>
        <ScrollArea className="h-[350px] w-[350px] rounded-md p-4">
          <div className="text-md text-center font-bold mb-4">Thông báo</div>
          <div className="flex flex-col gap-2 items-center">
            {[...Array(10)].map((item, index) => {
              return (
                <NotificationContent
                  key={index}
                  title={
                    "okester began sneaking into the castle in the middle of the night and leavinjoke"
                  }
                  message={
                    "okester began sneaking into the castle in the middle of the night and leavinjokes all over the place: under the king's pillow, in his soup, even in the royal toilet. The king "
                  }
                  isRead={index % 2 == 0}
                />
              );
            })}
            <LoadMoreNotificationButton />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
