import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cookie from "cookie-parser";
// import fs from "fs";

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

  // const avatarLocalPath = req.files?.avatar[0]?.path.replace(/\\/g, "/");
  // const coverImageLocalPath = req.files?.coverimage[0]?.path.replace(/\\/g, "/");

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

  console.log(avatarLocalPath);
  console.log(coverImageLocalPath);

  // if(!avatarLocalPath){
  //   throw new ApiError(400, "Avatar file is required !!!!")
  // }
  // if (!fs.existsSync(avatarLocalPath)) {
  //   console.error("Avatar file does not exist at path:", avatarLocalPath);
  // }

  const Avatar = avatarLocalPath
    ? await uploadOnCloudinary(avatarLocalPath)
    : null;
  const CoverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // if(!Avatar){
  //   throw new ApiError(400, "Avatar file is required")
  // }

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

  // create this options object to pass in cookie becaause bydefault it you do not pass this option (httponly:true and secure:true) any one can update cookie from frontend but if you pass these options then cookie is only can modify in server.
  const options = {
    httOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200, {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user loggedin successfully !!!"
      )
    );
});


const logOut = asyncHandler(async(req, res)=>{
  
})

export { registerUser, loginUser, logOut };
