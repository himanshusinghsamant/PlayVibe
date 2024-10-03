import { Router } from "express";
import { logOut, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { updatePassword } from "../controllers/user.controller.js";
import { updateAccountDetails } from "../controllers/user.controller.js";
import { updateUserAvatar } from "../controllers/user.controller.js";
import { updateUserCoverImage } from "../controllers/user.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser);   
router.route("/logout").post(verifyJWT, logOut);   
router.route("/refresh-token").post(refreshAccessToken); 
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-user-coverimage").patch(verifyJWT, upload.single("coverimage"), updateUserCoverImage)

export default router;
