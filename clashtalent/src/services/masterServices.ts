import axios from "axios";
import { api } from "./api";
import { getToken } from "./tokenServices";

const chatBaseURL = process.env.EXPO_PUBLIC_SOCKET;

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

export const categoryList = async () => {
  return await api.get("/categoryList");
};

export const followerList = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/followerList?userId=${userId}`);
};

export const profileAttachment = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/profileAttachment?userId=${userId}`);
};

export const followingList = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/followingList?userId=${userId}`);
};

export const followerAttachmentList = async (postData: any) => {
  return await api.get(
    `/followerAttachmentList?skip=${postData?.skip}&take=${postData?.take}&userId=${postData?.userIdLogin}`,
  );
};

export const userAttachmentList = async (postData: any) => {
  return await api.get(
    `/userAttachmentList?skip=${postData?.skip}&take=${postData?.take}&userId=${postData?.id}`,
  );
};

export const attachmentListByInviteId = async (postData: {
  skip: number;
  take: number;
  inviteId: number | string;
}) => {
  const res = await api.get("/attachmentListByInviteId", {
    params: {
      skip: postData.skip,
      take: postData.take,
      inviteId: postData.inviteId,
    },
  });

  return res.data;
};

export const addAttachment = async (postData: any) => {
  return await api.post(`/addAttachment`, postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadToNestJS = async (
  videoFile: any,
  imageCover: any,
  attachmentId: string | number,
  attachmentType: string = "mo",
  attachmentName: string = "movies",
) => {
  const token = await getToken();

  const formData = new FormData();

  formData.append("video", {
    uri: videoFile.uri,
    name: videoFile.name ?? "video.mp4",
    type: videoFile.type ?? "video/mp4",
  } as any);

  formData.append("imageCover", {
    uri: imageCover.uri,
    name: imageCover.name ?? "cover.jpg",
    type: imageCover.type ?? "image/jpeg",
  } as any);

  formData.append("attachmentId", String(attachmentId));
  formData.append("attachmentType", attachmentType);
  formData.append("attachmentName", attachmentName);

  return await axios.post(`${chatBaseURL}/api/file/uploadVideo`, formData, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
      );
      console.log(`آپلود: ${percent}%`);
    },
  });
};

export const removeFollower = async (postData: any) => {
  return await api.delete(`/removeFollower`, { data: postData });
};

export const addFollower = async (postData: any) => {
  return await api.post(`/addFollower`, postData);
};

export const removeLike = async (postData: any) => {
  // const url = `${baseURL}/removeLike`;
  // return await axios.delete(url, { data: postData });
};

export const addLike = async (postData: any) => {
  // const url = `${baseURL}/removeLike`;
  // return await axios.delete(url, { data: postData });
};

export const modeList = async () => {
  return await api.get(`/modeList`);
};

export const subSubCategoryList = async (
  subCatId: number | string | null | undefined,
) => {
  return await api.get(`/subSubCategoryList?subCategoryId=${subCatId}`);
};

export const removeInvite = async (invId: number) => {
  // const url = `${baseURL}/removeInvite?inviteId=${invId}`;
  // return await axios.delete(url);
};

export const addInvite = async (postData: any) => {
  return await api.post(`/addInvite`, postData);
};

export const addMovie = async (data: any) => {
  return await api.post(`/addMovie`, data);
};

export const registerUser = async (postData: any) => {
  return await api.post(`/registerUser`, postData);
};

export const addComment = async (postData: any) => {
  return await api.post(`/addComment`, postData);
};

export const commentList = async (movieId: number) => {
  return await api.get(`/commentList?movieId=${movieId}`);
};

export const topScoreList = async () => {
  return await api.get(`/topScoreList`);
};

export const uploadVideo = async (postData: any) => {
  return await axios.post(`${chatBaseURL}/api/file/uploadVideo`, postData);
};

export const removeComment = async (commentId: number) => {
  // const url = `${baseURL}/removeComment?commentId=${commentId}`;
  // return await axios.delete(url);
};

export const userMessages = async (
  userIdLogin: number,
  userIdSender: number,
  skip: number,
  take: number,
): Promise<any> => {
  try {
    const token = await getToken();

    if (!chatBaseURL) {
      throw new Error("EXPO_PUBLIC_SOCKET is not defined");
    }

    const response = await axios.get(`${chatBaseURL}/chat/userMessages`, {
      params: {
        userIdLogin,
        userIdSender,
        skip,
        take,
      },
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch user messages",
    );
  }
};
