import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteAssetsFromCloudinary } from "../utils/cloudinary.js";
import { getCloudinaryData } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import fs from "fs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something is wrong while generating Access Token and Refresh Token !!!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend
  //validations - not empty
  //check if user already exist - username, email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return response

  const { fullname, email, username, password } = req.body;
  console.log({
    fullname: fullname,
    email: email,
    username: username,
    password: password,
  });

  if (
    [fullname, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email annd username is already exists");
  }

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path.replace(/\\/g, "/");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverimage[0]?.path.replace(/\\/g, "/");
  }


  if (!avatarLocalPath) {
    throw new ApiError(
      400,
      "Avatar file is required before uploading in cloudinary !!!!"
    );
  }
  if (!fs.existsSync(avatarLocalPath)) {
    console.error("Avatar file does not exist at path:", avatarLocalPath);
  }

  const Avatar = avatarLocalPath ? await UploadOnCloudinary(avatarLocalPath) : null;
  const CoverImage = coverImageLocalPath
    ? await UploadOnCloudinary(coverImageLocalPath)
    : null;

  const user = await User.create({
    fullname,
    avatar: Avatar?.url || "",
    coverimage: CoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully !!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { email, username, password } = req.body;

  if (!email || !username) {
    throw new ApiError(400, "username , email and password is required !");
  }

  const userLogs = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!userLogs) {
    throw new ApiError(400, "user does not exist!");
  }

  const isPasswordValid = await userLogs.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userLogs._id
  );

  const loggedInUser = await User.findById(userLogs._id).select(
    "-password -refreshtoken"
  );

  // create this options object to pass in cookie because bydefault if you do not pass this option (httponly:true and secure:true) any one can update cookie from frontend but if you pass these options then cookie is only can modify in server.
  const options = {
    HttpOnly: true,
    Secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user loggedin successfully !!!"
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $unsetset: {
        refreshToken: 1, //this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    HttOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loggedOut successfully !!!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request !!!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (incomingRefreshToken !== user?.refreshtoken) {
      throw new ApiError(401, "Refresh token is expired or used !!!");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      HttOnly: true,
      secure: true,
    };

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("newRefreshToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token !!!");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Your oldPassword is incorrect !!!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Your password is updated successfully !!!")
      );
  } catch (error) {
    throw new ApiError(400, error);
  }
});

const getCurrentUser = asyncHandler(async (req, res)=> {
  res.status(200)
  .json(new ApiResponse(200, req.user, "user fetched successfully !!!"))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
  const {email, username, fullname} = req.body;

  if(!email || !username || !fullname){
    throw new ApiError(401, "All fields are required !!!")
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set:{
      email,
      username,
      fullname
    }
  }, {new:true}).select("-password")

  res.status(200)
  .json(
    new ApiResponse(200, user, "Account updated successfully !!!")
  )

})

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    // Get the local path of the avatar image
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file path not found.");
    }

    // Upload the avatar to Cloudinary
    const avatar = await UploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(500, "Error while uploading the avatar to Cloudinary.");
    }

    // Retrieve current user's avatar from the database
    const { avatar: existingAvatar } = await User.findById(req.user?._id);
    if (existingAvatar) {
      // Retrieve the public ID of the current avatar from Cloudinary
      const getDataFromCloudinary = await getCloudinaryData(existingAvatar);
      if (!getDataFromCloudinary) {
        throw new ApiError(500, "Failed to retrieve current avatar data from Cloudinary.");
      }

      // Extract the public ID and delete the old avatar from Cloudinary
      const publicId = getDataFromCloudinary.public_id;
      const deleteInCloudinary = await deleteAssetsFromCloudinary(publicId);

      if (!deleteInCloudinary) {
        throw new ApiError(500, "Failed to delete the old avatar from Cloudinary.");
      }
    }

    // Update the user's avatar URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { avatar: avatar?.url } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      throw new ApiError(500, "Error updating avatar in the user profile.");
    }

    // Respond with the updated user data
    res.status(200).json(
      new ApiResponse(200, updatedUser, "Avatar updated successfully.")
    );
  } catch (error) {
    // Handle errors and provide detailed messages
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error updating avatar: ${errorMessage}`));
  }
});



const updateUserCoverImage = asyncHandler(async (req, res) => {
  try {
    // Get the local path of the cover image
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file path not found.");
    }

    // Upload the cover image to Cloudinary
    const coverImage = await UploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
      throw new ApiError(500, "Error while uploading the cover image to Cloudinary.");
    }

    // Retrieve current user's cover image from the database
    const { coverimage } = await User.findById(req.user?._id);
    if (coverimage) {
      // Retrieve the public ID of the current cover image from Cloudinary
      const getDataFromCloudinary = await getCloudinaryData(coverimage);
      if (!getDataFromCloudinary) {
        throw new ApiError(500, "Failed to retrieve data from Cloudinary.");
      }

      // Extract the public ID and delete the old cover image from Cloudinary
      const publicId = getDataFromCloudinary.public_id;
      const deleteInCloudinary = await deleteAssetsFromCloudinary(publicId);

      if (!deleteInCloudinary) {
        throw new ApiError(500, "Failed to delete the old cover image from Cloudinary.");
      }
    }

    // Update the user's cover image URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { coverimage: coverImage.url } },
      { new: true, runValidators: true }
    ).select("-password");

    // Respond with the updated user data
    res.status(200).json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully.")
    );
  } catch (error) {
    // Handle errors and provide detailed messages
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error updating cover image: ${errorMessage}`));
  }
});


export { registerUser, loginUser, logOut, refreshAccessToken, updatePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage};
