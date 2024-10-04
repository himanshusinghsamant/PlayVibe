import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: "dldua3ewy",
  api_key: "784923938518947",
  api_secret: "Ev_hoMqEfqztAU-iV1loIfH6GWE",
});


  
async function UploadOnCloudinary(filePath, resourceType = "image", folder = "user_images") {
  try {
    // Ensure Cloudinary is reachable before uploading
    await cloudinary.api.ping();

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
      timeout: 120000, // Adjust timeout as needed
    });

    fs.unlinkSync(filePath);

    console.log("File uploaded successfully in cloudinary!", result);
    return result;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }
}


  export { UploadOnCloudinary}






  
