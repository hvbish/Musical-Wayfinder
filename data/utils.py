import asyncio
import asyncio
import requests
from concurrent.futures import ThreadPoolExecutor
from timeit import default_timer
import base64
import six
import numpy as np

START_TIME = default_timer()

def get_client_access_token(client_id, client_secret):
    payload = { 'grant_type': 'client_credentials'}

    auth_header_content = base64.b64encode(six.text_type(client_id + ':' + client_secret).encode('ascii'))
    auth_header = {'Authorization': 'Basic {}'.format(auth_header_content.decode('ascii'))}

    response = requests.post("https://accounts.spotify.com/api/token", data=payload, headers=auth_header)
    
    if response.status_code != 200:
        raise Exception(response.reason)
        
    return response.json()['access_token']

def get(session, base_url, query, headers, verbose):
    url = base_url + query
    with session.get(url, headers=headers) as response:
        data = response.json()
        if response.status_code != 200:
            raise Exception(response.reason)
            
        if verbose:
            elapsed = default_timer() - START_TIME
            time_completed_at = "{:5.2f}s".format(elapsed)
            print("{0:<30} {1:>20}".format(url, time_completed_at))
        
        return data

async def async_getter(url, queries, headers=None, verbose=False):  
    if verbose:
        print("{0:<30} {1:>20}".format("File", "Completed at"))

    # Note: max_workers is set to 10 simply for this example,
    # you'll have to tweak with this number for your own projects
    # as you see fit
    with ThreadPoolExecutor(max_workers=10) as executor:
        with requests.Session() as session:
            # Set any session parameters here before calling `fetch`

            # Initialize the event loop        
            loop = asyncio.get_event_loop()
                            
            # Set the START_TIME for the `fetch` function
            START_TIME = default_timer()

            # Use list comprehension to create a list of
            # tasks to complete. The executor will run the `fetch`
            # function for each csv in the csvs_to_fetch list
            tasks = [
                loop.run_in_executor(
                    executor,
                    get,
                    *(session, url, query, headers, verbose) # Allows us to pass in multiple arguments to `fetch`
                )
                for query in queries
            ]
            
            # Initializes the tasks to run and awaits their results
            responses = []
            for response in await asyncio.gather(*tasks):
                responses.append(response)
            return responses

def async_get(url, queries, headers=None, verbose=False):
    START_TIME = default_timer()
    loop = asyncio.get_event_loop()
    if loop.is_running():
        future = asyncio.ensure_future(async_getter(url, 
                                            queries, 
                                            headers=headers, 
                                            verbose=verbose)
                              )
        return future
    else:
        result = loop.run_until_complete(async_getter(url, 
                                                      queries, 
                                                      headers=headers, 
                                                      verbose=verbose)
                                        )
        return result

# Given a lsit of tracks, get their song features
def featurize_tracks(tracks, spotipy_session, chunk_size=100, verbose=False):
    # From the features, extract just the ones we want
    features_to_get = ['energy', 'liveness', 'speechiness', 'acousticness', 'instrumentalness', 
                       'danceability', 'loudness', 'valence', 'tempo']
    feature_names = features_to_get + ["popularity"]

    def extract_features(features):
        # If a song hasn't been featurized, return an empty list
        if features is None:
            return []
        else:
            return [features[feature_to_get] for feature_to_get in features_to_get]
    
    # Get all of the features we are interested in from a set of track URIs
    def get_features_for_songs(songs, chunk_size=100, verbose=False):
        all_features = []
        num_chunks = int(len(songs) / chunk_size)
        remainder = int(((len(songs) / chunk_size) % 1) * chunk_size)
        for i in range(num_chunks):
            low = chunk_size * i
            high = chunk_size * (i + 1)
            uris = songs[low:high]

            chunk_track_features = spotipy_session.audio_features(uris)      
            all_features += [extract_features(features) for features in chunk_track_features]
            if verbose:
                print(f"{((i + 1) / num_chunks)*100:.1f}% done", end="\r")

        # Finish the last chunk
        if remainder != 0:
            try:
                low = high
                high = high + chunk_size
            except:
                low = 0
                high = chunk_size
            uris = songs[low:high]

            chunk_track_features = spotipy_session.audio_features(uris)
            all_features += [extract_features(features) for features in chunk_track_features]

        return all_features
    
    def get_uris(tracks):
        uris = []
        for track in tracks:
            try:
                uri = str(track['track']['uri'])
            except:
                continue
            uris.append(uri)
        return uris
    
    def get_popularities(tracks):
        popularities = []
        for track in tracks:
            try:
                pop = track['track']['popularity']
            except:
                continue
            popularities.append(pop)
        return popularities
    
    track_uris = get_uris(tracks)    
    
    tracks_features = get_features_for_songs(track_uris, verbose=verbose)
    
    track_names = []
    popularities = []
    ret_uris = []
    tracks_features_good = []
    # Some songs don't have features
    for track, uri, features in zip(tracks, track_uris, tracks_features):
        if len(features) != 0:
            track_names.append(track['track']['name'])
            popularities.append(track['track']['popularity'])
            ret_uris.append(uri)
            tracks_features_good.append(features)
            
    ret_features = np.array([features + [pop] for pop, features in zip(popularities, tracks_features_good)])
    
    average_features = np.mean(ret_features, axis=0)
    
    data = {
            "features" : ret_features,
            "average_features" : average_features,
            "feature_names" : feature_names
           }
    
    return track_names, ret_uris, data

def get_artists_genres(artists, spotipy_session, chunk_size=50, verbose=False):
    all_genres = []
    num_artists = len(artists)
    num_chunks = int(num_artists / chunk_size)
    remainder = int(((num_artists / chunk_size) % 1) * chunk_size)
    
    for i in range(num_chunks):
        low = chunk_size * i
        high = chunk_size * (i + 1)
        uris = artists[low:high]

        artist_information = spotipy_session.artists(uris)['artists']      
        all_genres += [artist['genres'] for artist in artist_information]
        if verbose:
            print(f"{((i + 1) / num_chunks)*100:.1f}% done", end="\r")

    # Finish the last chunk
    if remainder != 0:
        try:
            low = high
            high = high + chunk_size
        except:
            low = 0
            high = chunk_size
        uris = artists[low:high]

        artist_information = spotipy_session.artists(uris)['artists']      
        all_genres += [artist['genres'] for artist in artist_information]
        
    return all_genres


def get_song_genres(tracks, spotipy_session, chunk_size=50, verbose=False):
    num_tracks = len(tracks)
    
    all_artists = []
    all_artist_names = []
    index = []
    for i, track in enumerate(tracks):
        artists = track['track']['artists']
        for artist in artists:
            all_artists.append(artist['uri'])
            all_artist_names.append(artist['name'])
            index.append(i)
    
    all_artists = np.array(all_artists)
    all_artist_names = np.array(all_artist_names)
    index = np.array(index)
    all_genres = np.array(get_artists_genres(all_artists, spotipy_session, chunk_size=chunk_size, verbose=verbose))
    
    genres = []
    artist_uris = []
    artist_names = []
    track_indices = np.arange(num_tracks)
    for track_index in track_indices:
        genres.append(sum(all_genres[np.where(track_index == index)], []))
        artist_uris.append(list(all_artists[np.where(track_index == index)]))
        artist_names.append(list(all_artist_names[np.where(track_index == index)]))

    return artist_names, artist_uris, genres

def get_dates_added(tracks):
    return [track['added_at'] for track in tracks]