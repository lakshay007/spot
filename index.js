require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const SpotifyWebApi = require('spotify-web-api-node');

function createSpotifyApi() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables are required');
  }

  return new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
  });
}

async function getSpotifyLinks(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const scdnLinks = new Set();

    $('*').each((i, element) => {
      const attrs = element.attribs;
      Object.values(attrs).forEach(value => {
        if (value && value.includes('p.scdn.co')) {
          scdnLinks.add(value);
        }
      });
    });

    return Array.from(scdnLinks);
  } catch (error) {
    throw new Error(`Failed to fetch preview URLs: ${error.message}`);
  }
}

/**
 * Search for songs and get their preview URLs
 * @param {string} songName - The name of the song to search for
 * @param {number} [limit=5] - Maximum number of results to return
 * @returns {Promise<Object>} Object containing success status and results
 */
async function searchAndGetLinks(songName, limit = 5) {
  try {
    if (!songName) {
      throw new Error('Song name is required');
    }

    const spotifyApi = createSpotifyApi();
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    
    const searchResults = await spotifyApi.searchTracks(songName);
    
    if (searchResults.body.tracks.items.length === 0) {
      return {
        success: false,
        error: 'No songs found',
        results: []
      };
    }

    const tracks = searchResults.body.tracks.items.slice(0, limit);
    const results = await Promise.all(tracks.map(async (track) => {
      const spotifyUrl = track.external_urls.spotify;
      const previewUrls = await getSpotifyLinks(spotifyUrl);
      
      return {
        name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
        spotifyUrl: spotifyUrl,
        previewUrls: previewUrls
      };
    }));

    return {
      success: true,
      results: results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

module.exports = searchAndGetLinks;
