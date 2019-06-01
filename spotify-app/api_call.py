import json

import os
import sys

import requests
from urllib.parse import quote

# Spotify URLS
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com"
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)

def get(endpoint, token):
    authorization_header = {"Authorization": "Bearer {}".format(token)}
    response = requests.get(endpoint, headers=authorization_header)
    return response	

def get_profile_data(token):
    user_profile_api_endpoint = "{}/me".format(SPOTIFY_API_URL)
    profile_response = get(user_profile_api_endpoint, token)
    profile_data = profile_response.json()

    return profile_data

def get_user_playlists(token, user_id):
    # Get user playlist data
    playlist_api_endpoint = "{}/users/{}/playlists".format(SPOTIFY_API_URL, user_id)
    
    playlists_response = get(playlist_api_endpoint, token)
    playlist_data = playlists_response.json()

    all_playlists = []
    all_playlists.append(playlist_data)

    while playlist_data['next']:
        playlists_response = get(playlist_data['next'], token)
        playlist_data = playlists_response.json()
        all_playlists.append(playlist_data)

    playlists = sum([playlist['items'] for playlist in all_playlists], [])

    return playlists
