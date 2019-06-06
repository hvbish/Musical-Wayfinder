// Testing tutorial learnings on our Spotify data

/////////////////////////////////////
//////////  Chart Set-up  ///////////
/////////////////////////////////////

// Set margins and the plot origin/size
var margin = { left:100, right:200, top:50, bottom:100 };

var axisLength = 500;
var axisLengthLineX = 500
var axisLengthLineY = 500
var axisLengthStatsX = 500
var axisLengthStatsY = 500
var legendHeight = 200
var legendWidth = 200


var xOrigin = 0;
var yOrigin = axisLength;

var allGenreToggle = false; // Flag added to test switching between data. true = user genre data, false = all genre data
var times = [2010,2019] // For slider with a range
var maxGenreCount;
var defaultMarkerSize = 3.;
var defaultAlpha = 0.1;


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





///////////////////////////////
///////////  SVGs  ////////////
///////////////////////////////

// Define the container for the plot and adjust its location to account for margins
var svg = d3.select("#genre-plot-area")
    .append("svg")
        .attr("width", axisLength + margin.left + margin.right)
        .attr("height", axisLength + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + margin.top + ")");

var svg1 = d3.select("#song-plot-area")
    .append("svg")
        .attr("width", axisLength + margin.left + margin.right)
        .attr("height", axisLength + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + margin.top + ")");

var svgLine = d3.select("#line-plot-area")
    .append("svg")
        .attr("width", axisLengthLineX + margin.left + margin.right)
        .attr("height", axisLengthLineY + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + margin.top + ")")

var svg_leg = d3.select("#legend")
    .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + (margin.top-30) + ")");


var svgStats = d3.select("#stats-area")
    .append("svg")
        .attr("width", axisLengthStatsX + margin.left + margin.right)
        .attr("height", axisLengthStatsY + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + margin.top + ")")


///////////////////////////////
///////////  Axes  ////////////
///////////////////////////////

// Save axes to variables, which we can call later whenever we update their attributes (if we don't do this we'll end up redrawing new axis object on top of the old one)
var xAxisGroup = svg.append("g") // The variable xAxisGroup will refer to a group ("g") of elements getting appended to the svg container, and will allow us to perform actions on everything in that group at once (in this case, all the x axes on the page?)
    .attr("class", "x-axis")
    .attr("transform", "translate(0, " + (axisLength) + ")")
var yAxisGroup = svg.append("g")
    .attr("class", "y-axis");

var xAxisGroup1 = svg1.append("g") // The variable xAxisGroup will refer to a group ("g") of elements getting appended to the svg container, and will allow us to perform actions on everything in that group at once (in this case, all the x axes on the page?)
    .attr("class", "x-axis")
    .attr("transform", "translate(0, " + (axisLength) + ")")
var yAxisGroup1 = svg1.append("g")
    .attr("class", "y-axis");










///////////////////////////////
//////////  Scales  ///////////
///////////////////////////////

// Linear scales //

// X Scale
var xAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
    .domain([0.,1.])
    .range([0.,axisLength]);
var xLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
    .domain([-40.,0.])
    .range([0.,axisLength]);
var xPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
    .domain([0.,100.])
    .range([0.,axisLength]);

// Y Scale
var yAttrToPix = d3.scaleLinear() // We'll keep a separate attribute scale for the Y Axis, since we may want to update X and Y Axes differently
    .domain([0.,1.])
    .range([axisLength,0.]);
var yLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
    .domain([-40.,0.])
    .range([axisLength,0.]);
var yPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
    .domain([0.,100.])
    .range([axisLength,0.]);

var yCountsToPix;

var timeScale = d3.scaleLinear() // Time scale
    .domain([0.,100.])
    .range([axisLength,0.]);


var genreCountScale


// Time scale //

// This sets how the "date" string will be parsed and converted to JS Date object. (Should convert UTC time given in the string to local time but we may want to double-check this.)
var parseUTCTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ")

var dateToPix = d3.scaleTime()
    .domain([new Date(2008,0,1),  // Use JS Date objects
        new Date(2019,11,31)])
    .range([0.,axisLength]);


// Ordinal scale - no invert function available for this, since multiple values can be mapped to the same color. Can use this to assign colors to categories

// Define genre umbrella labels and corresponding colors to be used for the scale and the legend
var genre_labels = ['Pop',    'Rock',   'Rap',      'Electronic','Classical','Metal',   'Other']
var genre_colors = ['hotpink','firebrick','royalblue','limegreen', 'goldenrod',     'Black',   'grey']

var attrToColor = d3.scaleOrdinal()
    .domain(genre_labels)
    .range(genre_colors);



// ************ LINE PLOT ************* //

// THIS IS FOR THE LINE PLOT - MOVE THIS TO THE RIGHT PLACE LATER //

// Scales
//var x = d3.scaleTime().range([0, axisLengthLineX]);
//var y = d3.scaleLinear().range([axisLengthLineY, 0]);

// Axis generators
var xAxisCallLine = d3.axisBottom()
var yAxisCallLine = d3.axisLeft()

// Axis Groups
var xAxisGroupLine = svgLine.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + axisLengthLineX + ")");
var yAxisGroupLine = svgLine.append("g")
    .attr("class", "y axis")

// Y-Axis label
yAxisGroupLine.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Counts");

// Line path generator
var line = function(attr_name) {
    return d3.line()
            .x(function(d, i) { 
                return dateToPix(d['x0']);
            })
            .y(function(d) { 
                var bin_counts = d.length;
                return yCountsToPix(bin_counts);
            })
};

var date_bin_line = function(xScale, yScale, baselines) {
    return d3.line()
            .x(function(d, i) {
                var avg_bin = new Date((d['x0'].getTime() + d['x1'].getTime()) / 2);
                return xScale(avg_bin);
            })
            .y(function(d, i) {
                var bin_counts = d.length;
                if (baselines) {
                    bin_counts += baselines[i];
                }
                return yScale(bin_counts);
            });
}

// ************************************* //




///////////////////////////////
//////////  Labels  ///////////
///////////////////////////////

// X Axis Label
xAxisLabel = svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", xOrigin + (axisLength / 2))
    .attr("y", yOrigin + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Energy");

xAxisLabel1 = svg1.append("text")
    .attr("class", "x-axis-label")
    .attr("x", xOrigin + (axisLength / 2))
    .attr("y", yOrigin + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Energy");

// Y Axis Label
yAxisLabel = svg.append("text")
    .attr("class", "y axis-label")
    .attr("x", xOrigin - (axisLength / 2))
    .attr("y", yOrigin - axisLength - 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Acousticness");

yAxisLabel1 = svg1.append("text")
    .attr("class", "y axis-label")
    .attr("x", xOrigin - (axisLength / 2))
    .attr("y", yOrigin - axisLength - 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Acousticness");

// Title
plotTitle = svg.append("text")
    .attr("x", (axisLength / 2))
    .attr("y", 0 - (margin.top / 5))
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .text(allGenreToggle ? "All Genres" : "My Genres")

plotTitle1 = svg1.append("text")
    .attr("x", (axisLength / 2))
    .attr("y", 0  - (margin.top / 5))
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .text("My Songs")

plotTitleL = svgLine.append("text")
    .attr("x", (axisLengthLineX / 2))
    .attr("y", 0  - (margin.top / 5))
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .text("Library Timeline")

/*// Label showing time selected in slider, single value
var timeLabel = svg1.append("text")
    .attr("y", axisLength*0 +100)
    .attr("x", axisLength*0 +100)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");*/
// Label showing time selected in slider, range of values
var timesLabel = svg1.append("text")
    .attr("y", axisLength*0 -10)
    .attr("x", axisLength*0 +400)
    .attr("font-size", "25px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("2010 - 2019");








///////////////////////////////
//////////  Legend  ///////////
///////////////////////////////



var plotPop = true;
var plotRock = true;
var plotRap = true;
var plotElectronic = true;
var plotClassical = true;
var plotMetal = true;
var plotOther = true;
var plotGenre = true;

// Append the entire legend and shift it to the desired location
var legend = svg_leg.append("g")
    .attr("id", "legend");

// Loop through all the genre labels and add a legendRow group, shifting their positions so the rows down't overlap
genre_labels.forEach(function(genre, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 20) + ")");

    // Colored rectangles corresponding to each genre 
    var legendMarker = legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", attrToColor(genre))
        .attr("stroke", attrToColor(genre))
        
    // Text SVG corresponding to the genre in each row of the legend
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end") // Appends text to the left of the legend 
        .style("text-transform", "capitalize")
        .text(genre);

    // If user clicks on the legend text or SVG, toggle that genre
    legendRow.on('click',function(d) { 
            if (genre == "Pop") {
                plotPop ? plotPop = false : plotPop = true;
                plotGenre = plotPop;
            } else if (genre == "Rock") {
                plotRock ? plotRock = false : plotRock = true;
                plotGenre = plotRock;
            } else if (genre == "Rap") {
                plotRap ? plotRap = false : plotRap = true;
                plotGenre = plotRap;
            } else if (genre == "Electronic") {
                plotElectronic ? plotElectronic = false : plotElectronic = true;
                plotGenre = plotElectronic;
            } else if (genre == "Classical") {
                plotClassical ? plotClassical = false : plotClassical = true;
                plotGenre = plotClassical;
            } else if (genre == "Metal") {
                plotMetal ? plotMetal = false : plotMetal = true;
                plotGenre = plotMetal;
            } else if (genre == "Other") {
                plotOther ? plotOther = false : plotOther = true;
                plotGenre = plotOther;
            }
            if (plotGenre) {
                legendRow.attr("fill","black");
                legendMarker.attr("fill",attrToColor(genre));
                legendMarker.attr("stroke",attrToColor(genre));
            } else {
                legendRow.attr("fill","black");
                legendMarker.attr("fill","white");
                legendMarker.attr("stroke","black");
            };
            updateGenrePlot(genreData);
            updateSongPlot(libraryData);
            //console.log(libraryData);
            //updateSongPlot(libraryData);

        });

});

//console.log(libraryData);



///////////////////////////////
/////////// Tooltip ///////////
///////////////////////////////

// We should make the tooltip color the genre name according to the umbrella genre
// Also fix triangle extender on tooltip - it is to the left of the box right now (not where your mouse is)
// Some points aren't showing tooltip on mouseover? Figure out why this is

var nbsp = " &nbsp;" // Define a string containing the HTML non-breaking space 

var tipForGenre = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<span style='color:"+"Thistle"+";text-transform:capitalize'><h4>" + d.genre + nbsp.repeat(0) + "</h4></span><br>";
        if (allGenreToggle) {
            text += "<strong> In my library: </strong> <span style='color:"+"red"+";text-transform:capitalize'>" + nbsp.repeat(0) + (d.userCountFull) + "</span><br>";
        } else {
            text += "<strong> Song Count: </strong> <span style='color:"+"red"+";text-transform:capitalize'>" + nbsp.repeat(0) + (d.userCountFull) + "</span><br><br>";
        }
        text += "<strong>  Energy:           </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.energy) + "</span><br>";
        text += "<strong>  Liveness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.liveness) + "</span><br>";
        text += "<strong>  Speechiness:      </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.speechiness) + "</span><br>";
        text += "<strong>  Acousticness:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.acousticness) + "</span><br>";
        text += "<strong>  Instrumentalness: </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.instrumentalness) + "</span><br>";
        text += "<strong>  Danceability:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.danceability) + "</span><br>";
        text += "<strong>  Loudness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.loudness) + "</span><br>";
        text += "<strong>  Valence:          </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.valence) + "</span><br>";
        text += "<strong>  Popularity:       </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format(" 2.0f")(d.popularity) + "</span><br>";
        return text;
    });
svg.call(tipForGenre);

var tipForSong = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<span style='color:"+"Thistle"+";text-transform:capitalize'><h4>" + d.artists + " - " + d.name + nbsp.repeat(0) + "</h4></span><br>";
        if (d.isPop) {text += "Pop? <span style='color:"+attrToColor("Pop")+";text-transform:capitalize'>" + d.isPop + "</span><br>";}
            else {text += "Pop? <span text-transform:capitalize'>" + d.isPop + "</span><br>";}
        if (d.isRock) {text += "Rock? <span style='color:"+attrToColor("Rock")+";text-transform:capitalize'>" + d.isRock + "</span><br>";}
            else {text += "Rock? <span text-transform:capitalize'>" + d.isRock + "</span><br>";}
        if (d.isRap) {text += "Rap? <span style='color:"+attrToColor("Rap")+";text-transform:capitalize'>" + d.isRap + "</span><br>";}
            else {text += "Rap? <span text-transform:capitalize'>" + d.isRap + "</span><br>";}
        if (d.isElectronic) {text += "Electronic? <span style='color:"+attrToColor("Electronic")+";text-transform:capitalize'>" + d.isElectronic + "</span><br>";}
            else {text += "Electronic? <span text-transform:capitalize'>" + d.isElectronic + "</span><br>";}
        if (d.isClassical) {text += "Classical? <span style='color:"+attrToColor("Classical")+";text-transform:capitalize'>" + d.isClassical + "</span><br>";}
            else {text += "Classical? <span text-transform:capitalize'>" + d.isClassical + "</span><br>";}
        if (d.isMetal) {text += "Metal? <span style='color:"+attrToColor("Metal")+";text-transform:capitalize'>" + d.isMetal + "</span><br>";}
            else {text += "Metal? <span text-transform:capitalize'>" + d.isMetal + "</span><br>";}
        if (d.isOther) {text += "Other? <span style='color:"+attrToColor("Other")+";text-transform:capitalize'>" + d.isOther + "</span><br>";}
            else {text += "Other? <span text-transform:capitalize'>" + d.isOther + "</span><br>";}
        text += "<br>";
        text += "<strong>  Energy:           </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.energy) + "</span><br>";
        text += "<strong>  Liveness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.liveness) + "</span><br>";
        text += "<strong>  Speechiness:      </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.speechiness) + "</span><br>";
        text += "<strong>  Acousticness:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.acousticness) + "</span><br>";
        text += "<strong>  Instrumentalness: </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.instrumentalness) + "</span><br>";
        text += "<strong>  Danceability:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.danceability) + "</span><br>";
        text += "<strong>  Loudness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.loudness) + "</span><br>";
        text += "<strong>  Valence:          </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(d.valence) + "</span><br>";
        text += "<strong>  Popularity:       </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format(" 2.0f")(d.popularity) + "</span><br>";
        return text;
    });
svg1.call(tipForSong);








////////////////////////////////
/////// Load & plot data ///////
////////////////////////////////

var genreData;
var libraryData;

var genreDataPromise = d3.json("data/genre_data.json").then(function(genredata) {
    // Do the following for every element in the json file
    genredata.forEach(function(g){
        g.isRock = classifyUmbrellaGenre(g.genre).isRock; 
        g.isPop = classifyUmbrellaGenre(g.genre).isPop; 
        g.isRap = classifyUmbrellaGenre(g.genre).isRap; 
        g.isMetal = classifyUmbrellaGenre(g.genre).isMetal; 
        g.isClassical = classifyUmbrellaGenre(g.genre).isClassical;
        g.isElectronic = classifyUmbrellaGenre(g.genre).isElectronic;
        g.isOther = classifyUmbrellaGenre(g.genre).isOther;
        g.userCount = 0;
        g.userCountFull = 0;
        g.userFirstAddDate = new Date(2100,0,1);
    })

    genreData = genredata.map(genredata => genredata); // .map allows you to do something for each element of the list. Not sure how to use it properly yet


    genreData = genredata.map(genredata => genredata); // .map allows you to do something for each element of the list. Not sure how to use it properly yet    

    return genredata;
});



// Load general genre data file //

// Load user library data file // 

var umbrella_genre_counts = {};

genreDataPromise.then(function(genredata) {
    var genre_counts = {};      // This is the weighted genre count
    var genre_counts_full = {}  // This is the unweighted genre count
    var genre_dates = {}        // This is the date the genre first appears in the user's library
    var genre_labels = ["Rock", "Pop", "Rap", "Metal", "Classical", "Electronic", "Other"];

    for (var i in genre_labels) {
        umbrella_genre = genre_labels[i];
        umbrella_genre_counts[umbrella_genre] = {};
        umbrella_genre_counts[umbrella_genre]["userCount"] = 0;
    }

    d3.json("data/data_user_library.json").then(function(librarydata) {
        // Do the following for every element in the json file
        librarydata.forEach(function(s){
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



                // Check the first add date for each of the song's genres, and update it if this song was added before that date
                if (genre_dates[g]) {
                    if (s.dateAdded < genre_dates[g]["userFirstAddDate"]) {
                         genre_dates[g]["userFirstAddDate"] = s.dateAdded
                    }
                } else {
                    genre_dates[g] = {};
                    genre_dates[g]["userFirstAddDate"] = s.dateAdded
                }


                var weight = 1. / s['genres'].length;

                if (genre_counts[g]) {
                    genre_counts[g]["userCount"] += weight;
                    genre_counts_full[g]["userCountFull"] += 1;
                } else {
                    genre_counts[g] = {};
                    genre_counts[g]["userCount"] = 0; // Steven: Should genre_counts[g]["userCount"] = weight rather than 0? In this condition we are tallying a new genre that isn't in genre_counts yet, right? Or am I confused
                    genre_counts_full[g] = {};
                    genre_counts_full[g]["userCountFull"] = 1;
                }
                if (s.isRock) {
                    umbrella_genre_counts["Rock"]["userCount"] += weight;
                }
                if (s.isPop) {
                    umbrella_genre_counts["Pop"]["userCount"] += weight;
                }
                if  (s.isRap) {
                    umbrella_genre_counts["Rap"]["userCount"] += weight;
                }
                if  (s.isMetal) {
                    umbrella_genre_counts["Metal"]["userCount"] += weight;
                }
                if  (s.isClassical) {
                    umbrella_genre_counts["Classical"]["userCount"] += weight;
                }
                if  (s.isElectronic) {
                    umbrella_genre_counts["Electronic"]["userCount"] += weight;
                }
                if  (s.isOther) {
                    umbrella_genre_counts["Other"]["userCount"] += weight;
                }
            })
        })

        genreData.forEach(function(genre) {
            key = genre['genre'].toLowerCase()
            genre_in_library = genre_counts[key];
            if (genre_in_library) {
                genre.userCount = genre_counts[key]["userCount"];
                genre.userCountFull = genre_counts_full[key]["userCountFull"];
                genre.userFirstAddDate = genre_dates[key]["userFirstAddDate"];
            }


        });


        libraryData = librarydata.map(librarydata => librarydata); // .map allows you to do something for each element of the list

        // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
        updateSongPlot(libraryData);
        updateGenrePlot(genreData);
        updateLinePlot(libraryData);

    });
});




setTimeout(function(){
            console.log(genreData);
        },5000);


/////////////////////////////////
//////////// Buttons ////////////
/////////////////////////////////


// A button to toggle between the 'All Genre' scatterplot and the 'My Genre' Scatterplot
$("#toggle-button")
    .on("click", function(){
        allGenreToggle = !allGenreToggle
        // Title
        allGenreToggle ? plotTitle.text("All Genres") : plotTitle.text("My Genres");
        updateGenrePlot(genreData);
        updateSongPlot(libraryData);
    })





/////////////////////////////////
//// Dropdown Axis Selection ////
/////////////////////////////////

/*$("#genre-select")
    .on("change", function(){ // This ensures that the visualization is updated whenever the dropdown selection changes, even if animation is paused and interval is not running
        updateGenrePlot(genreData);
        updateSongPlot(libraryData);
    })
*/
$("#x-attribute-select")
    .on("change", function(){ // This ensures that the visualization is updated whenever the dropdown selection changes, even if animation is paused and interval is not running
/*        setTimeout(function(){
            updateGenrePlot(genreData);
        },0);*/
        updateGenrePlot(genreData);
        updateSongPlot(libraryData);
    })

$("#y-attribute-select")
    .on("change", function(){ // This ensures that the visualization is updated whenever the dropdown selection changes, even if animation is paused and interval is not running
        updateGenrePlot(genreData);
        updateSongPlot(libraryData);
    })






/////////////////////////////////
////////// Time Slider //////////
/////////////////////////////////


// dragslider Slider
$('#slider').dragslider({
    //min: new Date(2008, 0, 1),
    //max: new Date(2012, 11, 31),
    min: 2008,
    max: 2019,
    animate: true,
    range: true,
    rangeDrag: true,
    values: [2010,2019],
    slide: function(event, ui){
        times = ui.values;
        updateSongPlot(libraryData);
        updateGenrePlot(genreData);
    }    
});





///////////////////////////////
///// The Update Function /////
///////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    

    // margin and height of entire visualization
/*    var zoomMargin = { 
    top: window.innerHeight * 0.3, 
    left: 50, 
    bottom: window.innerHeight * 0.4, 
    right: 50 
    }; */
    var zoomMargin = { left:100, right:200, top:50, bottom:100 };
    //var zoomHeight = window.innerHeight - zoomMargin.top - zoomMargin.bottom;
    var zoomHeight = axisLength - zoomMargin.top - zoomMargin.bottom;
    // Scale distance between points to pixels on screen
    var maxDist = 1.0 // d3.max(data, function(d) { return d.distance; });
    var mapScale = xAttrToPix; 

    // The full width of all elements, even those not visible offscreen when zoomed
    var chartWidth = window.innerWidth;//maxDist * mapScale; 

    // svg width will only be as large as screen
    var screenWidth = axisLength + margin.left*1 + margin.right*1;

    // build our svg base: a margin-transformed g element dangling off an svg element
/*    var svgZoom = d3.select('#zoom-plot-area')
    .append('svg')
      .attr('width', screenWidth + zoomMargin.left + zoomMargin.right)
      .attr('height', zoomHeight + zoomMargin.top + zoomMargin.bottom)
    .append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + zoomMargin.left + ', ' + 1.5*zoomMargin.top + ')');*/

    var svgZoom = d3.select("#zoom-plot-area")
    .append("svg")
        .attr("width", axisLength + margin.left*0 + margin.right*0)
        .attr("height", axisLength + margin.top*0 + margin.bottom*0)
    .append("g")
        .attr("transform", "translate(" + (margin.left*1)
        + ", " + (axisLength + margin.top) + ")");

    // Then we overlay it with a rect element that we’ll use as our sensor, our zoom base. This rect will listen to all mouse events and gestures
    var listenerRect = svgZoom
    .append('rect')
      .attr('class', 'listener-rect')
      .attr('x', 0)
      .attr('y', -axisLength)
      .attr('width', axisLength + margin.left*1 + margin.right*1)
      .attr('height', axisLength + margin.top*1 + margin.bottom*1)
      .style('opacity', 0);


    // X Axis Label
    xAxisLabel = svgZoom.append("text")
        .attr("class", "x-axis-label")
        .attr("x", xOrigin + (axisLength / 2))
    .attr("y", 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Energy");

    // Y Axis Label
    yAxisLabel = svgZoom.append("text")
        .attr("class", "y axis-label")
        .attr("x", xOrigin + (axisLength / 2))
    .attr("y", yOrigin - axisLength - 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Acousticness");



// This is the function we will call whenever we want to update the data that is showing on the screen

function updateGenrePlot(data) {



        // Filter data based on user selection //

    var selectedAttributeX = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    var selectedAttributeY = $("#y-attribute-select").val(); // This is the genre that has been selected by the user
    
/*
    // Filter the data for interactive legend
    var data = data.filter(function(d){           // Filter the data for dropdown
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) {
                return true;
            } else {
                return false;
            }
        })*/
                

    // Filter the data for interactive legend & time slider
    var data = data.filter(function(d){       
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) { // For interactive legend
            // Genre is selected in legend
                if (allGenreToggle){
                    // AND plotting full set of genres
                    return true;
                } else {
                    // NOT plotting full set of genres
                    if ((d.userFirstAddDate.getFullYear() >= times[0]) & (d.userFirstAddDate.getFullYear()  <= times[1])) {
                        // AND add date is within slider time range
                        return true;
                    } else {
                        // NOT within slider time range
                        return false;
                    }
                }    
            } else {
                return false;
            }
        })


    // Get the maximum number of counts for all genres so point size can be scaled accordingly
    maxGenreCount = d3.max(data, function(g) {
        return g.userCount;
    })


    // mapping two measures to screen coordinates: distance and radius:
    // mapping userCount to radius
    var rExtent = d3.extent(data, function(d) { return d.userCount; });

    var rScale = d3.scaleLinear()
        .domain([0, rExtent[1]]) // range of user counts
        .range([1, 2]); // size of circles

    // Our second scale is the distance scale: We map the data extent to the full chartWidth (not the screenWidth).
    var xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, axisLength]);

    var yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([axisLength, 0]);




        // X Axis
    var xAxis;
    if (selectedAttributeX == 'loudness') {
        xAxis = d3.axisBottom(xLoudnessToPix);
    } else if (selectedAttributeX == 'popularity') {
        xAxis = d3.axisBottom(xPopularityToPix);
    } else {
        xAxis = d3.axisBottom(xAttrToPix);
    }
/*    xAxisGroup.call(xAxis)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (axisLength) + ")");*/

    // Y Axis
    var yAxis;
    if (selectedAttributeY == 'loudness') {
        yAxis = d3.axisLeft(yLoudnessToPix);
    } else if (selectedAttributeY == 'popularity') {
        yAxis = d3.axisLeft(yPopularityToPix);
    } else {
        yAxis = d3.axisLeft(yAttrToPix);
    }
/*    yAxisGroup.call(yAxis)
        .attr("class", "y axis");*/
        //.attr("transform", "translate(0, " + (axisLength) + ")");


    // X Axis Label
    xAxisLabel.attr("class", "x-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeX.charAt(0).toUpperCase() + selectedAttributeX.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Y Axis Label
    yAxisLabel.attr("class", "y-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeY.charAt(0).toUpperCase() + selectedAttributeY.slice(1)); // Capitalize first character in value string and use it as the axis label




    // produce the axis' g base and unleash the component on it:
    // Like our listenerRect, the axis becomes a child of our g.chart element we labelled svg.
    //Why insert it? We want our zoom base to be on top of all other elements dangling off the svg.
    // so it can consume all the events. Looking at the DOM it should be the last child element of svg
    var xAxisDraw = svgZoom.insert('g', ':first-child')
        .attr('class', 'x axis')
        .call(xAxis);

    var yAxisDraw = svgZoom.insert('g', ':first-child')
        .attr('class', 'y axis')
        .attr("transform", "translate(" + (margin.left*0)
        + ", " + ( -axisLength) + ")")
        .call(yAxis);


    // Move the axis-labels and -lines down
    //var labelHeight = xAxisDraw.select('text').node().getBBox().height;
    //xAxisDraw.attr('transform', 'translate(0, ' + (zoomHeight + labelHeight * data.length) + ')');

    // Move the axis-labels and -lines down
/*  var labelHeight = xAxisDraw.select('text').node().getBBox().height;
  xAxisDraw.attr('transform', 'translate(0, ' + (axisLength + labelHeight * data.length) + ')'); 
  
  // Position the axis text
  xAxisDraw.selectAll('text')
    .attr('y', function(d, i) { return -(i * labelHeight + labelHeight); })
    .attr('dx', '-0.15em')
    .attr('dy', '1.15em')
    .style('text-anchor', 'start');
*/


/*      // Position the axis text
      xAxisDraw.selectAll('text')
        .attr('y', function(d, i) { return -(i * labelHeight + labelHeight); })
        .attr('dx', '-0.15em')
        .attr('dy', '1.15em')
        .style('text-anchor', 'start');*/

        genreCountScale = d3.scaleLog()
        .domain([1., maxGenreCount])
        .range([0., 5.])
        .base(10);

        // We can now draw our planets
        // First, we create a group for all our planets and make sure the listenerRect also covers these planets by inserting our g.planet-group before the rect.listener-rect. 
        // Then we join and enter() the data to our as yet virtual .planet's, which will manifest as circles with the respectively scaled distances as x positions and rScaled radii
      var gPlanets = svgZoom
    .insert('g', '.listener-rect')
    .attr('class', 'planet-group');

// Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var planets = gPlanets.selectAll("circle") // Genre scatterplot
        .data(data, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.genre;
        });

    // 2 -- EXIT old elements not present in new data.
    planets.exit().remove();


                          // 3 -- UPDATE old elements present in new data.
            var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

            planets
                .transition(update_trans)
                    .attr("cx", function(d, i){
                        if (selectedAttributeX == 'loudness') {
                            return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                        } else if (selectedAttributeX == 'popularity') {
                            return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                        } else {
                            return xScaleNew(xOrigin + xAttrToPix(d[selectedAttributeX]));
                        }               
                    })
                    .attr("cy", function(d, i){
                    if (selectedAttributeY == 'loudness') {
                            return yLoudnessToPix(d[selectedAttributeY]);
                        } else if (selectedAttributeY == 'popularity') {
                            return yPopularityToPix(d[selectedAttributeY]);
                        } else {
                            return yScaleNew(yAttrToPix(d[selectedAttributeY])-axisLength);
                        }
                    });

            // 4 -- ENTER new elements present in new data.
            // 4 1/2 -- Set attributes that apply to both old and new elements with .merge()
            planets.enter()
                .append("circle")
                    .attr("cx", function(d, i){
                        if (selectedAttributeX == 'loudness') {
                            return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                        } else if (selectedAttributeX == 'popularity') {
                            return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                        } else {
                            return xOrigin + xAttrToPix(d[selectedAttributeX]);
                        }               
                    })
                    .attr("cy", function(d, i){
                        if (selectedAttributeY == 'loudness') {
                            return yLoudnessToPix(d[selectedAttributeY]);
                        } else if (selectedAttributeY == 'popularity') {
                            return yPopularityToPix(d[selectedAttributeY]);
                        } else {
                            return yAttrToPix(d[selectedAttributeY])-axisLength;
                        }
                    })
                    .merge(planets) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements.
                            .attr('id', function(d) { return d.genre; })
                            .attr('class', 'planet')
                            .attr("r", function(d) {
                                if (allGenreToggle) {
                                    return defaultMarkerSize;
                                } else {
                                    if (d.userCount == 0.) {
                                        return d.userCount;
                                    } else {
                                        //return genreCountScale(d.userCount + 1);
                                        return rScale(d.userCountFull);
                                    }
                                    
                                }
                            })
                            .attr("fill", function(d){
                                if (d.isRock) {
                                    return attrToColor('Rock')
                                } else if (d.isRap) {
                                    return attrToColor('Rap')
                                } else if (d.isPop) {
                                    return attrToColor('Pop')
                                } else if (d.isMetal) {
                                    return attrToColor('Metal')
                                } else if (d.isClassical) {
                                    return attrToColor('Classical')
                                } else if (d.isElectronic) {
                                    return attrToColor('Electronic')
                                } else {
                                    return "grey"
                                }
                            })
                            .on("mouseover", tipForGenre.show)
                            .on("mouseout", tipForGenre.hide);

/*
    planets.enter()
    .append('circle')
    .merge(planets)
      .attr('class', 'planet')
      .attr('id', function(d) { return d.genre; })
      .attr('cx', function(d) { return xScale(d.energy); })
      .attr('cy', function(d) { return -xScale(d.acousticness); })
      .attr('fill','red')
      .attr('r', function(d) { 
        d.scaledRadius = rScale(d.userCountFull); 
        return d.scaledRadius; 
      });*/



      // Let’s choose our zoom base element first. You can attach the zoom to an svg, g, rect or any other element that your mouse has access to. Note here, that g elements can only register events where they have children with a set fill property. So, if you have a large g element with a circle of radius 1, your zoom gestures will only work on that tiny circle.
      // As such, it’s often wise to set up a dedicated rect with fill, but 0 opacity. You have to make sure that the zoom base can consume all events. So, it should either be on top of all other elements, or its pointer-events should be set to all while all other elements’ pointer-events are set to none.
      // In fact, we already totally decided to set up an extra rect element to listen to events. We wisely cached it in the listenerRect variable, which we can refer to upon set-up. 

      //Calling d3.zoom() will return an object and a function.
      //As with many parts of the D3 API, the object allows us to configure the variables we use in the function.
      //So what we do up there is configuring the use of the d3.zoom() function with a single method: 
      //.on() attaches a handler function called zoomed. zoomed will be called every time we zoom.
      //This is where we’ll make the elements move

      // We store the returned function in the creatively named variable zoom.
      //Next, we can use this function as zoom(<listener-element>)
      //or, as it’s more commonly done in D3 <listener-element>.call(zoom) like so
    var zoom = d3.zoom()
        .on('zoom', zoomed);

    listenerRect.call(zoom);

        function zoomed() {

              var transform = d3.event.transform;

              // x is never higher than 0 so you can't move the points to the right
               //transform.x = Math.min(0, transform.x);

              // y will always be 0 so it can't move
                //transform.y = Math.max(0, transform.y);

                // geometric zoom?
              gPlanets.attr('transform', transform.toString());

              //The main positioning engine behind the axis’ elements — the thing that makes the labels and lines move — is the scale. 
              //And what does the scale do? The scale maps our data values to the width of our svg element. 
              //If we want to change a scale with D3 we usually update the scale’s domain and/or range. 
              //But as rescaling axes is such a common activity for D3 zoom, we have the rescaleX() and rescaleY() methods dangling off the transform object. 
              //It updates the mapping for us according to the zoom. 
              //Perfect syntactic sugar we can use to create an updated scale:

              var xScaleNew = transform.rescaleX(xAttrToPix);
              var yScaleNew = transform.rescaleY(yAttrToPix);

/*              planets
                  .attr('cx', function(d) { return xScaleNew(d.energy); })
                  .attr('cy', function(d) { return xScaleNew(d.acousticness); })
                  .attr('r', function(d) { return d.scaledRadius * transform.k; });*/


                      // 3 -- UPDATE old elements present in new data.
            var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

            planets
                .attr('id', function(d) { return d.genre; })
                .attr('class', 'planet')
                .transition(update_trans)
                    .attr("cx", function(d, i){
                        if (selectedAttributeX == 'loudness') {
                            return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                        } else if (selectedAttributeX == 'popularity') {
                            return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                        } else {
                            // return xOrigin + xAttrToPix(d[selectedAttributeX]);
                            return xScaleNew(xOrigin + xAttrToPix(d[selectedAttributeX]));
                        }               
                    })
                    .attr("cy", function(d, i){
                    if (selectedAttributeY == 'loudness') {
                            return yLoudnessToPix(d[selectedAttributeY]);
                        } else if (selectedAttributeY == 'popularity') {
                            return yPopularityToPix(d[selectedAttributeY]);
                        } else {
                            // return yAttrToPix(d[selectedAttributeY])-axisLength;
                            xScaleNew(yAttrToPix(d[selectedAttributeY])-axisLength);
                        }
                    })
                    .attr("r", function(d) {
                                if (allGenreToggle) {
                                    return defaultMarkerSize;
                                } else {
                                    if (d.userCount == 0.) {
                                        return d.userCount;
                                    } else {
                                        //return genreCountScale(d.userCount + 1);
                                        // return rScale(d.userCountFull); // for zoom w/o transform
                                        return (rScale(d.userCountFull) * transform.k);
                                    }
                                    
                                }
                            })
                            .attr("fill", function(d){
                                if (d.isRock) {
                                    return attrToColor('Rock')
                                } else if (d.isRap) {
                                    return attrToColor('Rap')
                                } else if (d.isPop) {
                                    return attrToColor('Pop')
                                } else if (d.isMetal) {
                                    return attrToColor('Metal')
                                } else if (d.isClassical) {
                                    return attrToColor('Classical')
                                } else if (d.isElectronic) {
                                    return attrToColor('Electronic')
                                } else {
                                    return "grey"
                                }
                            })
                            .on("mouseover", tipForGenre.show)
                            .on("mouseout", tipForGenre.hide);

           


              // The next section is called Semantic Zoom with SVG and will carelessly open the hood of this rescaleX() method for much more detail.
              // But for now, let's just use xScaleNew trustingly like so:

              xAxis.scale(xScaleNew);
              yAxis.scale(yScaleNew);
                xAxisDraw.call(xAxis);
                yAxisDraw.call(yAxis);

                // We update the scale of our xAxis and redraw the axis with our new axis component.
            // The last thing we need to do to the axis is stagger our labels and lines again, as we’ve done above

            // Stagger the axis-labels 
        /*  xAxisDraw.selectAll('text')
            .attr('y', function(d, i) { return -(i * labelHeight + labelHeight); })*/


          /*// Stagger the axis-lines
          xAxisDraw.selectAll('line')
            .attr('y1', function(d, i) { return -(i * labelHeight + labelHeight); })
            .attr('y2', function(d, i) { 
              return -(i * labelHeight + labelHeight + (data.length-1-i) * labelHeight + zoomHeight); 
            });*/




        } 






////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////








    // Filter data based on user selection //

    var selectedAttributeX = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    var selectedAttributeY = $("#y-attribute-select").val(); // This is the genre that has been selected by the user
    
/*
    // Filter the data for interactive legend
    var data = data.filter(function(d){           // Filter the data for dropdown
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) {
                return true;
            } else {
                return false;
            }
        })*/
                

    // Filter the data for interactive legend & time slider
    var data = data.filter(function(d){       
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) { // For interactive legend
            // Genre is selected in legend
                if (allGenreToggle){
                    // AND plotting full set of genres
                    return true;
                } else {
                    // NOT plotting full set of genres
                    if ((d.userFirstAddDate.getFullYear() >= times[0]) & (d.userFirstAddDate.getFullYear()  <= times[1])) {
                        // AND add date is within slider time range
                        return true;
                    } else {
                        // NOT within slider time range
                        return false;
                    }
                }    
            } else {
                return false;
            }
        })


    // Get the maximum number of counts for all genres so point size can be scaled accordingly
    maxGenreCount = d3.max(data, function(g) {
        return g.userCount;
    })


    // Update the domain of your axes based on the new data you are using //
    
    // genreCountScale.domain(0., maxGenreCount).range([0, 1]);
    
/*    genreCountScale = d3.scaleLinear()
        // .domain([0., Math.log2(maxGenreCount + 1)])
        .domain([0., maxGenreCount])
        .range([0., 15.]);*/

    genreCountScale = d3.scaleLog()
        .domain([1., maxGenreCount])
        .range([0., 5.])
        .base(10);


    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points = svg.selectAll("circle") // Genre scatterplot
        .data(data, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.genre;
        });

    // 2 -- EXIT old elements not present in new data.
    points.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

    points
        .transition(update_trans)
            .attr("cx", function(d, i){
                if (selectedAttributeX == 'loudness') {
                    return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                } else if (selectedAttributeX == 'popularity') {
                    return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                } else {
                    return xOrigin + xAttrToPix(d[selectedAttributeX]);
                }               
            })
            .attr("cy", function(d, i){
            if (selectedAttributeY == 'loudness') {
                    return yLoudnessToPix(d[selectedAttributeY]);
                } else if (selectedAttributeY == 'popularity') {
                    return yPopularityToPix(d[selectedAttributeY]);
                } else {
                    return yAttrToPix(d[selectedAttributeY]);
                }
            });

    // 4 -- ENTER new elements present in new data.
    // 4 1/2 -- Set attributes that apply to both old and new elements with .merge()
    points.enter()
        .append("circle")
            .attr("cx", function(d, i){
                if (selectedAttributeX == 'loudness') {
                    return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                } else if (selectedAttributeX == 'popularity') {
                    return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                } else {
                    return xOrigin + xAttrToPix(d[selectedAttributeX]);
                }               
            })
            .attr("cy", function(d, i){
                if (selectedAttributeY == 'loudness') {
                    return yLoudnessToPix(d[selectedAttributeY]);
                } else if (selectedAttributeY == 'popularity') {
                    return yPopularityToPix(d[selectedAttributeY]);
                } else {
                    return yAttrToPix(d[selectedAttributeY]);
                }
            })
            .merge(points) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements.
                    .attr("r", function(d) {
                        if (allGenreToggle) {
                            return defaultMarkerSize;
                        } else {
                            if (d.userCount == 0.) {
                                return d.userCount;
                            } else {
                                // return genreCountScale(Math.log2(d.userCount + 1)); // Hacky workaround to make log scaling work
                                return genreCountScale(d.userCount + 1);
                            }
                            
                        }
                    })
                    .attr("fill", function(d){
                        if (d.isRock) {
                            return attrToColor('Rock')
                        } else if (d.isRap) {
                            return attrToColor('Rap')
                        } else if (d.isPop) {
                            return attrToColor('Pop')
                        } else if (d.isMetal) {
                            return attrToColor('Metal')
                        } else if (d.isClassical) {
                            return attrToColor('Classical')
                        } else if (d.isElectronic) {
                            return attrToColor('Electronic')
                        } else {
                            return "grey"
                        }
                    })
                    .on("mouseover", tipForGenre.show)
                    .on("mouseout", tipForGenre.hide);


    // Draw Axes //
    
    // X Axis
    var xAxisCall;
    if (selectedAttributeX == 'loudness') {
        xAxisCall = d3.axisBottom(xLoudnessToPix);
    } else if (selectedAttributeX == 'popularity') {
        xAxisCall = d3.axisBottom(xPopularityToPix);
    } else {
        xAxisCall = d3.axisBottom(xAttrToPix);
    }
    xAxisGroup.call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)");

    // Y Axis
    var yAxisCall;
    if (selectedAttributeY == 'loudness') {
        yAxisCall = d3.axisLeft(yLoudnessToPix);
    } else if (selectedAttributeY == 'popularity') {
        yAxisCall = d3.axisLeft(yPopularityToPix);
    } else {
        yAxisCall = d3.axisLeft(yAttrToPix);
    }
    yAxisGroup.call(yAxisCall);


    // X Axis Label
    xAxisLabel.attr("class", "x-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeX.charAt(0).toUpperCase() + selectedAttributeX.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Y Axis Label
    yAxisLabel.attr("class", "y-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeY.charAt(0).toUpperCase() + selectedAttributeY.slice(1)); // Capitalize first character in value string and use it as the axis label




}



function updateLinePlot(dataL) {
    filtered_data = dataL.filter(d => d['dateAdded']);

    min_date = d3.min(filtered_data, function(d) {
        return Date.parse(d['dateAdded']);
    });
    max_date = d3.max(filtered_data, function(d) {
        return Date.parse(d['dateAdded']);
    });

    timeScale = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
        .domain([0, max_date - min_date])
        .range([0., axisLength]);

    dateToPix = d3.scaleTime()
        .domain([new Date(min_date),  // Use JS Date objects
            new Date(max_date)])
        .range([0.,axisLength]);

    var bin_data = d3.histogram()
                    .value(function(d) {
                        return Date.parse(d['dateAdded'])
                    })
                    .domain(dateToPix.domain())
                    .thresholds(dateToPix.ticks(30));

    var bins = bin_data(filtered_data);


    max_count = d3.max(bins, function(b) { return b.length });

    yCountsToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
                    .domain([0, max_count])
                    .range([axisLength, 0.]);

    // Generate axes once scales have been set
    xAxisGroupLine.call(xAxisCallLine.scale(dateToPix));
    yAxisGroupLine.call(yAxisCallLine.scale(yCountsToPix));

    // Add line to chart
    svgLine.append("path")
        .attr("class", "line")
        .attr("d", date_bin_line(dateToPix, yCountsToPix, null)(bins))
        // Remove fill and show the line in black
        .style("fill", "none")
        .style("stroke", "#000000");

    var baselines = null;
    for (i in genre_labels) {
        umbrella_genre = genre_labels[i];
        genre_filtered_data = filtered_data.filter(d => d['is' + umbrella_genre]);

        var genre_bins = bin_data(genre_filtered_data);

        for (j in genre_bins) {
            if (baselines) {
                baselines[j] += genre_bins[i].length;
            } else {
                baselines = [];
                for (k in genre_bins) {
                    baselines[k] = 0;
                }
                break;
            }
        }

        const color = d3.color(genre_colors[i]);
        svgLine.append("path")
            .attr("class", "line")
            .attr("d", date_bin_line(dateToPix, yCountsToPix, null)(genre_bins))
            // Remove fill and show the line in black
            .style("fill", "none")
            .style("stroke", color.hex());
        
    }

    var res = d3.nest()
                .key(function(d) { return d.length; })
                .entries(bins);

}

function updateSongPlot(songdata) {

    // Filter data based on user selection //

    var selectedAttributeX = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    var selectedAttributeY = $("#y-attribute-select").val(); // This is the genre that has been selected by the user


    // Filter the data for interactive legend & time slider
    var songdata = songdata.filter(function(d){       
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) { // For interactive legend
                if ((d.dateAdded.getFullYear() >= times[0]) & (d.dateAdded.getFullYear()  <= times[1])) {
                //if ((d.dateAdded >= times[0]) & (d.dateAdded  <= times[1])) {
                    return true;
                } else {
                    return false;
                }
                
            } else {
                return false;
            }
        })


    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points1 = svg1.selectAll("circle") // Song scatterplot
        .data(songdata, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.uri;
        });

    // 2 -- EXIT old elements not present in new data.
    points1.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

        points1
        .transition(update_trans) // Use transition to update element positions (not needed for new elements)
            .attr("cx", function(d, i){
                if (selectedAttributeX == 'loudness') {
                    return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                } else if (selectedAttributeX == 'popularity') {
                    return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                } else {
                    return xOrigin + xAttrToPix(d[selectedAttributeX]);
                }                
            })
            .attr("cy", function(d, i){
            if (selectedAttributeY == 'loudness') {
                    return yLoudnessToPix(d[selectedAttributeY]);
                } else if (selectedAttributeY == 'popularity') {
                    return yPopularityToPix(d[selectedAttributeY]);
                } else {
                    return yAttrToPix(d[selectedAttributeY]);
                }
            });

    // 4 -- ENTER new elements present in new data.
    points1.enter()
        .append("circle")
            .attr("cx", function(d, i){
                if (selectedAttributeX == 'loudness') {
                    return xOrigin + xLoudnessToPix(d[selectedAttributeX]);
                } else if (selectedAttributeX == 'popularity') {
                    return xOrigin + xPopularityToPix(d[selectedAttributeX]);
                } else {
                    return xOrigin + xAttrToPix(d[selectedAttributeX]);
                }               
            })
            .attr("cy", function(d, i){
                if (selectedAttributeY == 'loudness') {
                    return yLoudnessToPix(d[selectedAttributeY]);
                } else if (selectedAttributeY == 'popularity') {
                    return yPopularityToPix(d[selectedAttributeY]);
                } else {
                    return yAttrToPix(d[selectedAttributeY]);
                }
            })
            .attr("default-opacity",defaultAlpha)
            .merge(points1) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements. Helps reduce repetition in code if you want both to be updated in the same way
                .attr("r", defaultMarkerSize)
                .attr("fill-opacity",defaultAlpha)
                .attr("fill", function(d){
                    if (d.isRock) {
                        return attrToColor('Rock')
                    } else if (d.isRap) {
                        return attrToColor('Rap')
                    } else if (d.isPop) {
                        return attrToColor('Pop')
                    } else if (d.isMetal) {
                        return attrToColor('Metal')
                    } else if (d.isClassical) {
                        return attrToColor('Classical')
                    } else if (d.isElectronic) {
                        return attrToColor('Electronic')
                    } else {
                        return "grey"
                    }
                })
                .on("mouseover", tipForSong.show)
                .on("mouseout", tipForSong.hide);


    // Draw Axes //
    
    // X Axis
    var xAxisCall;
    if (selectedAttributeX == 'loudness') {
        xAxisCall = d3.axisBottom(xLoudnessToPix);
    } else if (selectedAttributeX == 'popularity') {
        xAxisCall = d3.axisBottom(xPopularityToPix);
    } else {
        xAxisCall = d3.axisBottom(xAttrToPix);
    }
    xAxisGroup1.call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)");

    // Y Axis
    var yAxisCall;
    if (selectedAttributeY == 'loudness') {
        yAxisCall = d3.axisLeft(yLoudnessToPix);
    } else if (selectedAttributeY == 'popularity') {
        yAxisCall = d3.axisLeft(yPopularityToPix);
    } else {
        yAxisCall = d3.axisLeft(yAttrToPix);
    }
    yAxisGroup1.call(yAxisCall);


    // X Axis Label
    xAxisLabel1.attr("class", "x-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeX.charAt(0).toUpperCase() + selectedAttributeX.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Y Axis Label
    yAxisLabel1.attr("class", "y-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(selectedAttributeY.charAt(0).toUpperCase() + selectedAttributeY.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Update time slider
    timesLabel.text(times[0] + " - " + times[1])
    $("#time")[0].innerHTML = times[0] + " - " + times[1]
    //$("#time-slider").slider("value", +(time))

}

///////////////////////////////
///////////////////////////////




var top_artists_list = d3.select("#top-artists")
d3.json("data/data_top_artists_short_term.json").then(function (artist_data) {
    top_artists_list.selectAll('li')
                    .data(artist_data)
                    .enter()
                    .append("button")
                    .attr("type", "button")
                    .attr("class", "list-group-item")
                    .style("outline", "none")
                    .on("click", function(f, i){
                        $that = $(this);
                        am_active = $that.hasClass('active');

                        $that.parent().parent().parent().find('button').removeClass('active');
                        if (! am_active) {
                            $that.addClass('active');   
                        }                                                                       
                    })
                    .html(function(d, i) {
                        return d['name']
                    });
});

var top_tracks_list = d3.select("#top-tracks")
d3.json("data/data_top_tracks_short_term.json").then(function (track_data) {
    top_tracks_list.selectAll('button')
                    .data(track_data)
                    .enter()
                    .append("button")
                    .attr("type", "button")
                    .attr("class", "list-group-item")
                    .style("outline", "none")
                    .on("click", function(f, i){
                        $that = $(this);
                        am_active = $that.hasClass('active');
                        $that.parent().parent().parent().find('button').removeClass('active');
                        if (! am_active) {
                            $that.addClass('active');   
                        }                                     
                    })
                    .html(function(d, i) {
                        return d['name']
                    });


setTimeout(function(){
            console.log(libraryData)
        },5000);



/*var top_tracks_selected_list = d3.select("#top-tracks-selected")

function updateStats(songdata) {


    // Filter the data for interactive legend & time slider
    var songdata = songdata.filter(function(d){       
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) { // For interactive legend
                if ((d.dateAdded.getFullYear() >= times[0]) & (d.dateAdded.getFullYear()  <= times[1])) {
                //if ((d.dateAdded >= times[0]) & (d.dateAdded  <= times[1])) {
                    return true;
                } else {
                    return false;
                }
                
                } else {
                    return false;
                }
            });

            top_tracks_selected_list.selectAll('button')
                    .data(songdata, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
                        return d.uri;
                    })
                    .enter()
                    .append("button")
                    .attr("type", "button")
                    .attr("class", "list-group-item")
                    .style("outline", "none")
                    .on("click", function(f, i){
                        $that = $(this);
                        am_active = $that.hasClass('active');
                        $that.parent().parent().parent().find('button').removeClass('active');
                        if (! am_active) {
                            $that.addClass('active');   
                        }                                     
                    })
                    .html(function(d, i) {
                        return d['name']
                    });

}*/

/*genreDataPromise.then(function(libraryData) {
updateStats(libraryData);
});*/
    



});
