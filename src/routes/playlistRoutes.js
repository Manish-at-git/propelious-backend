
const express = require("express");
const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/getAllPlaylists", authMiddleware.authorizeUser, playlistController.fetchPlaylists);
router.post("/addPlayList", authMiddleware.authorizeUser, playlistController.addPlaylist);
router.patch('/playlists/:playlistId', authMiddleware.authorizeUser, playlistController.updatePlaylist);
router.delete('/playlists/:playlistId', authMiddleware.authorizeUser, playlistController.deletePlaylist);
router.post('/addSongToPlaylist/:playlistId', authMiddleware.authorizeUser, playlistController.addSongToPlaylist);
router.delete('/playlists/:playlistId/:songId', authMiddleware.authorizeUser, playlistController.deleteSongFromPlaylist);
router.get('/search', authMiddleware.authorizeUser, playlistController.fetchTrack)
router.get('/fetchPlaylist', authMiddleware.authorizeUser, playlistController.fetchPlaylist)


module.exports = router;
