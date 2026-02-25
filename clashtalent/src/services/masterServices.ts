import { api } from "./api";

export const attachmentList = async (postData: {
  skip: number;
  take: number;
  subCatId?: number;
}) => {
  const response = await api.get("/attachmentList", {
    params: {
      skip: postData?.skip,
      take: postData?.take,
      subCatId: postData?.subCatId,
    },
  });

  return response.data;
};

export const subCategoryList = async (
  categoryId: number | string | null | undefined,
) => {
  return await api.get("/subCategoryList", {
    params: { categoryId },
  });
};
