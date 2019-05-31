import json

import os
import sys

PUBLIC_HTML_PATH="/nfs/bronfs/uwfs/dw00/d95/stevengs"
FLASK_PATH = "cse512/flaskenv/lib/python3.6/site-packages"

sys.path.append(os.path.join(PUBLIC_HTML_PATH, FLASK_PATH))

from flask import Flask, request, redirect, g, render_template
import requests
from urllib.parse import quote
import auth, api_call

# Authentication Steps, paramaters, and responses are defined at https://developer.spotify.com/web-api/authorization-guide/
# Visit this url to see all the steps, parameters, and expected response.

app = Flask(__name__)

if os.getenv("BASE_URL") is None:
    BASE_URL = "http://students.washington.edu/stevengs/cse512"
else:
    BASE_URL = os.getenv("BASE_URL")

VIZ_PAGE = "/viz"
CALLBACK_URL = BASE_URL + VIZ_PAGE

CLIENT_ID, CLIENT_SECRET = auth.get_id_and_secret()

SCOPES = " ".join(["playlist-read-private", 
                   "playlist-read-collaborative",
                   "user-library-read",
                   "user-read-recently-played",
                   "user-top-read"])

@app.route("/")
def index():
    auth_url = auth.get_redirect_url(CLIENT_ID, SCOPES, CALLBACK_URL)
    return redirect(auth_url)

@app.route("/viz")
def callback():
    access_token, refresh_token, token_type, expires_in = auth.get_token(request, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL) 
    
    profile_data = api_call.get_profile_data(access_token)
    
    playlist_data = api_call.get_user_playlists(access_token, profile_data['id'])

    open("tokens.txt", "a").write("{}\t{}\n".format(profile_data['id'], access_token))

    # Combine profile and playlist data to display
    display_arr = [profile_data] + playlist_data["items"]
    return render_template("index.html", sorted_array=display_arr)

if __name__ == "__main__":
    app.run(debug=True, port=PORT)
