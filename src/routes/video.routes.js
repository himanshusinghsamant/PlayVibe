import { Router } from "express";
import { uploadVideos } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getSingleVideo } from "../controllers/video.controller.js";
import { getAllVideoDataOfUser } from "../controllers/video.controller.js";
import { getAllStoredVideosData } from "../controllers/video.controller.js";
import { updateVideo } from "../controllers/video.controller.js";
import { deleteVideo } from "../controllers/video.controller.js";


const router = Router();

router.route("/upload-video").post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount : 1
    },
    {
        name: "videofile",
        count: 1
    }
]), uploadVideos);            // verifyJWT is a middleware which checks that only loggedin user can upload the videos  // upload is a multer middleware to upload a file in local directry !! 

router.route("/get-single-video/:videoId").get(getSingleVideo);  // This end-point is fetching single data by passing unique videoId params !!
router.route("/get-all-videos-loggedin-user").get( verifyJWT, getAllVideoDataOfUser); // verifyJWT is a middleware which checks that only loggedin user can get the videos of user which is loggedin !! 
router.route("/get-all-stored-videos").get( getAllStoredVideosData); 
router.route("/update-video/:videoId").patch(upload.fields([
    {
        name: "thumbnail",
        maxCount : 1
    },
    {
        name: "videofile",
        count: 1
    }
]), verifyJWT,updateVideo);    // This end-point is updating single data by passing unique videoId params !!
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo); // verifyJWT is a middleware which checks that only loggedin user can delete the videos of user which is loggedin !! // This end-point is deleting single data by passing unique videoId params !!


export default router;