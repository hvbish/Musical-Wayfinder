// Testing tutorial learnings on our Spotify data


// Set margins and the plot origin/size
var margin = { left:200, right:200, top:200, bottom:200 };

var axisLength = 600
var xOrigin = 0
var yOrigin = axisLength



//////////  Scales  ///////////

// Linear scale
var attrToPix = d3.scaleLinear()
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

// Ordinal scale - no invert function available for this, since multiple values can be mapped to the same color
// Can use this to assign colors to categories
var attrToColor = d3.scaleOrdinal()
    .domain(['Rock','Pop','Rap','Metal','Classical','Electronic'])
    .range(['crimson', 'hotpink', 'royalblue', 'Black', 'gold', 'limegreen']);


///////////////////////////////
// Load the data and plot it //
///////////////////////////////
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

    // Define the container for the plot and adjust its location to account for margins
	var svg = d3.select("#chart-area")
        .append("svg")
            .attr("width", axisLength + margin.left + margin.right)
            .attr("height", axisLength + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left 
            + ", " + margin.top + ")");

    // Plot the data
    var points = svg.selectAll("circle")
        .data(data);

    points.enter()
        .append("circle")
            .attr("cx", function(d, i){
                return xOrigin + attrToPix(d.energy)
            })
            .attr("cy", function(d, i){
                return yOrigin - attrToPix(d.acousticness)
            })
            .attr("r", 3)
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

    //////////  Draw Axes  ///////////
    // X-Axis
    var xAxisCall = d3.axisBottom(attrToPix);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (axisLength) + ")")
        .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(0)");
    // Y-Axis
    var yAxisCall = d3.axisLeft(attrToPix);
    svg.append("g")
        .attr("class", "y-axis")
        //.attr("transform", "translate(0, " + (margin.top) + ")")
        .call(yAxisCall);

    // X Label
    svg.append("text")
        .attr("class", "x axis-label")
        .attr("x", xOrigin + (axisLength / 2))
        .attr("y", yOrigin + 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Energy");

    // Y Label
    svg.append("text")
        .attr("class", "y axis-label")
        .attr("x", xOrigin - (axisLength / 2))
        .attr("y", yOrigin - axisLength - 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Acousticness");


})



