import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const FOLDER_NAME = "devinda.me/blog";
export async function uploadToCloudinary(image: {
  src: string;
  blogId: string;
}) {
  if (import.meta.env.DEV) {
    return {
      secure_url: "https://source.unsplash.com/random",
    } as UploadApiResponse;
  }
  console.log(`uploading ${image.src} to cloudinary`);
  const uploadedFile = await cloudinary.uploader.upload(image.src, {
    resource_type: "image",
    folder: FOLDER_NAME + "/" + image.blogId,
    unique_filename: true,
  });
  return uploadedFile;
}
