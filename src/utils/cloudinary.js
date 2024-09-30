import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: "dldua3ewy",
  api_key: "784923938518947",
  api_secret: "Ev_hoMqEfqztAU-iV1loIfH6GWE",
});


  
async function UploadImages(filePath, resourceType = "image", folder = "user_images") {
  try {
    // Ensure Cloudinary is reachable before uploading
    await cloudinary.api.ping();

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
      timeout: 120000, // Adjust timeout as needed
    });

    fs.unlinkSync(filePath);

    console.log("File uploaded successfully!", result);
    return result;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }
}


  export { UploadImages}






  // console.log(cloudinary.config());


// function UploadVideos(){
//   const videoURL ="https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_30mb.mp4";

//   cloudinary.uploader
//   .upload(videoURL, { folder: "user_Videos", resource_type:"video", timeout:120000 }) 
//   .then((result) => {
//     console.log("Image uploaded successfully!", result);
//   })
//   .catch((error) => {
//     console.error("Error uploading image to Cloudinary:", error);
//   });
 
// }
//   cloudinary.api.ping().then(UploadVideos);
