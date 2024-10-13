import { Router } from "express";
import {
  logOut,
  registerUser,
  loginUser,
  refreshAccessToken,
  updatePassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  addWatchHistory
} from "../controllers/user.controller.js"; // Import all user-related controller functions
import { upload } from "../middlewares/multer.middleware.js"; // Multer middleware to handle file uploads
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Middleware for verifying JWT tokens (ensures the user is logged in)

const router = Router();

// Route to register a new user, with the ability to upload avatar and cover image
// - `upload.fields`: Multer middleware to handle file uploads for avatar and cover image
// - `registerUser`: Controller function that handles user registration
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },    // Optional avatar image
    { name: "coverimage", maxCount: 1 } // Optional cover image
  ]),
  registerUser
);

// Route for user login
// - `loginUser`: Controller function to handle user login and issue JWT tokens
router.route("/login").post(loginUser);

// Route for user logout (only accessible to logged-in users)
// - `verifyJWT`: Ensures only authenticated users can log out
// - `logOut`: Controller function to handle the logout process
router.route("/logout").post(verifyJWT, logOut);

// Route to refresh the access token using a refresh token
// - `refreshAccessToken`: Controller function to issue a new access token
router.route("/refresh-token").post(refreshAccessToken);

// Route for updating the password (only accessible to logged-in users)
// - `verifyJWT`: Ensures only authenticated users can update their password
// - `updatePassword`: Controller function to handle password updates
router.route("/update-password").post(verifyJWT, updatePassword);

// Route to update account details (only accessible to logged-in users)
// - `verifyJWT`: Ensures only authenticated users can update their account details
// - `updateAccountDetails`: Controller function to handle account detail updates
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

// Route to get the details of the currently logged-in user
// - `verifyJWT`: Ensures only authenticated users can access their own details
// - `getCurrentUser`: Controller function that retrieves the logged-in user's details
router.route("/get-current-user").get(verifyJWT, getCurrentUser);

// Route to update the user's avatar (only accessible to logged-in users)
// - `verifyJWT`: Ensures only authenticated users can update their avatar
// - `upload.single`: Multer middleware to handle avatar image upload
// - `updateUserAvatar`: Controller function to handle avatar updates
router.route("/update-user-avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

// Route to update the user's cover image (only accessible to logged-in users)
// - `verifyJWT`: Ensures only authenticated users can update their cover image
// - `upload.single`: Multer middleware to handle cover image upload
// - `updateUserCoverImage`: Controller function to handle cover image updates
router.route("/update-user-coverimage").patch(
  verifyJWT,
  upload.single("coverimage"),
  updateUserCoverImage
);

router.route("/get-user-channel-profile/:username").get(getUserChannelProfile)
router.route("/add-watch-history/:videoId").post(verifyJWT ,addWatchHistory)
router.route("/get-watch-history").get(verifyJWT ,getWatchHistory)

export default router;
