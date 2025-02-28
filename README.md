# spotify-preview-finder

Get Spotify song preview URLs along with song details. This package helps you find preview URLs for Spotify songs, which can be useful when the official preview URLs are not available.

## Installation

```bash
npm install spotify-preview-finder dotenv
```

## Usage

There are two ways to use this package:

### 1. Using Environment Variables (Recommended)

First, install the required dependencies:
```bash
npm install dotenv
```

Create a `.env` file in your project root:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

Then in your code:
```javascript
// IMPORTANT: This must be the first line in your main file
require('dotenv').config();

// The package automatically uses the environment variables for authentication
const spotifyPreviewFinder = require('spotify-preview-finder');

async function example() {
  try {
    // Get preview URLs for a song (limit is optional, default is 5)
    const result = await spotifyPreviewFinder('Shape of You', 3);
    
    if (result.success) {
      result.results.forEach(song => {
        console.log(`\nSong: ${song.name}`);
        console.log(`Spotify URL: ${song.spotifyUrl}`);
        console.log('Preview URLs:');
        song.previewUrls.forEach(url => console.log(`- ${url}`));
      });
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

### How Authentication Works

The package handles authentication automatically in this order:

1. When you call `require('dotenv').config()`, it loads your credentials from the `.env` file into `process.env`
2. When you call the function, it:
   - Creates a Spotify API client using your credentials
   - Gets an access token automatically (valid for 1 hour)
   - Uses this token for the search request
   - The token is refreshed automatically when needed

### 2. Using Direct Authentication

You can also set up authentication directly in your code (not recommended for production):

```javascript
const spotifyPreviewFinder = require('spotify-preview-finder');

// Set environment variables programmatically
process.env.SPOTIFY_CLIENT_ID = 'your_client_id';
process.env.SPOTIFY_CLIENT_SECRET = 'your_client_secret';

async function searchSongs() {
  try {
    // Search for multiple songs
    const songs = [
      await spotifyPreviewFinder('Bohemian Rhapsody', 1),
      await spotifyPreviewFinder('Hotel California', 1),
      await spotifyPreviewFinder('Imagine', 1)
    ];

    songs.forEach(result => {
      if (result.success && result.results.length > 0) {
        const song = result.results[0];
        console.log(`\nFound: ${song.name}`);
        console.log(`Preview URL: ${song.previewUrls[0]}`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

searchSongs();
```

## Example Response

```javascript
{
  success: true,
  results: [
    {
      name: "Shape of You - Ed Sheeran",
      spotifyUrl: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3",
      previewUrls: [
        "https://p.scdn.co/mp3-preview/7339548839a263fd721d01eb3364a848cad16fa7"
      ]
    },
    // ... more results
  ]
}
```

## API

### spotifyPreviewFinder(songName, limit)

#### Parameters

- `songName` (string) - The name of the song to search for
- `limit` (number, optional) - Maximum number of results to return (default: 5)

#### Returns

Promise that resolves to an object with:

- `success` (boolean) - Whether the request was successful
- `results` (array) - Array of song objects containing:
  - `name` (string) - Song name with artist(s)
  - `spotifyUrl` (string) - Spotify URL for the song
  - `previewUrls` (array) - Array of preview URLs
- `error` (string) - Error message if success is false

## Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Once created, you'll see your Client ID and Client Secret
6. Copy these credentials to your `.env` file:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

## Common Issues

1. **"Authentication failed" error**: Make sure your .env file is in the root directory and credentials are correct
2. **"Cannot find module 'dotenv'"**: Run `npm install dotenv`
3. **No environment variables found**: Make sure `require('dotenv').config()` is at the top of your main file

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 