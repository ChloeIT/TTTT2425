import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useUpdateSearchParams = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (values) => {
    const params = new URLSearchParams(searchParams);

    for (const key in values) {
      if (!values[key]) {
        params.delete(key);
      } else {
        params.set(key, values[key]);
      }
    }

    router.replace(`${pathname}?${params}`);
  };

  // Get initial parameters, prioritizing query string values

  return {
    updateSearchParams: handleChange,
  };
};
