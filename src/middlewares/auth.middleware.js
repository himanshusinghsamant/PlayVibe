import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req, res, next)=>{
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        // console.log({
        //     "checking a token in veryfyJWT middleware": token
        // })
        
        if(!token){
            throw new ApiError(401, "Unauthorized request !!!")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(decodedToken?._id )

        // console.log({
        //     "checking a decodedToken in veryfyJWT middleware": decodedToken
        // })
    
        const user = await User.findById(decodedToken?. _id).select("-password -refreshtoken")
        
        if(!user){
            throw new ApiError(401, "Invalid AccessToken !!!")
        }

        // console.log({
        //     "checking a user in veryfyJWT middleware": user
        // })

    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid accessToken !!!")
    }
})

