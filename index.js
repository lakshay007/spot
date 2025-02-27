const axios = require('axios');
const cheerio = require('cheerio');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'd00eae93385645b1b8984cbd67891e60',
  clientSecret: '2d8496c96aec42d99f616d4bc7fb1f06'
});

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

    const links = Array.from(scdnLinks);
    console.log('Found p.scdn.co links:');
    links.forEach(link => console.log(link));
    
    return links;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

async function searchAndGetLinks(songName) {
  try {

    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);


    const searchResults = await spotifyApi.searchTracks(songName);
    
    if (searchResults.body.tracks.items.length === 0) {
      console.log('No songs found with that name');
      return;
    }
    const track = searchResults.body.tracks.items[0];
    const spotifyUrl = track.external_urls.spotify;
    
    console.log(`Found song: ${track.name} by ${track.artists[0].name}`);
    console.log(`Spotify URL: ${spotifyUrl}`);

    return await getSpotifyLinks(spotifyUrl);
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}
const songName = 'Not Like Us'; 
searchAndGetLinks(songName);
