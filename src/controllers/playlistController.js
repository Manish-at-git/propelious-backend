const Playlist = require("../models/Playlist");
const { StatusMessage } = require("../utils/statusMessage");
const { fetchTracksFromSpotify, getToken } = require("../utils/spotify");

const fetchPlaylists = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
        #swagger.description = 'Endpoint to fetch all Playlist' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  try {
    const playlists = await Playlist.find({ user: req.user.userId });
    res.status(200).json({ status: 200, data: playlists });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

const addPlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
        #swagger.description = 'Endpoint to add a new Playlist' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  try {
    const { name, description } = req.body;
    const { user } = req;

    if (!name || !description) {
      return res
        .status(204)
        .json({ status: 204, error: StatusMessage.NO_CONTENT });
    }

    const array = [1, 2];
    const randomIndex = Math.floor(Math.random() * array.length);
    const randomElement = array[randomIndex];

    const newPlaylist = new Playlist({
      name,
      description,
      user: user.userId,
      songs: [],
      imageNumber: randomElement
    });

    const savedPlaylist = await newPlaylist.save();

    return res.status(201).json({
      status: 201,
      message: StatusMessage.SUCCESS,
      data: savedPlaylist,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

const updatePlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
        #swagger.description = 'Endpoint to update a Playlist' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */

  const { name, description } = req.body;
  const { playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (playlist && playlist.user.toString() === req.user.userId) {
      playlist.name = name || playlist.name;
      playlist.songs = playlist.songs;
      playlist.description = description;

      const updatedPlaylist = await playlist.save();

      return res.status(200).json({
        status: 200,
        message: StatusMessage.SUCCESS,
        data: { updatedPlaylist },
      });
    } else {
      return res
        .status(404)
        .json({ status: 404, error: StatusMessage.PLAYLIST_NOT_FOUND });
    }
  } catch (error) {
    console.error("Update Playlist Error:", error);
    return res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

const deletePlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
        #swagger.description = 'Endpoint to delete a Playlist' */
  /* #swagger.security = [{
            "bearerAuth": []
    }] */

  const { playlistId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res
        .status(404)
        .json({ status: 404, error: StatusMessage.PLAYLIST_NOT_FOUND });
    }

    const response = await Playlist.deleteOne({ _id: playlistId });

    if (response.deletedCount === 1) {
      return res.status(200).json({ message: StatusMessage.SUCCESS });
    } else {
      return res
        .status(500)
        .json({ status: 500, error: StatusMessage.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

const addSongToPlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
        #swagger.description = 'Endpoint to add a song to a specific playlist' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */

  const { playlistId } = req.params;
  const { title, artist, album, duration } = req.body;

  if (!title || !artist || !album) {
    return res.status(400).json({ message: StatusMessage.NO_CONTENT });
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "no pdlaylist found" });
    }

    const songExists = playlist.songs.some(
      (song) =>
        song.title === title && song.artist === artist && song.album === album
    );

    if (songExists) {
      return res
        .status(400)
        .json({ message: StatusMessage.SONG_ALREADY_EXIST });
    }

    const newSong = {
      title,
      artist,
      album,
      duration,
    };

    playlist.songs.push(newSong);
    await playlist.save();

    return res.status(200).json({
      status: 200,
      message: StatusMessage.SONG_ADDED_TO_PLAYLIST,
      data: { playlist },
    });
  } catch (error) {
    console.error("Error adding song to playkist:", error);
    return res.status(500).json({
      status: 500,
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const deleteSongFromPlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
      #swagger.description = 'Endpoint to delete a song from a specific playlist' */

  /* #swagger.security = [{
          "bearerAuth": []
  }] */

  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        status: 404,
        error: StatusMessage.PLAYLIST_NOT_FOUND,
      });
    }

    const songIndex = playlist.songs.findIndex(
      (song) => song._id.toString() === songId
    );

    if (songIndex === -1) {
      return res.status(404).json({
        status: 404,
        error: StatusMessage.SONG_NOT_FOUND_IN_PLAYLIST,
      });
    }

    playlist.songs.splice(songIndex, 1);

    await playlist.save();

    return res.status(200).json({
      status: 200,
      message: StatusMessage.SONG_REMOVED_FROM_PLAYLIST,
      data: { playlist },
    });
  } catch (error) {
    console.error("Error deleting song from playlist:", error);
    return res.status(500).json({
      status: 500,
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const fetchTrack = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
  #swagger.description = 'fetch songs from spotify' */

  /* #swagger.security = [{
      "bearerAuth": []
}] */
  const { searchQuery } = req.query;
  if (!searchQuery) {
    return res
      .status(400)
      .json({ status: 400, message: "Search query is required" });
  }
  try {
    const tokenResponse = await getToken();
    const token = tokenResponse.access_token;

    const tracksData = await fetchTracksFromSpotify(token, searchQuery, "track");
    const tracks =
      tracksData?.tracks?.items?.map((item) => ({
        title: item?.name,
        duration: Math.floor(item?.duration_ms / 1000),
        artist: item?.artists?.map((it) => it.name)?.[0],
        album: item?.album?.name,
        image: item?.album?.images
          ?.filter((item, i) => i == 0)
          ?.map((item) => item?.url),
      })) || [];
    res.status(200).json({ status: 200, tracks });
  } catch (err) {
    console.error("Error:", err.message);
    throw new Error("Failed to fetch tracks");
  }
};


const fetchPlaylist = async (req, res) => {
  /* 	#swagger.tags = ['Playlist']
  #swagger.description = 'fetch songs from spotify' */

/* #swagger.security = [{
      "bearerAuth": []
}] */
const { searchQuery } = req.query;
if (!searchQuery) {
    return res.status(400).json({ status:400, message: "Search query is required" });
  }
try {
  const tokenResponse = await getToken();
  const token = tokenResponse.access_token; 

  const tracksData = await fetchTracksFromSpotify(token, searchQuery, "playlist");
  const tracks = tracksData?.playlists?.items?.map((item) => ({
    title: item?.name,
    description: item?.description,
    image: item?.images?.filter((item, i) => i == 0)?.map((item) => item?.url)?.[0]
  })) || [];
  console.log(tracks, "imageimageimage")
  res.status(200).json({ status:200, tracks });
} catch (err) {
  console.error("Error:", err.message);
  throw new Error('Failed to fetch tracks');
}
};

module.exports = {
  fetchPlaylists,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  deleteSongFromPlaylist,
  fetchTrack,
  fetchPlaylist
};
