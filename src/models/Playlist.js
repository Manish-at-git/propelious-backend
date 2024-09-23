const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: String },
    image: { type: String },
  },
  { _id: true }
);

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  songs: [songSchema],
  imageNumber:  { type: Number, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
