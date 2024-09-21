import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dldua3ewy",
  api_key: "639967642911262",
  api_secret: "dJYRcMGPyiB9chB_78v6Mgbu1AE",
});

//  const imgUrl = "https://images.unsplash.com/photo-1726766406089-0308c800b6b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8"
// Function to upload an image to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No file path provided");

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      timeout: 1200000
    });

    console.log(uploadResult)
    // Delete the local file after successful upload
    // fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    console.error("Error during file upload to Cloudinary:", error.message || error.error.message, error.http_code, error.name);
    // Delete the local file if upload fails
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return null;
  }
};

export { uploadOnCloudinary };
