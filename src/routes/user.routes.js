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

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOut); // verifyJWT is a middleware which checks that only loggedin user can logout --
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updatePassword); // verifyJWT is a middleware which checks that only loggedin user can update the password --
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails); // verifyJWT is a middleware which checks that only loggedin user can update the account details --
router.route("/get-current-user").get(verifyJWT, getCurrentUser); // verifyJWT is a middleware which checks that only loggedin user can get the current or loggedin user details --
router
  .route("/update-user-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar); // verifyJWT is a middleware which checks that only loggedin user can update the avatar --
router
  .route("/update-user-coverimage")
  .patch(verifyJWT, upload.single("coverimage"), updateUserCoverImage); // verifyJWT is a middleware which checks that only loggedin user can update the coverimage --

export default router;
