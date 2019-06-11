var parseUTCTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ")

// Function to classify umbrella genre categories: takes a genre name as input and returns an object with umbrellas category booleans
// Perhaps this function should also return an umbrella variable indicating which umbrella genre it falls into (since many genres will fall into more than one umbrella). This would also make it easier to assign colors to data points
function classifyUmbrellaGenre(genre) {
    // console.log(genre);
    isRock = genre.toLowerCase().includes('rock');
    isPop = genre.toLowerCase().includes('pop');
    isRap = genre.toLowerCase().includes('rap');
    isMetal = genre.toLowerCase().includes('metal');
    isClassical = genre.toLowerCase().includes('classical');
    isElectronic = genre.toLowerCase().includes('elect');
    isOther = !(isRock || isPop || isRap || isElectronic || isClassical || isMetal)
    return {isRock, isPop, isRap, isMetal, isClassical, isElectronic, isOther};
}

var genre_labels = ['Pop',    'Rock',   'Rap',      'Electronic','Classical','Metal',   'Other']

// A function to process the user library data
function songDataProcess(songData) {
    songData.forEach(function(s) {
        // Classify each song into umbrella genres
        s.isRock = s.isPop = s.isRap = s.isMetal = s.isClassical = s.isElectronic = s.isOther = Boolean(false) // Initialize all umbrella types to false before you loop through
        s.genres.forEach(function(g) { // Loop through all genres associated with this song and assign umbrella genres to the song
            if (classifyUmbrellaGenre(g).isRock) {s.isRock = Boolean(true)};
            if (classifyUmbrellaGenre(g).isPop) {s.isPop = Boolean(true)};
            if (classifyUmbrellaGenre(g).isRap) {s.isRap = Boolean(true)};
            if (classifyUmbrellaGenre(g).isMetal) {s.isMetal = Boolean(true)};
            if (classifyUmbrellaGenre(g).isClassical) {s.isClassical = Boolean(true)};
            if (classifyUmbrellaGenre(g).isElectronic) {s.isElectronic = Boolean(true)};
            if (classifyUmbrellaGenre(g).isOther) {s.isOther = Boolean(true)};
            // Take the date string and create a JS Date Object (date string format is "2019-05-27T04:34:26Z")
            s.dateAdded = parseUTCTime(s.date);
        })
    })
    return songData;
}

function loadSongData() {
    // Create a promise for the data
    var songDataPromise = d3.json("data/steven/data_user_library.json");
    
    return songDataPromise.then(songDataProcess, function(error) {
        console.log("Could not load song data!");
    });
}

// A function to process the user library data
function genreDataProcess(genreData) {
    // Do the following for every element in the json file
    genreData.forEach(function(g) {
        g.isRock = classifyUmbrellaGenre(g.name).isRock; 
        g.isPop = classifyUmbrellaGenre(g.name).isPop; 
        g.isRap = classifyUmbrellaGenre(g.name).isRap; 
        g.isMetal = classifyUmbrellaGenre(g.name).isMetal; 
        g.isClassical = classifyUmbrellaGenre(g.name).isClassical;
        g.isElectronic = classifyUmbrellaGenre(g.name).isElectronic;
        g.isOther = classifyUmbrellaGenre(g.name).isOther;
        g.userCount = 0;
    })

    return genreData;
}

function loadGenreData() {
    // Create a promise for the data
    var genreDataPromise = d3.json("data/data_genres_average_features.json");
    
    return genreDataPromise.then(genreDataProcess, function(error) {
        console.log("Could not load genre data!");
    });
}

function loadTopArtistsData() {
    var top_artists_basename = "data_top_artists_{timeScale}_term.json";

    var top_artists_short = top_artists_basename.replace("{timeScale}", "short");
    var top_artists_medium = top_artists_basename.replace("{timeScale}", "medium");
    var top_artists_long = top_artists_basename.replace("{timeScale}", "long");

    return Promise.all([d3.json("data/steven/" + top_artists_short), 
                        d3.json("data/steven/" + top_artists_medium),
                        d3.json("data/steven/" + top_artists_long)
                    ]).then(function(results) {
                        return {"short" : results[0], "medium" : results[1], "long" : results[2]};
                    }, function(error) {
                        console.log("Trouble loading top artist data!");
                        console.log(error);
                    })
}

function loadTopTracksData() {
    var top_tracks_basename = "data_top_tracks_{timeScale}_term.json";

    var top_tracks_short = top_tracks_basename.replace("{timeScale}", "short");
    var top_tracks_medium = top_tracks_basename.replace("{timeScale}", "medium");
    var top_tracks_long = top_tracks_basename.replace("{timeScale}", "long");

    return Promise.all([d3.json("data/steven/" + top_tracks_short), 
                        d3.json("data/steven/" + top_tracks_medium),
                        d3.json("data/steven/" + top_tracks_long)
                    ]).then(function(results) {
                        return {"short" : results[0], "medium" : results[1], "long" : results[2]};
                    }, function(error) {
                        console.log("Trouble loading top track data!");
                        console.log(error);
                    })
}

function loadRecentlyPlayedData() {
    return Promise.all([d3.json("data/steven/data_recently_played.json")]).then(function(results) {
        return results[0];
    }, function(error) {
        console.log("Trouble loading recently played data!");
        console.log(error);
    })
}