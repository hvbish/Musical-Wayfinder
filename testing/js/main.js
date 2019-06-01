// Testing tutorial learnings on our Spotify data

/////////////////////////////////////
//////////  Chart Set-up  ///////////
/////////////////////////////////////

// Set margins and the plot origin/size
var margin = { left:200, right:200, top:200, bottom:200 };

var axisLength = 600
var xOrigin = 0
var yOrigin = axisLength

var flag = true; // Flag added to test switching between data




// Define the container for the plot and adjust its location to account for margins
var svg = d3.select("#chart-area")
    .append("svg")
        .attr("width", axisLength + margin.left + margin.right)
        .attr("height", axisLength + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
        + ", " + margin.top + ")");


// Save axes to variables, which we can call later whenever we update their attributes (if we don't do this we'll end up redrawing new axis object on top of the old one)
var xAxisGroup = svg.append("g") // The variable xAxisGroup will refer to a group ("g") of elements getting appended to the svg container, and will allow us to perform actions on everything in that group at once (in this case, all the x axes on the page?)
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + (axisLength) + ")")


var yAxisGroup = svg.append("g")
    .attr("class", "y-axis");

///////////////////////////////
///////////////////////////////


///////////////////////////////
//////////  Scales  ///////////
///////////////////////////////

// Linear scales //

// X Scale
var xAttrToPix = d3.scaleLinear() // This can apply for any of the attributes that range from 0 to 1
    .domain([0.,1.])
    .range([0.,axisLength]);

// Y Scale
var yAttrToPix = d3.scaleLinear() // We'll keep a separate attribute scale for the Y Axis, since we may want to update X and Y Axes differently
    .domain([0.,1.])
    .range([axisLength,0.]);


/*
//Log scale
var attrToPixLog = d3.scaleLog()
    .domain([0.,1.])
    .range([0.,axisLength])
    .base(10);
*/
/*
//Time scale
var attrToPixTime = d3.scaleTime()
    .domain([new Date(2000,0,1),  // Use JS Date objects
        new Date(2001,0,1)])
    .range([0.,axisLength]);
*/
// Ordinal scale - no invert function available for this, since multiple values can be mapped to the same color. Can use this to assign colors to categories

// Define genre umbrella labels and corresponding colors to be used for the scale and the legend
var genre_labels = ['Pop',    'Rock',   'Rap',      'Electronic','Classical','Metal']
var genre_colors = ['hotpink','crimson','royalblue','limegreen', 'gold',     'Black']

var attrToColor = d3.scaleOrdinal()
    .domain(genre_labels)
    .range(genre_colors);

///////////////////////////////
///////////////////////////////


///////////////////////////////
//////////  Labels  ///////////
///////////////////////////////

// X Axis Label
xAxisLabel = svg.append("text")
    .attr("class", "x axis-label")
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

///////////////////////////////
///////////////////////////////


///////////////////////////////
//////////  Legend  ///////////
///////////////////////////////


// ***** How can we plot cirlces in legend without having those circles get selected when we selectAll("circles") to plot data points? ******

// Append the entire legend and shift it to the desired location
var legend = svg.append("g")
    .attr("transform", "translate(" + (axisLength + 130) + 
        "," + (axisLength - 125) + ")");

// Loop through all the genre labels and add a legendRow group, shifting their positions so the rows down't overlap
genre_labels.forEach(function(genre, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 20) + ")");

    // Colored rectangles corresponding to each genre 
    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", attrToColor(genre));

    // Text SVG corresponding to the genre in each row of the legend
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end") // Appends text to the left of the legend 
        .style("text-transform", "capitalize")
        .text(genre);
});


///////////////////////////////
///////////////////////////////



///////////////////////////////
// Load the data and plot it //
///////////////////////////////

// Function to classify umbrella genre categories
// Add function to classify umbrella genre categories here?
function classifyUmbrellaGenre(genre) {
    isRock = genre.toLowerCase().includes('rock');
    isPop = genre.toLowerCase().includes('pop');
    isRap = genre.toLowerCase().includes('rap');
    isMetal = genre.toLowerCase().includes('metal');
    isClassical = genre.toLowerCase().includes('classical');
    isElectronic = genre.toLowerCase().includes('tro');
    return {isRock, isPop, isRap, isMetal, isClassical, isElectronic};
}

// Load general genre data file
d3.json("data/genre_data.json").then(function(genredata){
    // Do the following for every element in the json file
	genredata.forEach(function(g){
        g.isRock = classifyUmbrellaGenre(g.genre).isRock; 
        g.isPop = classifyUmbrellaGenre(g.genre).isPop; 
        g.isRap = classifyUmbrellaGenre(g.genre).isRap; 
        g.isMetal = classifyUmbrellaGenre(g.genre).isMetal; 
        g.isClassical = classifyUmbrellaGenre(g.genre).isClassical;
        g.isElectronic = classifyUmbrellaGenre(g.genre).isElectronic;
	})

    console.log(genredata);

    // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
    updateGenrePlot(genredata);


    // Start running the interval function which will update data and repeat every ## ms
    d3.interval(function(){
        updateGenrePlot(genredata)
        flag = !flag;
    }, 1500);
})

// Load user library data file (contains individual songs, date added to library, w/multiple genres associated with each)
d3.json("data/data_user_library.json").then(function(librarydata){
    // Do the following for every element in the json file
    librarydata.forEach(function(s){
        s.isRock = s.isPop = s.isRap = s.isMetal = s.isClassical = s.isElectronic = Boolean(false) // Initialize all umbrella types to false before you loop through
        s.genres.forEach(function(g){ // Loop through all genres associated with this song and assign umbrella genres to the song
            if (classifyUmbrellaGenre(g).isRock) {s.isRock = Boolean(true)};
            if (classifyUmbrellaGenre(g).isPop) {s.isPop = Boolean(true)};
            if (classifyUmbrellaGenre(g).isRap) {s.isRap = Boolean(true)};
            if (classifyUmbrellaGenre(g).isMetal) {s.isMetal = Boolean(true)};
            if (classifyUmbrellaGenre(g).isClassical) {s.isClassical = Boolean(true)};
            if (classifyUmbrellaGenre(g).isElectronic) {s.isElectronic = Boolean(true)};
        })
    })

    console.log(librarydata);

    // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
    // updateGenrePlot(librarydata);


    // Start running the interval function which will update data and repeat every ## ms
    // d3.interval(function(){
    //     updateGenrePlot(librarydata)
    //     flag = !flag;
    // }, 1500);
})


///////////////////////////////
///////////////////////////////


///////////////////////////////
///// The Update Function /////
///////////////////////////////

// This is the function we will call whenever we want to update the data that is showing on the screen

function updateGenrePlot(data) {
    var value = flag ? "energy" : "danceability" // Ternary operator: is flag true? if so, value = "energy", otherwise value = "danceability"



    // Update the domain of your axes based on the new data you are using //
    //      Example: x.domain(data.map(function(d){ return d.month }));
    //      Example: y.domain([0, d3.max(data, function(d) { return d.revenue })])





    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points = svg.selectAll("circle")
        .data(data, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.genre;
        });

    // 2 -- EXIT old elements not present in new data.
    points.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(300) // Define a transition variable with 500ms duration so we can reuse it

    points
        .attr("cy", function(d, i){
            return yAttrToPix(d.acousticness)
        })
        .attr("r", 3)
        .transition(update_trans)
            .attr("cx", function(d, i){
                return xOrigin + xAttrToPix(d[value])
            });

    // 4 -- ENTER new elements present in new data.
    points.enter()
        .append("circle")
            .attr("cx", function(d, i){
                return xOrigin + xAttrToPix(d[value])
            })
            .attr("cy", function(d, i){
                return yAttrToPix(d.acousticness)
            })
            .attr("r", 3)
            .merge(points) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements. Helps reduce repetition in code if you want both to be updated in the same way
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
                });

    // Draw Axes //
    
    // X Axis
    var xAxisCall = d3.axisBottom(xAttrToPix);
    xAxisGroup.call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)");

    // Y Axis
    var yAxisCall = d3.axisLeft(yAttrToPix);
    yAxisGroup.call(yAxisCall);

    // X Axis Label
    xAxisLabel.attr("class", "x axis-label")
        .transition(d3.transition().duration(300)) // Here I am chaining multiple transitions together so that the axis label doesn't update until after the points have finished their transition
        .transition(update_trans)
            .text(value.charAt(0).toUpperCase() + value.slice(1)); // Capitalize first character in value string and use it as the axis label

    // Y Axis Label
    yAxisLabel.attr("class", "y axis-label")
        .text("Acousticness");






}

///////////////////////////////
///////////////////////////////


//////////// INTERVALS ////////////

// Define an interval function that performs some action every ## ms (it will also wait ## ms to start the first loop)
//      d3.interval(function(){
//         console.log("Hello World");
//      }, 1000);

// You can also set a loop and stop it later in your code, like so:
// Start loop running
var myInterval = setInterval(function(){
    console.log("Hello World");
}, 500)
// Stop the loop
clearInterval(myInterval)



