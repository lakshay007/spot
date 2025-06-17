# spotify-preview-finder

Get Spotify song preview URLs along with song details. This package helps you find preview URLs for Spotify songs, which can be useful when the official preview URLs are not available.

## Installation

```bash
npm install spotify-preview-finder dotenv
```

## Usage

There are multiple ways to use this package:

### 1. Basic Search (Song Name Only)

```javascript
require('dotenv').config();
const spotifyPreviewFinder = require('spotify-preview-finder');

async function example() {
  try {
    // Search by song name only (limit is optional, default is 5)
    const result = await spotifyPreviewFinder('Shape of You', 3);
    
    if (result.success) {
      console.log(`Search Query Used: ${result.searchQuery}`);
      result.results.forEach(song => {
        console.log(`\nSong: ${song.name}`);
        console.log(`Album: ${song.albumName}`);
        console.log(`Release Date: ${song.releaseDate}`);
        console.log(`Popularity: ${song.popularity}`);
        console.log(`Duration: ${Math.round(song.durationMs / 1000)}s`);
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

### 2. Enhanced Search (Song Name + Artist)

For more accurate results, you can now include the artist name:

```javascript
require('dotenv').config();
const spotifyPreviewFinder = require('spotify-preview-finder');

async function enhancedSearch() {
  try {
    // Search with both song name and artist for higher accuracy
    const result = await spotifyPreviewFinder('Shape of You', 'Ed Sheeran', 2);
    
    if (result.success) {
      console.log(`Search Query Used: ${result.searchQuery}`);
      result.results.forEach(song => {
        console.log(`\nFound: ${song.name}`);
        console.log(`Album: ${song.albumName}`);
        console.log(`Track ID: ${song.trackId}`);
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

enhancedSearch();
```

### 3. Batch Search with Different Artists

```javascript
require('dotenv').config();
const spotifyPreviewFinder = require('spotify-preview-finder');

async function batchSearch() {
  try {
    const searches = [
      { song: 'Bohemian Rhapsody', artist: 'Queen' },
      { song: 'Hotel California', artist: 'Eagles' },
      { song: 'Imagine', artist: 'John Lennon' },
      { song: 'Yesterday' } // Without artist for comparison
    ];

    for (const search of searches) {
      let result;
      if (search.artist) {
        result = await spotifyPreviewFinder(search.song, search.artist, 1);
        console.log(`\n=== Searching: "${search.song}" by "${search.artist}" ===`);
      } else {
        result = await spotifyPreviewFinder(search.song, 1);
        console.log(`\n=== Searching: "${search.song}" (no artist specified) ===`);
      }

      if (result.success && result.results.length > 0) {
        const song = result.results[0];
        console.log(`Found: ${song.name}`);
        console.log(`Album: ${song.albumName} (${song.releaseDate})`);
        console.log(`Popularity: ${song.popularity}/100`);
        if (song.previewUrls.length > 0) {
          console.log(`Preview URL: ${song.previewUrls[0]}`);
        } else {
          console.log('No preview URLs found');
        }
      } else {
        console.log('No results found');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

batchSearch();
```

### Environment Variables Setup

Create a `.env` file in your project root:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### How Authentication Works

The package handles authentication automatically:

1. When you call `require('dotenv').config()`, it loads your credentials from the `.env` file into `process.env`
2. When you call the function, it:
   - Creates a Spotify API client using your credentials
   - Gets an access token automatically (valid for 1 hour)
   - Uses this token for the search request
   - The token is refreshed automatically when needed

## API

### spotifyPreviewFinder(songName, [artistOrLimit], [limit])

#### Parameters

- `songName` (string) - **Required** - The name of the song to search for
- `artistOrLimit` (string|number, optional) - Either:
  - Artist name (string) for more accurate search results
  - Maximum number of results (number) for backward compatibility
- `limit` (number, optional) - Maximum number of results to return (default: 5, only used when `artistOrLimit` is an artist name)

#### Usage Examples

```javascript
// Basic search (backward compatible)
await spotifyPreviewFinder('Shape of You');                    // Default limit of 5
await spotifyPreviewFinder('Shape of You', 3);                 // Limit to 3 results

// Enhanced search with artist
await spotifyPreviewFinder('Shape of You', 'Ed Sheeran');      // Default limit of 5
await spotifyPreviewFinder('Shape of You', 'Ed Sheeran', 2);   // Limit to 2 results
```

#### Returns

Promise that resolves to an object with:

- `success` (boolean) - Whether the request was successful
- `searchQuery` (string) - The actual search query used (for transparency)
- `results` (array) - Array of song objects containing:
  - `name` (string) - Song name with artist(s)
  - `spotifyUrl` (string) - Spotify URL for the song
  - `previewUrls` (array) - Array of preview URLs
  - `trackId` (string) - Spotify track ID
  - `albumName` (string) - Album name
  - `releaseDate` (string) - Release date
  - `popularity` (number) - Popularity score (0-100)
  - `durationMs` (number) - Duration in milliseconds
- `error` (string) - Error message if success is false

## Example Response

### Basic Search Response
```javascript
{
  success: true,
  searchQuery: "Shape of You",
  results: [
    {
      name: "Shape of You - Ed Sheeran",
      spotifyUrl: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3",
      previewUrls: [
        "https://p.scdn.co/mp3-preview/7339548839a263fd721d01eb3364a848cad16fa7"
      ],
      trackId: "7qiZfU4dY1lWllzX7mPBI3",
      albumName: "÷ (Deluxe)",
      releaseDate: "2017-03-03",
      popularity: 87,
      durationMs: 233713
    }
    // ... more results
  ]
}
```

### Enhanced Search Response (with Artist)
```javascript
{
  success: true,
  searchQuery: 'track:"Shape of You" artist:"Ed Sheeran"',
  results: [
    {
      name: "Shape of You - Ed Sheeran",
      spotifyUrl: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3",
      previewUrls: [
        "https://p.scdn.co/mp3-preview/7339548839a263fd721d01eb3364a848cad16fa7"
      ],
      trackId: "7qiZfU4dY1lWllzX7mPBI3",
      albumName: "÷ (Deluxe)",
      releaseDate: "2017-03-03",
      popularity: 87,
      durationMs: 233713
    }
  ]
}
```

## Benefits of Using Artist Parameter

1. **Higher Accuracy**: Including the artist name significantly reduces false positives
2. **Better Ranking**: Results are more likely to match your intended song
3. **Fewer Results to Sift Through**: More targeted search results
4. **Backward Compatible**: Existing code continues to work without changes

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
4. **Too many/irrelevant results**: Use the artist parameter for more accurate results

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 