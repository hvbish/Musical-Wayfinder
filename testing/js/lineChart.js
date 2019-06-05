
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
                genre_counts[genre]["userCount"] = 0
            }

            // Compute the numbre of umbrella genres that each song lies in
            var num_umbrella_genres = 0;
            genre_labels.forEach(function(umbrella_genre) {
                if (song["is" + umbrella_genre]) {
                    num_umbrella_genres += 1;
                }
            });
            var umbrella_weight = 1. / num_umbrella_genres;
            umbrella_weight = weight;
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

    // Update the passed genre data with new user counts.
    genreData.forEach(function(genre) {
        key = genre['genre'].toLowerCase();
        genre_in_library = genre_counts[key];
        if (genre_in_library) {
            genre.userCount = genre_counts[key]["userCount"];
        }
    });

    return [genre_counts, umbrella_genre_counts];
}

function drawLinePlot(songData, svg, xAxis, yAxis) {
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
    var bin_data = d3.histogram()
                     .value(function(d) {
                         return Date.parse(d['dateAdded']);
                     })
                     .domain(xScale.domain())
                     .thresholds(xScale.ticks(30));

    var binned_data = bin_data(filtered_data);
    binned_data.forEach(function(bin) {
        bin['xMid'] = new Date((Date.parse(bin['x0']) + Date.parse(bin['x1'])) / 2);
        bin['x0'] = new Date(bin['x0']);
        bin['x1'] = new Date(bin['x1']);
    })

    var max_height = d3.max(binned_data, function(d) { 
                            return d['length']; 
                        });
    
    // Create a new scale from 0 to the maximum height
    var yScale = d3.scaleLinear()
                   .domain([0., max_height])
                   .range([yAxis["length"], 0]);

    // Plot the axes using the new scales
    xAxis["group"].call(xAxis["call"].scale(xScale));
    yAxis["group"].call(yAxis["call"].scale(yScale));
               
    // Define a function that computes the path that a line should take
    // to connect the data points
    var data_to_line = d3.line()
                         .x(function(d, i) {
                             return xScale(d['xMid']);
                         })
                         .y(function(d, i) {
                             var bin_counts = d.length;
                            return yScale(bin_counts);
                         });

    var path = data_to_line(binned_data);
    // Draw the actual line by creating a path on an SVG
    svg.append("path")
        .attr("class", "line")
        .attr("d", path)
        // Remove fill and show the line in black
        .style("fill", "none")
        .style("stroke", "#000000");
}

function drawStackedLinePlot(songData, svg, xAxis, yAxis) {
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
    var num_bins = 100;
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

        counts = countGenres(bin, genreDataGlobal);
        genre_counts = counts[0];
        umbrella_genre_counts = counts[1];

        console.log(umbrella_genre_counts);

        genre_labels.forEach(function(umbrella_genre) {
            var last_index = genre_bin_data.length - 1;
            genre_bin_data[last_index][umbrella_genre] = umbrella_genre_counts[umbrella_genre]["userCount"];
        });
    });
    console.log(genre_bin_data);

    // Make a stack that will convert the above data into an array of series
    // where there will be a series for each key given
    var stack = d3.stack()
                  .keys(genre_labels)
    // color palette for genres
    var color = d3.scaleOrdinal()
                   .domain(genre_labels)
                   .range(d3.schemeCategory10);

    // get the series from stacking the data
    var series = stack(genre_bin_data);

    console.log(series);

    // Make a function to compute the area that a datapoint
    // should enclose
    var area = d3.area()
                 .x(function(d) {
                    return xScale(d['data']['date']);
                 })
                 .y0(function(d) {
                     return yScale(d[0]);
                 })
                 .y1(function(d) {
                     return yScale(d[1]);
                 })

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

    // Plot the axes using the new scales
    xAxis["group"].call(xAxis["call"].scale(xScale));
    yAxis["group"].call(yAxis["call"].scale(yScale));

    svg.selectAll("layers")
        .data(series)
        .enter()
        .append("path")
            .attr("class", function(d, i) {
                return "line " + genre_labels[i];
            })
            .attr("d", area)
            // Remove fill and show the line in black
            .style("fill", function(d, i) {
                console.log(genre_labels[i] + color(genre_labels[i]));
                return color(genre_labels[i]);
            })
            // .style("stroke", "#000000");
    
    /////////////////////
    // HIGHLIGHT GROUP //
    /////////////////////

    // What to do when one group is hovered
    var highlight = function(d) {
        console.log(d)
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
        .attr("x", 400)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(genre_labels)
      .enter()
      .append("text")
        .attr("x", 400 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

}

// Create a plot to draw things
// selector should be e.g. "#line-chart" to select an svg on the page with id line-chart
// this returns the selected svg and creates a dictionary representing each axis
function generateAxes(selector, xAxisLength, yAxisLength, margin) {
    var svg = d3.select(selector)
                .attr("width", xAxisLength + margin.left + margin.right)
                .attr("height", yAxisLength + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // Axis generators
    var xAxisCallLine = d3.axisBottom()
    var yAxisCallLine = d3.axisLeft()

    // Axis Groups
    var xAxisGroupLine = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + xAxisLength + ")");
    var yAxisGroupLine = svg.append("g")
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

    var xAxis = {
            "length" : xAxisLength,
            "group" : xAxisGroupLine,
            "call" : xAxisCallLine
    };

    var yAxis = {
        "length" : yAxisLength,
        "group" : yAxisGroupLine,
        "call" : yAxisCallLine
    };

    return [svg, xAxis, yAxis];
}

// Once all of the loading data promises have been resolved, then start making the page.
Promise.all([loadSongData(), loadGenreData()]).then(function(results) {
    console.log("Finished loading Song and Genre Data!");
    countGenres(songDataGlobal, genreDataGlobal);
    // Set margins and the plot origin/size
    var margin = { left:100, right:200, top:50, bottom:100 };

    var plot = generateAxes("#line-chart", 500, 500, margin);
    var svg = plot[0];
    var xAxis = plot[1];
    var yAxis = plot[2];
    drawLinePlot(songDataGlobal, svg, xAxis, yAxis);

    plot = generateAxes("#stacked-chart", 500, 500, margin);
    svg = plot[0];
    xAxis = plot[1];
    yAxis = plot[2];
    drawStackedLinePlot(songDataGlobal, svg, xAxis, yAxis);

}, function(error) {
    console.log("Something went wrong fulfilling all of the start up promises.");
});
