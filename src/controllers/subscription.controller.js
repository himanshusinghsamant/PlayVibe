import mongoose, {isValidObjectId} from "mongoose"
// import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {

    // Validate the channelId
    // Ensure the user is not subscribing to themselves
    // Check if the subscription already exists
    // If subscription exists, unsubscribe by removing it


    const {channelId} = req.params;
    const subscriberId = req.User._id;

    const ValidateChannelId = isValidObjectId(channelId);
    if (!ValidateChannelId) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if(subscriberId === channelId){
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if(existingSubscription){
        await existingSubscription.remove();
        res.status(200).json(
            new ApiResponse(200,{}, "Successfully unsubscribed")
        );
    }
    else{
        const newSubscription = new Subscription({
            subscriber: subscriberId,
            channel: channelId,
        });
        await newSubscription.save();
        res.status(201).json(
            new ApiResponse(201, newSubscription, "Successfully subscribed")
        );
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // Extract the channelId from the route parameter

    // Validate the channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Find all subscriptions where the channel is the given channelId
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email") // Populate the subscriber details
        .exec();

    res.status(200).json(
        new ApiResponse(200, "Fetched subscribers successfully", subscribers)
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params; // Extract the subscriberId from the route parameter

    // Validate the subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Find all subscriptions where the subscriber is the given subscriberId
    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email") // Populate the channel details
        .exec();

    res.status(200).json(
        new ApiResponse(200, "Fetched subscribed channels successfully", subscribedChannels)
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}