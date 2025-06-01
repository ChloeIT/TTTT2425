import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export const useAction = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const action = ({ fn, onSuccess, onError }, ...args) => {
    startTransition(() => {
      fn(...args)
        .then(({ message, ok, status, data }) => {
          if (ok) {
            onSuccess?.(data);
            toast.success(message);
          } else {
            onError?.();
            toast.error(message);
            if (status == 401) {
              router.replace("/");
            }
          }
        })
        .catch((error) => {
          //error from server
          onError?.();
          toast.error("Lỗi hệ thống, vui lòng thử lại sau");
        });
    });
  };
  return { isPending, action };
};
