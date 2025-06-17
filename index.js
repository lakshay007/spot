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
 * @param {string|number} [artistOrLimit] - Artist name (string) or limit (number) for backward compatibility
 * @param {number} [limit=5] - Maximum number of results to return (only used when artistOrLimit is a string)
 * @returns {Promise<Object>} Object containing success status and results
 */
async function searchAndGetLinks(songName, artistOrLimit, limit = 5) {
  try {
    if (!songName) {
      throw new Error('Song name is required');
    }

    // Handle backward compatibility and parameter parsing
    let artist = null;
    let actualLimit = 5;

    if (typeof artistOrLimit === 'string') {
      // New usage: searchAndGetLinks(songName, artist, limit)
      artist = artistOrLimit;
      actualLimit = limit;
    } else if (typeof artistOrLimit === 'number') {
      // Old usage: searchAndGetLinks(songName, limit)
      actualLimit = artistOrLimit;
    } else if (artistOrLimit === undefined) {
      // Default usage: searchAndGetLinks(songName)
      actualLimit = 5;
    }

    const spotifyApi = createSpotifyApi();
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    
    // Construct search query with artist if provided
    let searchQuery = songName;
    if (artist) {
      searchQuery = `track:"${songName}" artist:"${artist}"`;
    }
    
    const searchResults = await spotifyApi.searchTracks(searchQuery);
    
    if (searchResults.body.tracks.items.length === 0) {
      return {
        success: false,
        error: 'No songs found',
        results: []
      };
    }

    const tracks = searchResults.body.tracks.items.slice(0, actualLimit);
    const results = await Promise.all(tracks.map(async (track) => {
      const spotifyUrl = track.external_urls.spotify;
      const previewUrls = await getSpotifyLinks(spotifyUrl);
      
      return {
        name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
        spotifyUrl: spotifyUrl,
        previewUrls: previewUrls,
        // Add additional metadata for better user experience
        trackId: track.id,
        albumName: track.album.name,
        releaseDate: track.album.release_date,
        popularity: track.popularity,
        durationMs: track.duration_ms
      };
    }));

    return {
      success: true,
      searchQuery: searchQuery, // Include the search query used for transparency
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
