import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {createTweet} from "../controllers/tweet.controller.js"
import { getUserTweets, updateTweet, deleteTweet} from '../controllers/tweet.controller.js';

const router = Router(); 
router.use(verifyJWT);  // Apply verifyJWT middleware to all routes in this file

router.route("/create-tweet").post(createTweet);
router.route("/get-tweets").get(getUserTweets);
router.route("/update-tweet/:tweetId").patch(updateTweet);
router.route("/delete-tweet/:tweetId").delete(deleteTweet);

export default router;

