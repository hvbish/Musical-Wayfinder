
////////////////////////////////////////////////////////////
// Global Variables that all plots should be able to see! //
////////////////////////////////////////////////////////////

// Global accesses to the data
var songDataGlobal;
var genreDataGlobal;
var topArtistsGlobal;
var topTracksGlobal;
var recentlyPlayedGlobal;

// The default time range for the jQuery slider
var defaultTimeRange = [2010, 2019];

// The umbrella genre labels we are working with
var genre_labels = ['Pop',    'Rock',   'Rap',      'Electronic','Classical','Metal',   'Other']
// Colors assocated with each umbrella genre
var genre_colors = ['hotpink','firebrick','royalblue','limegreen', 'goldenrod', 'Black',   'grey']
// Map all of the umbrella genres to a unique color
var umbrellaGenreToColor = d3.scaleOrdinal()
    .domain(genre_labels)
    .range(genre_colors);

// The div to put the spotify embedded players in
// TODO: move selection / default styling to loadPage() ?
var spotify_preview = d3.select("#spotify-preview").style("display", "none");

// This is a dictionary containing all of our plots
// Each plot has an svg element and an x and y axis
var plots = {};
// This is dictionary containing all of the selections the user has made
var selectionContext = {};

var nbsp = " &nbsp;" // Define a string containing the HTML non-breaking space 

///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

// Create a plot to draw things
// selector should be e.g. "#line-chart" to select a div on the page with id line-chart
// this returns the selected svg and creates a dictionary representing each axis
function generateAxes(selector, xAxisLength, yAxisLength, margin, xOrigin, yOrigin) {
    var svg = d3.select(selector)
                .append("svg")
                .attr("width", xAxisLength + margin.left + margin.right)
                .attr("height", yAxisLength + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // Axis generators
    // This might be useless
    var xAxisCall = d3.axisBottom();
    var yAxisCall = d3.axisLeft();

    // Axis Groups
    var xAxisGroup = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + xAxisLength + ")");
    var yAxisGroup = svg.append("g")
        .attr("class", "y axis")

    // Create the label
    var xAxisLabel = svg.append("text")
                        .attr("class", "x-axis-label")
                        .attr("x", xOrigin + (xAxisLength / 2))
                        .attr("y", yOrigin + 50)
                        .attr("font-size", "20px")
                        .attr("text-anchor", "middle")
    // Y Axis Label
    var yAxisLabel = svg.append("text")
                        .attr("class", "y axis-label")
                        .attr("x", xOrigin - (yAxisLength / 2))
                        .attr("y", yOrigin - yAxisLength - 50)
                        .attr("font-size", "20px")
                        .attr("text-anchor", "middle")
                        .attr("transform", "rotate(-90)")

    var xAxis = {
        "length" : xAxisLength,
        "group" : xAxisGroup,
        "call" : xAxisCall,
        "label" : xAxisLabel,
        "xOrigin" : xOrigin,
    };

    var yAxis = {
        "length" : yAxisLength,
        "group" : yAxisGroup,
        "call" : yAxisCall,
        "label" : yAxisLabel,
        "yOrigin" : yOrigin,
    };

    return [svg, xAxis, yAxis];
}

// A function to count the number of songs from the songData object in each genre as provided by the genreData object
// returns two dictionaries with genres as keys containing counts
// first dictionary is over all genres and second dictionary is over all umbrella genres
function countGenres(songData, genreData) {
    // Create and initialize temporary umbrella genre counts
    var umbrella_genre_counts = {};
    var genre_counts = {};

    // Initialize the umbrella count genres dictionary with the globally defined genre_labels
    genre_labels.forEach(function(umbrella_genre) {
        umbrella_genre_counts[umbrella_genre] = {};
        umbrella_genre_counts[umbrella_genre]["userCount"] = 0;
    })

    // For each song in the passed library
    songData.forEach(function(song) {
        // Get the song's genres
        var songGenres = song['genres'];
        // For each genre in the song's genres
        songGenres.forEach(function(genre) {
            // Find the number of genres for this song
            var num_genres = songGenres.length;
            // Provide a warning if there aren't any genres
            if (num_genres == 0) {
                console.log("Warning: Song " + song['name'] + " has no genres!");
            }
            // Compute the weight that this song should give to the count of each genre
            var weight = 1. / num_genres;
    
            // Add the weight to the genre count
            // If the key doesn't exist, genre_counts[genre] resolves to undefined which is similar to "false"
            // In that case, we need to make an entry that holds the "userCount" attribute 
            if (genre_counts[genre]) {
                genre_counts[genre]["userCount"] += weight;
            } else {
                genre_counts[genre] = {};
                genre_counts[genre]["userCount"] = weight;
            }

            // Compute the numbre of umbrella genres that each song lies in
            var num_umbrella_genres = 0;
            genre_labels.forEach(function(umbrella_genre) {
                if (song["is" + umbrella_genre]) {
                    num_umbrella_genres += 1;
                }
            });
            var umbrella_weight = 1. / num_umbrella_genres;
            // umbrella_weight = weight;
            // Do the same for the umbrella genres
            if (song.isRock) {
                umbrella_genre_counts["Rock"]["userCount"] += umbrella_weight;
            }
            if (song.isPop) {
                umbrella_genre_counts["Pop"]["userCount"] += umbrella_weight;
            }
            if  (song.isRap) {
                umbrella_genre_counts["Rap"]["userCount"] += umbrella_weight;
            }
            if  (song.isMetal) {
                umbrella_genre_counts["Metal"]["userCount"] += umbrella_weight;
            }
            if  (song.isClassical) {
                umbrella_genre_counts["Classical"]["userCount"] += umbrella_weight;
            }
            if  (song.isElectronic) {
                umbrella_genre_counts["Electronic"]["userCount"] += umbrella_weight;
            }
            if  (song.isOther) {
                umbrella_genre_counts["Other"]["userCount"] += umbrella_weight;
            }
        });
    });

    return [genre_counts, umbrella_genre_counts];
}

////////////////////////
// PLOTTING FUNCTIONS //
////////////////////////

// A function to create the song plot
// It must be passed the data to plot
// Along with a parameter 'plot' that is a dictionary
// containing the svg to draw on and associated axes.
function updateSongPlot(songData, plot) {
    var svg = plot['svg'];
    var xAxis = plot['xAxis'];
    var yAxis = plot['yAxis'];
    var margin = plot['margin'];

    // Define the origin of the plot coordinate system
    var xOrigin = xAxis['xOrigin']
    var yOrigin = yAxis['yOrigin'];

    // Filter data based on user selection //
    var selectedAttributeX = selectionContext['selectedAttributeX']; // This is the genre that has been selected by the user
    var selectedAttributeY = selectionContext['selectedAttributeY']; // This is the genre that has been selected by the user
    
    // The tooltip for songs
    var tipForSong = d3.tip().attr('class', 'd3-tip')
    .html(function(song) {
        var text = "<span style='color:"+"Thistle"+";text-transform:capitalize'><h4>" + song.artists + " - " + song.name + nbsp.repeat(0) + "</h4></span><br>";
        if (song.isPop) {text += "Pop? <span style='color:"+umbrellaGenreToColor("Pop")+";text-transform:capitalize'>" + song.isPop + "</span><br>";}
            else {text += "Pop? <span text-transform:capitalize'>" + song.isPop + "</span><br>";}
        if (song.isRock) {text += "Rock? <span style='color:"+umbrellaGenreToColor("Rock")+";text-transform:capitalize'>" + song.isRock + "</span><br>";}
            else {text += "Rock? <span text-transform:capitalize'>" + song.isRock + "</span><br>";}
        if (song.isRap) {text += "Rap? <span style='color:"+umbrellaGenreToColor("Rap")+";text-transform:capitalize'>" + song.isRap + "</span><br>";}
            else {text += "Rap? <span text-transform:capitalize'>" + song.isRap + "</span><br>";}
        if (song.isElectronic) {text += "Electronic? <span style='color:"+umbrellaGenreToColor("Electronic")+";text-transform:capitalize'>" + song.isElectronic + "</span><br>";}
            else {text += "Electronic? <span text-transform:capitalize'>" + song.isElectronic + "</span><br>";}
        if (song.isClassical) {text += "Classical? <span style='color:"+umbrellaGenreToColor("Classical")+";text-transform:capitalize'>" + song.isClassical + "</span><br>";}
            else {text += "Classical? <span text-transform:capitalize'>" + song.isClassical + "</span><br>";}
        if (song.isMetal) {text += "Metal? <span style='color:"+umbrellaGenreToColor("Metal")+";text-transform:capitalize'>" + song.isMetal + "</span><br>";}
            else {text += "Metal? <span text-transform:capitalize'>" + song.isMetal + "</span><br>";}
        if (song.isOther) {text += "Other? <span style='color:"+umbrellaGenreToColor("Other")+";text-transform:capitalize'>" + song.isOther + "</span><br>";}
            else {text += "Other? <span text-transform:capitalize'>" + song.isOther + "</span><br>";}
        text += "<br>";
        text += "<strong>  Energy:           </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.energy) + "</span><br>";
        text += "<strong>  Liveness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.liveness) + "</span><br>";
        text += "<strong>  Speechiness:      </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.speechiness) + "</span><br>";
        text += "<strong>  Acousticness:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.acousticness) + "</span><br>";
        text += "<strong>  Instrumentalness: </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.instrumentalness) + "</span><br>";
        text += "<strong>  Danceability:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.danceability) + "</span><br>";
        text += "<strong>  Loudness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.loudness) + "</span><br>";
        text += "<strong>  Valence:          </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(song.valence) + "</span><br>";
        text += "<strong>  Popularity:       </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format(" 2.0f")(song.popularity) + "</span><br>";
        return text;
    });

    svg.call(tipForSong);

    // Pick which xScale and yScale we are using
    var xAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
        .domain([0., 1.])
    var xLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
        .domain([-40., 0.])
    var xPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
        .domain([0., 100.])
    
    var yAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
        .domain([0., 1.])
    var yLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
        .domain([-40., 0.])
    var yPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
        .domain([0., 100.])

    // Create the xScale
    var xScale;

    // Choose which xScale to use based on selected attribute
    if (selectedAttributeX == 'loudness') {
        xScale = xLoudnessToPix;
    } else if (selectedAttributeX == 'popularity') {
        xScale = xPopularityToPix;
    } else {
        xScale = xAttrToPix;
    }
    
    // Set the range to be from 0 to the length of the x axis
    xScale.range([0., xAxis['length']]);

    // Create the xScale
    var yScale;

    // Choose which xScale to use based on selected attribute
    if (selectedAttributeX == 'loudness') {
        yScale = yLoudnessToPix;
    } else if (selectedAttributeX == 'popularity') {
        yScale = yPopularityToPix;
    } else {
        yScale = yAttrToPix;
    }
    
    // Set the range to be from the length of the y axis to 0 
    yScale.range([yAxis['length'], 0.]);

    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points = svg.selectAll("circle") // Song scatterplot
        .data(songData, function(song) {  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return song.uri;
        });
    
    // 2 -- EXIT old elements not present in new data.
    points.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

    points.attr("r", 3)
           .transition(update_trans)
           .attr("cx", function(song, i) {
               return xOrigin + xScale(song[selectedAttributeX]);                
            })
            .attr("cy", function(song, i){
                return yScale(song[selectedAttributeY]);                
            });

    // 4 -- ENTER new elements present in new data.
    points.enter()
            .append("circle")
            .attr("cx", function(song, i) {
                return xOrigin + xScale(song[selectedAttributeX]);                
            })
            .attr("cy", function(song, i){
                return yScale(song[selectedAttributeY]);                
            })
            .attr("r", 3)
            .on("mouseover", tipForSong.show)
            .on("mouseout", tipForSong.hide)
            // Add click action that changes the embeded song player to the current track
            .on("click", function(song, i) {
                if (spotify_preview.style("display") == "none") {
                    spotify_preview.style("display", "block");
                }
                spotify_preview.html(
                    '<iframe src="https://open.spotify.com/embed/track/track_id" width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'.replace('track_id', song.uri.split(":")[2])
                )
            })
            .merge(points) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements. Helps reduce repetition in code if you want both to be updated in the same way
                .attr("fill", function(song) {
                    if (song.isRock) {
                        return umbrellaGenreToColor('Rock')
                    } else if (song.isRap) {
                        return umbrellaGenreToColor('Rap')
                    } else if (song.isPop) {
                        return umbrellaGenreToColor('Pop')
                    } else if (song.isMetal) {
                        return umbrellaGenreToColor('Metal')
                    } else if (song.isClassical) {
                        return umbrellaGenreToColor('Classical')
                    } else if (song.isElectronic) {
                        return umbrellaGenreToColor('Electronic')
                    } else {
                        return "grey"
                    }
                });

    // Draw Axes //
    
    // X Axis
    xAxis['group'].call(d3.axisBottom(xScale))
                    .selectAll("text")
                    .attr("y", "10")
                    .attr("x", "0")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(0)");

    // Y Axis
    yAxis['group'].call(d3.axisLeft(yScale));


    // X Axis Label
    // Capitalize first character in value string and use it as the axis label
    var xAxisLabelText = selectedAttributeX.charAt(0).toUpperCase() + selectedAttributeX.slice(1);
    // Change the label to the currently selected attribute
    xAxis['label'].attr("class", "x-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(xAxisLabelText); 

    // Y Axis Label
    // Capitalize first character in value string and use it as the axis label
    var yAxisLabelText = selectedAttributeY.charAt(0).toUpperCase() + selectedAttributeY.slice(1);
    // Change the label to the currently selected attribute
    yAxis['label'].attr("class", "y-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(yAxisLabelText); // Capitalize first character in value string and use it as the axis label

    // Update time slider
    // timesLabel.text(times[0] + " - " + times[1])
    // $("#time")[0].innerHTML = times[0] + " - " + times[1]
    //$("#time-slider").slider("value", +(time))
}

function updateGenrePlot(genreData, plot) {
    var svg = plot['svg'];
    var xAxis = plot['xAxis'];
    var yAxis = plot['yAxis'];
    var margin = plot['margin'];

    // Define the origin of the plot coordinate system
    var xOrigin = xAxis['xOrigin'];
    var yOrigin = yAxis['yOrigin'];

    // Filter data based on user selection //
    var selectedAttributeX = selectionContext["selectedAttributeX"]; // This is the genre that has been selected by the user
    var selectedAttributeY = selectionContext["selectedAttributeY"]; // This is the genre that has been selected by the user

    // Add tool tips to points in plot
    var tipForGenre = d3.tip()
                        .attr('class', 'd3-tip')
                        .html(function(genre) {
                            var text = "<span style='color:"+"Thistle"+";text-transform:capitalize'><h4>" + genre.name + nbsp.repeat(0) + "</h4></span><br>";
                            text += "<strong>  Energy:           </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.energy) + "</span><br>";
                            text += "<strong>  Liveness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.liveness) + "</span><br>";
                            text += "<strong>  Speechiness:      </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.speechiness) + "</span><br>";
                            text += "<strong>  Acousticness:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.acousticness) + "</span><br>";
                            text += "<strong>  Instrumentalness: </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.instrumentalness) + "</span><br>";
                            text += "<strong>  Danceability:     </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.danceability) + "</span><br>";
                            text += "<strong>  Loudness:         </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.loudness) + "</span><br>";
                            text += "<strong>  Valence:          </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format("1.2f")(genre.valence) + "</span><br>";
                            text += "<strong>  Popularity:       </strong> <span style='color:"+"LemonChiffon"+";text-transform:capitalize'>" + nbsp.repeat(0) + d3.format(" 2.0f")(genre.popularity) + "</span><br>";
                            return text;
                        });
    svg.call(tipForGenre);

    // Get the maximum number of counts for all genres so point size can be scaled accordingly
    var maxGenreCount = d3.max(genreData, function(genre) {
        return genre.userCount;
    })

    // Update the domain of your axes based on the new data you are using //
    
    var genreCountScale = d3.scaleLinear()
        .domain([0., maxGenreCount])
        .range([0., 10.]);

    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points = svg.selectAll("circle") // Genre scatterplot
        .data(genreData, function(genre) {  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return genre.name;
        });

    // 2 -- EXIT old elements not present in new data.
    points.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(1000); // Define a transition variable with 500ms duration so we can reuse it

    // Pick which xScale and yScale we are using
    var xAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
        .domain([0., 1.])
    var xLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
        .domain([-40., 0.])
    var xPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
        .domain([0., 100.])
    
    var yAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
        .domain([0., 1.])
    var yLoudnessToPix = d3.scaleLinear() // This can apply for loudness, which ranges from 0 to -40(?)
        .domain([-40., 0.])
    var yPopularityToPix = d3.scaleLinear() // This can apply for popularity, which ranges from 0 to 100
        .domain([0., 100.])

    // Create the xScale
    var xScale;

    // Choose which xScale to use based on selected attribute
    if (selectedAttributeX == 'loudness') {
        xScale = xLoudnessToPix;
    } else if (selectedAttributeX == 'popularity') {
        xScale = xPopularityToPix;
    } else {
        xScale = xAttrToPix;
    }
    
    // Set the range to be from 0 to the length of the x axis
    xScale.range([0., xAxis['length']]);

    // Create the xScale
    var yScale;

    // Choose which xScale to use based on selected attribute
    if (selectedAttributeX == 'loudness') {
        yScale = yLoudnessToPix;
    } else if (selectedAttributeX == 'popularity') {
        yScale = yPopularityToPix;
    } else {
        yScale = yAttrToPix;
    }
    
    // Set the range to be from the length of the y axis to 0 
    yScale.range([yAxis['length'], 0.]);


    points.attr("r", function(genre) {
            if (selectionContext['flag']) {
                return genreCountScale(genre.userCount);
            } else {
                return 3.;
            }
        })
        .transition(update_trans)
            .attr("cx", function(genre, i){
                return xOrigin + xScale(genre[selectedAttributeX]);
            })
            .attr("cy", function(genre, i){
                return yScale(genre[selectedAttributeY]);
            });

    // 4 -- ENTER new elements present in new data.
    points.enter()
        .append("circle")
        .attr("cx", function(genre, i){
            return xOrigin + xScale(genre[selectedAttributeX]);
        })
        .attr("cy", function(genre, i){
            return yScale(genre[selectedAttributeY]);
        })
        .attr("r", function(genre) {
            if (selectionContext['flag']) {
                return genreCountScale(genre.userCount);
            } else {
                return 3.;
            }
            })
        .on("mouseover", tipForGenre.show)
        .on("mouseout", tipForGenre.hide)
        .on("click", function(genre, i) {
            if (spotify_preview.style("display") == "none") {
                spotify_preview.style("display", "block");
            }
            spotify_preview.html(
                '<iframe src="https://open.spotify.com/embed/playlist/playlist_id" width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'.replace('playlist_id', genre.uri.split(":")[2])
            )
        })
        .merge(points) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements. Helps reduce repetition in code if you want both to be updated in the same way
            .attr("fill", function(genre) {
                if (genre.isRock) {
                    return umbrellaGenreToColor('Rock')
                } else if (genre.isRap) {
                    return umbrellaGenreToColor('Rap')
                } else if (genre.isPop) {
                    return umbrellaGenreToColor('Pop')
                } else if (genre.isMetal) {
                    return umbrellaGenreToColor('Metal')
                } else if (genre.isClassical) {
                    return umbrellaGenreToColor('Classical')
                } else if (genre.isElectronic) {
                    return umbrellaGenreToColor('Electronic')
                } else {
                    return "grey"
                }
            });

    // Draw Axes //
    
    // X Axis
    xAxis['group'].call(d3.axisBottom(xScale))
                    .selectAll("text")
                    .attr("y", "10")
                    .attr("x", "0")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(0)");

    // Y Axis
    yAxis['group'].call(d3.axisLeft(yScale));


    // X Axis Label
    // Capitalize first character in value string and use it as the axis label
    var xAxisLabelText = selectedAttributeX.charAt(0).toUpperCase() + selectedAttributeX.slice(1);
    // Change the label to the currently selected attribute
    xAxis['label'].attr("class", "x-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(xAxisLabelText); 

    // Y Axis Label
    var yAxisLabelText = selectedAttributeY.charAt(0).toUpperCase() + selectedAttributeY.slice(1);
    // Change the label to the currently selected attribute
    yAxis['label'].attr("class", "y-axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(yAxisLabelText); // Capitalize first character in value string and use it as the axis label
}

function updateLinePlot(songData, genreData, plot) {
    var svg = plot['svg'];
    var xAxis = plot['xAxis'];
    var yAxis = plot['yAxis'];

    // Ensure that there is an associated date for each song
    filtered_data = songData.filter(d => d['dateAdded']);

    // Find the min / min range of the dates in our data
    var date_range = d3.extent(filtered_data, function(d) {
        return d['dateAdded'];
    });

    var xScale = d3.scaleTime()
                    .domain(date_range)
                    .range([0., xAxis["length"]]);
                
    // Create a function that will bin data in a consistent way on the date added
    // attribute of any data passed
    var num_bins = 10;
    var bin_edges = xScale.ticks(num_bins);

    var bin_data = d3.histogram()
                     .value(function(d) {
                         return Date.parse(d['dateAdded']);
                     })
                     .domain(xScale.domain())
                     .thresholds(bin_edges);

    var binned_data = bin_data(filtered_data);
    binned_data.forEach(function(bin) {
        bin['xMid'] = new Date((Date.parse(bin['x0']) + Date.parse(bin['x1'])) / 2);
        bin['x0'] = new Date(bin['x0']);
        bin['x1'] = new Date(bin['x1']);
    })


    var genre_bin_data = [];
    binned_data.forEach(function(bin) {
        genre_bin_data.push({"date" : bin['xMid']});

        counts = countGenres(bin, genreData);
        genre_counts = counts[0];
        umbrella_genre_counts = counts[1];

        genre_labels.forEach(function(umbrella_genre) {
            var last_index = genre_bin_data.length - 1;
            genre_bin_data[last_index][umbrella_genre] = umbrella_genre_counts[umbrella_genre]["userCount"];
        });
    });

    // Make a stack that will convert the above data into an array of series
    // where there will be a series for each key given
    var stack = d3.stack()
                  .keys(genre_labels)

    // get the series from stacking the data
    var series = stack(genre_bin_data);

    // Make a function to compute the area that a datapoint
    // should enclose
    var area = function(xScale, yScale) {
                return d3.area()
                 .x(function(d) {
                    return xScale(d['data']['date']);
                 })
                 .y0(function(d) {
                     return yScale(d[0]);
                 })
                 .y1(function(d) {
                     return yScale(d[1]);
                 })
            }

    // Find the maximum line height among all data points
    // The opaque nesting of d3.max functions and d[1] indexing comes from
    // the format of the stacked data
    // series[i] = a series of bins corresponding to genre_labels[i]
    // series[i][j] = bin j in the series. Each bin has an array of two values, the min and max y value at that bin
    // and a "data" field
    // series[i][j][1] = the height at that bin
    var max_height = d3.max(series, function(s) { 
                            return d3.max(s, function(d) {
                                return d[1];
                            }); 
                        });
    
    // Create a new scale from 0 to the maximum height
    var yScale = d3.scaleLinear()
                   .domain([0., max_height])
                   .range([yAxis["length"], 0]);
    
    /////////////////////
    // HIGHLIGHT GROUP //
    /////////////////////

    // What to do when one group is hovered
    var highlight = function(d) {
        // reduce opacity of all groups
        d3.selectAll(".line").style("opacity", .1)
        // expect the one that is hovered
        d3.select("." + d).style("opacity", 1)
    }
  
    // And when it is not hovered anymore
    var noHighlight = function(d) {
        d3.selectAll(".line").style("opacity", 1)
    }
  
    ////////////
    // LEGEND //
    ////////////

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
      .data(genre_labels)
      .enter()
      .append("rect")
        .attr("x", xAxis["length"])
        .attr("y", function(d, i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(genre){ return umbrellaGenreToColor(genre)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(genre_labels)
      .enter()
      .append("text")
        .attr("x", xAxis["length"] + size*1.2)
        .attr("y", function(d, i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(genre) { return umbrellaGenreToColor(genre);})
        .text(function(d) { return d;})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    xAxis["group"].call(xAxis["call"].scale(xScale));
    yAxis["group"].call(yAxis["call"].scale(yScale));

    var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", xAxis["length"] )
            .attr("height", yAxis["length"] )
            .attr("x", 0)
            .attr("y", 0);

    var lines = svg.append("g")
                    .attr("clip-path", "url(#clip)");

    lines.selectAll("layers")
            .data(series)
            .enter()
            .append("path")
                .attr("class", function(d, i) {
                    return "line " + genre_labels[i];
                })
                .attr("d", area(xScale, yScale))
                // Remove fill and show the line in black
                .style("fill", function(d, i) {
                    return umbrellaGenreToColor(genre_labels[i]);
                })
     
    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // Brushing    
    var brush = d3.brushX()
                    .extent([[0, 0], 
                             [xAxis["length"], yAxis["length"]] 
                            ] 
                    ).on("end", function() {
                        var newXScale;
                        var newYScale;
                        extent = d3.event.selection;
                        if (extent) {
                            newXScale = d3.scaleTime()
                                        .domain(extent.map(xScale.invert))
                                        .range([0, xAxis["length"]]);
                            
                            extent_sec = extent.map(xScale.invert).map(Date.parse);


                            data = songData.filter(d => (Date.parse(d['dateAdded']) > extent_sec[0]) &&
                                                        (Date.parse(d['dateAdded']) < extent_sec[1])
                                                    );
                            
                            var binned_data = bin_data(data);
                            binned_data.forEach(function(bin) {
                                bin['xMid'] = new Date((Date.parse(bin['x0']) + Date.parse(bin['x1'])) / 2);
                                bin['x0'] = new Date(bin['x0']);
                                bin['x1'] = new Date(bin['x1']);
                            })
                        
                            var genre_bin_data = [];
                            binned_data.forEach(function(bin) {
                                genre_bin_data.push({"date" : bin['xMid']});
                        
                                counts = countGenres(bin, genreDataGlobal);
                                genre_counts = counts[0];
                                umbrella_genre_counts = counts[1];
                        
                                genre_labels.forEach(function(umbrella_genre) {
                                    var last_index = genre_bin_data.length - 1;
                                    genre_bin_data[last_index][umbrella_genre] = umbrella_genre_counts[umbrella_genre]["userCount"];
                                });
                            });
                        
                            // Make a stack that will convert the above data into an array of series
                            // where there will be a series for each key given
                            var stack = d3.stack()
                                          .keys(genre_labels)
                        
                            // get the series from stacking the data
                            var series = stack(genre_bin_data);
                        
                            var max_height = d3.max(series, function(s) { 
                                return d3.max(s, function(d) {
                                    return d[1];
                                }); 
                            });
        
                            // Create a new scale from 0 to the maximum height
                            newYScale = d3.scaleLinear()
                                        .domain([0., max_height])
                                        .range([yAxis["length"], 0]);
    

                            lines.select(".brush").call(brush.move, null);
                        } else {
                            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit

                            newXScale = xScale;
                            newYScale = yScale;

                        }

                        xAxis["group"].call(d3.axisBottom(newXScale));
                        yAxis["group"].call(d3.axisLeft(newYScale));

                        lines.selectAll("path")
                            .attr("d", area(newXScale, newYScale))

                    });
    lines.append("g")
        .attr("class", "brush")
        .call(brush);

    yAxis['label'].text("Counts");
    xAxis['label'].text("Time");
}

//////////////////////////////
// UPDATING AND INTERACTION //
//////////////////////////////

// This function should reset the song plot to its original state using the entire library
// The function might be called after removing a brush or interaction elsewhere
function resetSongPlot() {
    updateSongPlot(songDataGlobal, plots['song-chart']);
}

function resetGenrePlot() {
    updateGenrePlot(genreDataGlobal, plots['genre-chart']);
}

function resetLinePlot() {
    updateLinePlot(songDataGlobal, genreDataGlobal, plots['line-chart']);
}

// This will reset all of the plots we've made to their standard state
function resetPlots() {
    resetSongPlot();
    resetGenrePlot();
    resetLinePlot();
}

// I am imagining we would perform all updates in a centralized location
// It will look at the selectionContext dictionary and have access to global
// songData and genreData objects that it will then filter down based on the selection
function updateAllPlots() {
    selectionContext['selectedAttributeX'] = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    selectionContext['selectedAttributeY'] = $("#y-attribute-select").val(); // This is the genre that has been selected by the user

    // We want to filter our data through a set of filters
    // Start out with the data in its full state
    var songDataFilter = songDataGlobal;
    var genreDataFilter = genreDataGlobal;

    // Start applying filters to the data based on the state of our application
    // For example here we check if we want to filter by a top artist and filter the library
    // and genre catalog down to just that artist
    if (selectionContext['selectedTopArtist']) {
        // clicking on a top artist will set this value to be a specific artist
        // each top artist has a name, genres, and popularity
        var artist = selectionContext['selectedTopArtist'];
        songDataFilter = songDataFilter.filter(function(song) {
            return song['artists'].includes(artist['name']);
        });
        genreDataFilter = genreDataFilter.filter(function(genre) {
            return artist['genres'].includes(genre['name'].toLowerCase());
        });
    }
    
    // Filter on top track
    if (selectionContext['selectedTopTrack']) {
        var track = selectionContext['selectedTopTrack'];
        songDataFilter = songDataFilter.filter(function(song) {
            return song['name'] == track['name'];
        });
        genreDataFilter = genreDataFilter.filter(function(genre) {
            return track['genres'].includes(genre['name'].toLowerCase());
        });
    }

    // Filter the genre data for interactive legend
    genreDataFilter = genreDataFilter.filter(function(genre) {           
        return ((genre.isPop && selectionContext["plotPop"]) || 
                (genre.isRock && selectionContext["plotRock"]) || 
                (genre.isRap && selectionContext["plotRap"]) || 
                (genre.isElectronic && selectionContext["plotElectronic"]) ||
                (genre.isClassical && selectionContext["plotClassical"]) || 
                (genre.isMetal && selectionContext["plotMetal"]) || 
                (genre.isOther && selectionContext["plotOther"]));
    })

    // Filter the song data for interactive legend
    songDataFilter = songDataFilter.filter(function(song) {
        return ((song.isPop && selectionContext['plotPop']) || 
                (song.isRock && selectionContext['plotRock']) || 
                (song.isRap && selectionContext['plotRap']) || 
                (song.isElectronic && selectionContext['plotElectronic']) || 
                (song.isClassical && selectionContext['plotClassical']) || 
                (song.isMetal && selectionContext['plotMetal']) || 
                (song.isOther && selectionContext['plotOther']));
    });

    // Apply temporal filters from the time slider
    // TODO: Replace this with extent from time plot brush
    songDataFilter = songDataFilter.filter(function(song) {
        var lowerTimeLimit = selectionContext["timeRange"][0];
        var upperTimeLimit = selectionContext["timeRange"][1];
        var songYear = song['dateAdded'].getFullYear();
        return (songYear >= lowerTimeLimit) && (songYear <= upperTimeLimit);
    })

    // Count the genres in the filtered song data given the filtered genre data
    counts = countGenres(songDataFilter, genreDataFilter);
    genreCounts = counts[0];
    umbrellaCounts = counts[1];
    // Update the passed genre data with new user counts.
    genreDataFilter.forEach(function(genre) {
        key = genre['name'].toLowerCase();
        genreInLibrary = genreCounts[key];
        if (genreInLibrary) {
            genre.userCount = genreCounts[key]["userCount"];
        }
    });

    console.log("Filtered Songs:")
    console.log(songDataFilter);
    console.log("Filtered Genres:")
    console.log(genreDataFilter);
    // Update the plots using the **filtered** data
    updateSongPlot(songDataFilter, plots['song-chart']);
    updateGenrePlot(genreDataFilter, plots['genre-chart']);
    updateLinePlot(songDataFilter, genreDataFilter, plots['line-chart']);
}

// The x and y axis drop down menus
$("#x-attribute-select")
    .on("change", function(){ // This ensures that the visualization is updated whenever the dropdown selection changes, even if animation is paused and interval is not running
        updateAllPlots();
    })

$("#y-attribute-select")
    .on("change", function(){ // This ensures that the visualization is updated whenever the dropdown selection changes, even if animation is paused and interval is not running
        updateAllPlots()
    })

// A button to reset back to initial conditions
$("#toggle-button")
    .on("click", function(){
        selectionContext["flag"] = !selectionContext["flag"];
        count = 0;
        updateAllPlots();
    })

// Add event listener to the jQuery slider
$('#slider').dragslider({
        min: 2008,
        max: 2019,
        animate: true,
        range: true,
        rangeDrag: true,
        values: defaultTimeRange,
        slide: function(event, ui) {
            if (event) {
                // Set the time range to subset data on
                selectionContext["timeRange"] = ui.values;
                // After we make our selection, update the plots
                updateAllPlots();
            }
        }    
    });
    

// Create the umbrella genre selection legend
function makeGenreLegend() {
    var svg = plots['legend']['svg'];

    // Append the entire legend and shift it to the desired location
    var legend = svg.append("g")
                    .attr("id", "legend");

    // Loop through all the genre labels and add a legendRow group, shifting their positions so the rows down't overlap
    genre_labels.forEach(function(genre, i){
        var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");

        // Colored rectangles corresponding to each genre 
        var legendMarker = legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", umbrellaGenreToColor(genre))
            .attr("stroke", umbrellaGenreToColor(genre))
            
        // Text SVG corresponding to the genre in each row of the legend
        legendRow.append("text")
            .attr("x", -10)
            .attr("y", 10)
            .attr("text-anchor", "end") // Appends text to the left of the legend 
            .style("text-transform", "capitalize")
            .text(genre);

    // If user clicks on the legend text or SVG, toggle that genre
    legendRow.on('click', function(d) { 
            if (genre == "Pop") {
                selectionContext["plotPop"] ? selectionContext["plotPop"] = false : selectionContext["plotPop"] = true;
                plotGenre = selectionContext["plotPop"];
            } else if (genre == "Rock") {
                selectionContext["plotRock"] ? selectionContext["plotRock"] = false : selectionContext["plotRock"] = true;
                plotGenre = selectionContext["plotRock"];
            } else if (genre == "Rap") {
                selectionContext["plotRap"] ? selectionContext["plotRap"] = false : selectionContext["plotRap"] = true;
                plotGenre = selectionContext["plotRap"];
            } else if (genre == "Electronic") {
                selectionContext["plotElectronic"] ? selectionContext["plotElectronic"] = false : selectionContext["plotElectronic"] = true;
                plotGenre = selectionContext["plotElectronic"];
            } else if (genre == "Classical") {
                selectionContext["plotClassical"] ? selectionContext["plotClassical"] = false : selectionContext["plotClassical"] = true;
                plotGenre = selectionContext["plotClassical"];
            } else if (genre == "Metal") {
                selectionContext["plotMetal"] ? selectionContext["plotMetal"] = false : selectionContext["plotMetal"] = true;
                plotGenre = selectionContext["plotMetal"];
            } else if (genre == "Other") {
                selectionContext["plotOther"] ? selectionContext["plotOther"] = false : selectionContext["plotOther"] = true;
                plotGenre = selectionContext["plotOther"];
            }
            if (plotGenre) {
                legendRow.attr("fill","black");
                legendMarker.attr("fill",umbrellaGenreToColor(genre));
                legendMarker.attr("stroke",umbrellaGenreToColor(genre));
            } else {
                legendRow.attr("fill","black");
                legendMarker.attr("fill","white");
                legendMarker.attr("stroke","black");
            };

            updateAllPlots();
        });
    });
}

// Create the top artists list on the page
function makeTopArtistsList() {
    var top_artists_list = d3.select("#top-artists")
    top_artists_list.selectAll('li')
                    // Here we use artist data from the currently selected time scale
                    // either "short", "medium", or "long"
                    .data(topArtistsGlobal[selectionContext['timeScale']])
                    .enter()
                    .append("button")
                    .attr("type", "button")
                    .attr("class", "list-group-item")
                    .style("outline", "none")
                    .on("click", function(artist, i){
                        $that = $(this);
                        // Check if I am the active button
                        am_active = $that.hasClass('active');

                        // Remove all active labels from all buttons
                        $that.parent().parent().parent().find('button').removeClass('active');
                        // If I wasn't active before, make me active now
                        if (! am_active) {
                            $that.addClass('active');   
                            selectionContext['selectedTopArtist'] = artist;
                            // We can either select a top artist or a top track
                            selectionContext['selectedTopTrack'] = null;
                        } else {
                            // If I was active before and I've been selected again, that means we want to remove filtering by artist
                            selectionContext['selectedTopArtist'] = null;
                        }

                        updateAllPlots();
                    })
                    .html(function(artist, i) {
                        return artist['name']
                    });
}

// Create the top tracks list on the page
function makeTopTracksList() {
    var top_tracks_list = d3.select("#top-tracks")
    top_tracks_list.selectAll('button')
                    // Here we use artist data from the currently selected time scale
                    // either "short", "medium", or "long"
                    .data(topTracksGlobal[selectionContext['timeScale']])
                    .enter()
                    .append("button")
                    .attr("type", "button")
                    .attr("class", "list-group-item")
                    .style("outline", "none")
                    .on("click", function(track, i){
                        $that = $(this);
                        // Check if I'm actively selected
                        am_active = $that.hasClass('active');

                        // Remove all active labels from all buttons
                        $that.parent().parent().parent().find('button').removeClass('active');
    
                        // If I wasn't active before, make me active now
                        if (! am_active) {
                            $that.addClass('active');
                            selectionContext['selectedTopTrack'] = track;
                            // We can either select a top artist or a top track
                            selectionContext['selectedTopArtist'] = null;
                        } else {
                            // If I was active before and I've been selected again, that means we want to remove filtering by artist
                            selectionContext['selectedTopTrack'] = null;
                        }

                        updateAllPlots();
                    })
                    .html(function(track, i) {
                        return track['name']
                    });
}

// A function to perform on page load
// This should initialize all global variables and create the plots to plot on 
function loadPage() {
    // Set all umbrella genres to be plotted
    genre_labels.forEach(function(umbrella_genre) {
        // This evaluates out to e.g. selectionContext["plotMetal"] = true
        selectionContext["plot" + umbrella_genre] = true;
    })
    // Start by plotting all genres
    selectionContext['flag'] = false;
    // We have three time scales to work with for the top artists and track
    // here we start with the short time scale, but we can make an interaction that changes this option
    // TODO: makeTopArtistsList() needs to be updateTopArtistsList() and added to updateAllPlots() for this to work
    selectionContext['timeScale'] = 'short';
    // Set the default time range to subset the library over
    selectionContext["timeRange"] = defaultTimeRange;

    var margin = { left:100, right:200, top:50, bottom:100 };
    
    // Generate an svg and a set of x and y axes of length 500 and 500 using the above margin
    // the last two parameters are the xOrigin and yOrigin respectively
    // This fully specifies a "plot" that we can drawn on
    // The selector #song-plot-area should reference a div with id song-plot-area
    var plotSongs = generateAxes("#song-plot-area", 500, 500, margin, 0, 500);
    var svgSongs = plotSongs[0];
    var xAxisSongs = plotSongs[1];
    var yAxisSongs = plotSongs[2];
    plots['song-chart'] = {"svg" : svgSongs, "xAxis" : xAxisSongs, "yAxis" : yAxisSongs, "margin" : margin};
    
    // We do this for each of the plots we want to make
    var plotGenres = generateAxes("#genre-plot-area", 500, 500, margin, 0, 500);
    var svgGenres = plotGenres[0];
    var xAxisGenres = plotGenres[1];
    var yAxisGenres = plotGenres[2];
    plots['genre-chart'] = {"svg" : svgGenres, "xAxis" : xAxisGenres, "yAxis" : yAxisGenres, "margin" : margin};

    var plotLine = generateAxes("#line-plot-area", 500, 500, margin, 0, 500);
    var svgLine = plotLine[0];
    var xAxisLine = plotLine[1];
    var yAxisLine = plotLine[2];
    plots['line-chart'] = {"svg" : svgLine, "xAxis" : xAxisLine, "yAxis" : yAxisLine, "margin" : margin};

    // TODO: Replace this with a "generateSvg" function since we don't care about the axes
    var marginLegend = { left : 100, right : 0, top : 0, bottom : 0};
    var plotLegend = generateAxes("#legend", 100, 200, marginLegend, 0, 200);
    var svgLegend = plotLegend[0];
    plots['legend'] = {"svg" : svgLegend}
    
    // the makeX() functions will create the genre selection legend and the top artists / tracks
    // lists from the data that we've loaded
    makeGenreLegend();
    makeTopArtistsList();
    makeTopTracksList();
    // Plot everything with the default selections set above
    updateAllPlots();
}

// We create a set of promises for the data we need to generate the plots
// Only load the page if all of the data loads
Promise.all([loadSongData(), 
             loadGenreData(), 
             loadTopArtistsData(), 
             loadTopTracksData(), 
             loadRecentlyPlayedData(),
            ]).then(function(results) {
                 
    console.log("Finished loading Song and Genre Data!");

    songDataGlobal = results[0];
    genreDataGlobal = results[1];
    topArtistsGlobal = results[2];
    topTracksGlobal = results[3];
    recentlyPlayedGlobal = results[4];

    loadPage();
}, function(error) {
    console.log("Something went wrong fulfilling all of the start up promises.");
    console.log(error);
});
