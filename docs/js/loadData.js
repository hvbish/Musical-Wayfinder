var parseUTCTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ")

// Function to classify umbrella genre categories: takes a genre name as input and returns an object with umbrellas category booleans
// Perhaps this function should also return an umbrella variable indicating which umbrella genre it falls into (since many genres will fall into more than one umbrella). This would also make it easier to assign colors to data points
function classifyUmbrellaGenre(genre) {
    isRock = genre.toLowerCase().includes('rock');
    isPop = genre.toLowerCase().includes('pop');
    isRap = genre.toLowerCase().includes('rap');
    isMetal = genre.toLowerCase().includes('metal');
    isClassical = genre.toLowerCase().includes('classical');
    isElectronic = genre.toLowerCase().includes('elect');
    isOther = !(isRock || isPop || isRap || isElectronic || isClassical || isMetal)
    return {isRock, isPop, isRap, isMetal, isClassical, isElectronic, isOther};
}

var genre_labels = ["Rock", "Pop", "Rap", "Metal", "Classical", "Electronic", "Other"];

// A function to process the user library data
var songDataGlobal;
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
    songDataGlobal = songData;
}

function loadSongData() {
    // Create a promise for the data
    var songDataPromise = d3.json("data/data_user_library.json");
    
    return songDataPromise.then(songDataProcess, function(error) {
        console.log("Could not load song data!");
    });
}

// A function to process the user library data
var genreDataGlobal;
function genreDataProcess(genreData) {
    // Do the following for every element in the json file
    genreData.forEach(function(g) {
        g.isRock = classifyUmbrellaGenre(g.genre).isRock; 
        g.isPop = classifyUmbrellaGenre(g.genre).isPop; 
        g.isRap = classifyUmbrellaGenre(g.genre).isRap; 
        g.isMetal = classifyUmbrellaGenre(g.genre).isMetal; 
        g.isClassical = classifyUmbrellaGenre(g.genre).isClassical;
        g.isElectronic = classifyUmbrellaGenre(g.genre).isElectronic;
        g.isOther = classifyUmbrellaGenre(g.genre).isOther;
        g.userCount = 0;
    })

    genreDataGlobal = genreData;
}

function loadGenreData() {
    // Create a promise for the data
    var genreDataPromise = d3.json("data/genre_data.json");
    
    return genreDataPromise.then(genreDataProcess, function(error) {
        console.log("Could not load genre data!");
    });
}
