import { Router } from "express";
import { uploadVideos } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getSingleVideo } from "../controllers/video.controller.js";
import { getAllVideoDataOfUser } from "../controllers/video.controller.js";
import { getAllStoredVideosData } from "../controllers/video.controller.js";
import { updateVideo } from "../controllers/video.controller.js";


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
]), uploadVideos);

router.route("/get-single-video/:videoId").get(getSingleVideo);
router.route("/get-all-videos-loggedin-user").get( verifyJWT, getAllVideoDataOfUser);
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
]), verifyJWT,updateVideo);


export default router;