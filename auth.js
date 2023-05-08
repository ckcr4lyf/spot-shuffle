/**
 * Spotify auth related stuffs
 */


const generateAuthUri = () => {
    const client_id = '45d547b6b97c46ce9cf3c0c5f4bcaa55';
    const redirect_uri = 'http://localhost:13337';
    
    const scope = 'playlist-modify-private playlist-read-private';
    
    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);

    return url;
}

console.log(generateAuthUri());
