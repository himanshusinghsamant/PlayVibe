import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create-playlist").post(createPlaylist)

router.route("/get-playlist/:playlistId").get(getPlaylistById)
router.route("/update-playlist/:playlistId").patch(updatePlaylist)
router.route("/delete-playlist/:playlistId").delete(deletePlaylist)

router.route("/add-video/:videoId/:playlistId").post(addVideoToPlaylist);
router.route("/remove-video/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user-playlist").get(getUserPlaylists);

export default router 