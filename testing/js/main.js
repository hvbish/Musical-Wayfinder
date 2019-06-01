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
    .range([0.,axisLength]);


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
var attrToColor = d3.scaleOrdinal()
    .domain(['Rock','Pop','Rap','Metal','Classical','Electronic'])
    .range(['crimson', 'hotpink', 'royalblue', 'Black', 'gold', 'limegreen']);

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
// Load the data and plot it //
///////////////////////////////

// Load data file
d3.json("data/genre_data.json").then(function(data){
    // Do the following for every element in the json file
	data.forEach(function(d){
        d.isRock = d.genre.includes('Rock')
        d.isPop = d.genre.includes('Pop')
        d.isRap = d.genre.includes('Rap')
        d.isMetal = d.genre.includes('Metal')
        d.isClassical = d.genre.includes('Classical')
        d.isElectronic = d.genre.includes('Electro')	
	})

    console.log(data);

    // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
    update(data);


    // Start running the interval function which will update data and repeat every ## ms
    d3.interval(function(){
        update(data)
        flag = !flag;
    }, 1500);



})

///////////////////////////////
///////////////////////////////


///////////////////////////////
///// The Update Function /////
///////////////////////////////

// This is the function we will call whenever we want to update the data that is showing on the screen

function update(data) {
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
            return yOrigin - yAttrToPix(d.acousticness)
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
                return yOrigin - yAttrToPix(d.acousticness)
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



