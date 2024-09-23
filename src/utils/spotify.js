const axios = require("axios")

const getToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(
        `${process.env.CLIENT_ID}:${process.env.SECRET_ID}`
      ).toString("base64"),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token');
  }

  return await response.json();
};

const fetchTracksFromSpotify = async (token, searchQuery, type) => {
  const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=${type}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching tracks:", error.message);
    throw error;
  }
};

module.exports = {getToken, fetchTracksFromSpotify}
