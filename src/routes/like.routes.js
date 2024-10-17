import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle-video-like/v/:videoId").post(toggleVideoLike);
router.route("/toggle-comment-like/c/:commentId").post(toggleCommentLike);
router.route("/toggle-tweet-like/t/:tweetId").post(toggleTweetLike);
router.route("/liked-videos").get(getLikedVideos);

export default router