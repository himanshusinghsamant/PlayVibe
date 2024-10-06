import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import {ApiError} from "./ApiError.js"

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



const getCloudinaryData = async (url, resourceType ="image" ) => {
  try {
    // Extract the public ID from the URL
    const publicId = url.split('/').pop().split('.')[0].trim();
    console.log(publicId)

    await cloudinary.api.ping();

    let fileName = ""
    resourceType === "image"? fileName = "user_images" : fileName = "user_Videos" ;

    // Get image or video details from Cloudinary
    const result = await cloudinary.api.resource(`${fileName}/${publicId}`, {resource_type:resourceType});
    // const result = await cloudinary.api.resources_by_asset_ids('3358a27e576ba18ad23bfa8cb0463cd5')

    return result; 
  } catch (error) {
    console.error("Error fetching Cloudinary data:", error);
  }
};


async function deleteAssetsFromCloudinary(publicId, type="upload", resourceType="image"){
  try {
    const result = await cloudinary.uploader.destroy(publicId,
      {
        type: type, 
        resource_type: resourceType
      }
      )
  
      console.log(result)
  } catch (error) {
   throw new ApiError(401, `Failed to delete file from cloudinary !!! :${error}`)
  }
 }
 


  export { UploadOnCloudinary, deleteAssetsFromCloudinary,getCloudinaryData}











  
