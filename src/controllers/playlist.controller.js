import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = req.user._id;

    if ([name, description].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    if (!userId) {
      throw new ApiResponse(400, "userId is required !!!");
    }

    const userPlaylist = await Playlist.create({
      name,
      description,
      owner: userId,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylist,
          "playlist is created successfully !!!"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      `something is wrong while creating playlist: ${error}`
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "uId is required !!!");
    }

    const playlists = await Playlist.find({
      owner: userId,
    });

    if (!playlists.length) {
      throw new ApiError(404, "No playlists found for this user");
    }

    res.status(200).json(new ApiResponse(200, playlists, "success"));
  } catch (error) {
    throw new ApiError(
      401,
      `something is wrong while fetching playlist: ${error}`
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;

    const sanitizedplaylistId = playlistId.trim();
    if (!sanitizedplaylistId) {
      throw new ApiError(400, "playListId is required !!!");
    }

    const singlePlaylist = await Playlist.findById(
      sanitizedplaylistId
    ).populate("videos");

    res.status(200).json(new ApiResponse(200, singlePlaylist, "success"));
  } catch (error) {
    throw new ApiError(
      401,
      `something is wrong while fetching singleplaylist: ${error}`
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const userId = req.user._id;

    const sanitizedPlaylistId = playlistId.trim();
    const sanitizedVideoId = videoId.trim();

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid  userId !!!");
    }

    if (
      !isValidObjectId(sanitizedPlaylistId) ||
      !isValidObjectId(sanitizedVideoId)
    ) {
      throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(sanitizedPlaylistId);

    if (playlist?.owner.toString() !== userId.toString()) {
      throw new ApiError(
        401,
        "user is not authorized to add videos in playlist !!!"
      );
    }

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    if (playlist.videos.includes(sanitizedVideoId)) {
      throw new ApiError(400, "Video already exists in the playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
      );
  } catch (error) {
    throw new ApiError(401, `something is wrong while adding videos: ${error}`);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { videoId, playlistId } = req.params;
    const userId = req.user._id;

    const sanitizedPlaylistId = playlistId.trim();
    const sanitizedVideoId = videoId.trim();


    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid  userId !!!");
    }

    if (
      !isValidObjectId(sanitizedPlaylistId) ||
      !isValidObjectId(sanitizedVideoId)
    ) {
      throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(sanitizedPlaylistId);

    if (playlist?.owner.toString() !== userId.toString()) {
      throw new ApiError(
        401,
        "user is not authorized to remove videos from playlist !!!"
      );
    }

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    if (!playlist?.videos?.includes(sanitizedVideoId)) {
      throw new ApiError(400, "provided videoId is not existed !!!");
    }

    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
    await playlist.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, `something is wrong while rmoving video from playlist: ${error}`);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const sanitizedPlaylistId = playlistId.trim();

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid  userId !!!");
    }

    if (!isValidObjectId(sanitizedPlaylistId)) {
      throw new ApiError(400, "Invalid playlistId !!");
    }

    const playlist = await Playlist.findById(sanitizedPlaylistId);

    if (playlist?.owner.toString() !== userId.toString()) {
      throw new ApiError(401, "user is not authorized to delete playlist !!!");
    }

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    await Playlist.findByIdAndDelete(sanitizedPlaylistId);

    res
      .status(200)
      .json(new ApiResponse(200, {}, "playlist deleted successfully !!!"));
  } catch (error) {
    throw new ApiError(401, `something is wrong while adding videos: ${error}`);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const sanitizedPlaylistId = playlistId.trim();

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid  userId !!!");
    }

    if (!isValidObjectId(sanitizedPlaylistId)) {
      throw new ApiError(400, "Invalid playlistId !!");
    }

    const playlist = await Playlist.findById(sanitizedPlaylistId);

    if (playlist?.owner.toString() !== userId.toString()) {
      throw new ApiError(401, "user is not authorized to update playlist !!!");
    }

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      sanitizedPlaylistId,
      {
        $set: {
          name,
          description,
        },
      },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "playlist updated successfully !!!"
        )
      );
  } catch (error) {
    throw new ApiError(401, `something is wrong while adding videos: ${error}`);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
