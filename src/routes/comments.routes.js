import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comments.controller.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/add-comment/:videoId").post(addComment)
router.route("/get-video-comment/:videoId").get(getVideoComments)
router.route("/update-comment/:commentId").patch(updateComment)
router.route("/delete-comment/:commentId").delete(deleteComment)

export default router;
