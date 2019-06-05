// This function should draw a scatter plot given some data and an svg to draw onto
// This function should be passed whatever is needed to draw a scatter plot, like the data, svg, axes, etc.
// Example function arguments are shown, like the attribute to use for getting the x-value, y-value, and size along with their
// pixel scaling functions.
// pointOnFunctions is included so we can define custom event listeners for all points in each plot
// it might look like a dictionary:
// {
//   "click" : my_click_function,
//   "mouseover" : my_mouseover_function,
//   "mouseout" : my_mouseout_function
// }
// where each my_x_function speciies what happens when 'x' happens. For example "tipForGenre.show" is a function to be performed on mouseover
// so the dictionary would look like { "mouseover" : tipForGenre.show }
function drawScatterPlot(data, svg, xAttr, yAttr, sizeAttr, xScale, yScale, sizeScale, pointOnFunctions) {
    // Everything inside here is just as an example and can be changed wildly

    var points = svg.selectAll("circle") // Genre scatterplot
        .data(data, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d["name"];
        });

    points.enter()
            .append("circle")
            .attr("cx", function(d, i){
                return xOrigin + xScale(d[xAttr]);
            })
            .attr("cy", function(d, i){
                return yScale(d[yAttr]);
            })
            //.attr("r", 3)
            .attr("r", function(d) {
                return sizeScale(d[sizeAttr]);
            });
    // Add event listeners for various events
    if (pointOnFunctions) {
        for (var eventName in pointOnFunctions) {
            points = points.on(eventName, pointOnFunctions[eventName]);
        }
    }

    // Everything below this could be generalized and removed hopefully
    // But it's here because this 

    // X Axis
    var xAxisCall;
    xAxisCall = d3.axisBottom(xScale);

    xAxisGroup.call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)");

    // Y Axis
    var yAxisCall;
    yAxisCall = d3.axisBottom(yScale);
    yAxisGroup.call(yAxisCall);

    // X Axis Label
    xAxisLabel.attr("class", "x-axis-label")
        // .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        // .transition(update_trans)
            .text(xAttr.charAt(0).toUpperCase() + xAttr.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Y Axis Label
    yAxisLabel.attr("class", "y-axis-label")
        // .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        // .transition(update_trans)
            .text(yAttr.charAt(0).toUpperCase() + yAttr.slice(1)); // Capitalize first character in value string and use it as the axis label
}


// This function should draw a line plot
function drawLinePlot(data, svg, ...) {
    
}

// This function should draw the songs plot
// It takes in as data a list of songs
function drawSongPlot(songData) {
    // Do stuff with song data and define axes etc.
    drawScatterPlot(songData, ...);
}

// This function should draw the genre plot
// It takes in as data a list of genres
function drawGenrePlot(genreData) {
    drawScatterPlot(genreData, ...);
}

function drawTimelinePlot(timelineData) {
    drawLinePlot(timelineData, ...);
}

//
// This function should be called on page load to perform initialization
//
function pageLoad() {
    // initialize all of my global variables and draw initial plots

}

// An update function to be called whenever an interaction on the screen occurs
// You can imagine making one of these update functions for each of our interactive elements that 
// alters the data in a different way and updates only certain plots instead of redrawing all of them
function update() {
    // do something to songData, genreData, and timelineData based on what has been updated
    songData = 
    genreData = 
    timelineData = 

    drawSongPlot(songData);
    drawGenrePlot(genreData);
    drawLinePlot(timelineData);
}
