export const usePagination = (totalPage, currentPage) => {
  const data = [...Array(totalPage)].map((_, index) => {
    const page = index + 1;
    return {
      page,
      active: currentPage === page ? true : false,
    };
  });
  return { data };
};
