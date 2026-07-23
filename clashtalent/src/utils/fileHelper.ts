const BASE_URL = process.env.EXPO_PUBLIC_VITE_SERVERPROFILE;

export const getImageUrl = (attachment: any) => {
  if (!attachment) return null;

  return `${BASE_URL}/${attachment.attachmentType}/${attachment.fileName}${attachment.ext}`;
};