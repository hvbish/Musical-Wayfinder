// Testing tutorial learnings on our Spotify data

/////////////////////////////////////
//////////  Chart Set-up  ///////////
/////////////////////////////////////

// Set margins and the plot origin/size
var margin = { left:100, right:200, top:50, bottom:100 };

var axisLength = 500;
var xOrigin = 0;
var yOrigin = axisLength;

var interval; // For interval function
var genreData;
var libraryData;
var flag = true; // Flag added to test switching between data
var time = 2010 // For slider with one value
var times = [2010, 2016] // For slider with a range


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

var song_container = d3.select("#spotify-song-container").attr('style', "display: none;").html(
    '<iframe src="https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'
);

var playlist_container = d3.select("#spotify-playlist-container").attr('style', "display: none;").html(
    '<iframe src="https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'
);

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


/*
//Log scale
var attrToPixLog = d3.scaleLog()
    .domain([0.,1.])
    .range([0.,axisLength])
    .base(10);
*/

// Time scale //

// This sets how the "date" string will be parsed and converted to JS Date object. (Should convert UTC time given in the string to local time but we may want to double-check this.)
var parseUTCTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ")
/*
var attrToPixTime = d3.scaleTime()
    .domain([new Date(2000,0,1),  // Use JS Date objects
        new Date(2001,0,1)])
    .range([0.,axisLength]);
*/

// Ordinal scale - no invert function available for this, since multiple values can be mapped to the same color. Can use this to assign colors to categories

// Define genre umbrella labels and corresponding colors to be used for the scale and the legend
var genre_labels = ['Pop',    'Rock',   'Rap',      'Electronic','Classical','Metal',   'Other']
var genre_colors = ['hotpink','firebrick','royalblue','limegreen', 'goldenrod',     'Black',   'grey']

var attrToColor = d3.scaleOrdinal()
    .domain(genre_labels)
    .range(genre_colors);







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
    .text("Genres")

plotTitle1 = svg1.append("text")
    .attr("x", (axisLength / 2))
    .attr("y", 0  - (margin.top / 5))
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .text("My Songs")

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
    .text("2010 - 2016");







///////////////////////////////
//////////  Legend  ///////////
///////////////////////////////


// ***** How can we plot cirlces in legend without having those circles get selected when we selectAll("circles") to plot data points? ******

var plotPop = true;
var plotRock = true;
var plotRap = true;
var plotElectronic = true;
var plotClassical = true;
var plotMetal = true;
var plotOther = true;
var plotGenre = true;

// Append the entire legend and shift it to the desired location
var legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + (axisLength + 130) + 
        "," + (axisLength - 125) + ")");

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
            console.log(genre);
            console.log(plotGenre);
            updateGenrePlot(genreData);
            updateSongPlot(libraryData);
            //updateSongPlot(libraryData);

        });

});





///////////////////////////////
/////////// Tooltip ///////////
///////////////////////////////

// We should make the tooltip color the genre name according to the umbrella genre
// Also fix triangle extender on tooltip - it is to the left of the box right now (not where your mouse is)

var nbsp = " &nbsp;" // Define a string containing the HTML non-breaking space 

var tipForGenre = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<span style='color:"+"Thistle"+";text-transform:capitalize'><h4>" + d.name + nbsp.repeat(0) + "</h4></span><br>";
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



// Load general genre data file
d3.json("data/data_genres_average_features.json").then(function(genredata){

    // Do the following for every element in the json file
	genredata.forEach(function(g){
        g.isRock = classifyUmbrellaGenre(g.name).isRock; 
        g.isPop = classifyUmbrellaGenre(g.name).isPop; 
        g.isRap = classifyUmbrellaGenre(g.name).isRap; 
        g.isMetal = classifyUmbrellaGenre(g.name).isMetal; 
        g.isClassical = classifyUmbrellaGenre(g.name).isClassical;
        g.isElectronic = classifyUmbrellaGenre(g.name).isElectronic;
        g.isOther = classifyUmbrellaGenre(g.name).isOther;
	})

    console.log(genredata);
    genreData = genredata.map(genredata => genredata); // .map allows you to do something for each element of the list. Not sure how to use it properly yet
    console.log(genreData);

/*    // Start running the interval function which will update data and repeat every ## ms
    d3.interval(function(){
        updateGenrePlot(genreData)
        flag = !flag;
    }, 1500);*/

    // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
    updateGenrePlot(genreData);
})






// Load user library data file (contains individual songs, date added to library, w/multiple genres associated with each)
d3.json("data/data_user_library.json").then(function(librarydata){

    // Do the following for every element in the json file
    librarydata.forEach(function(s){
        // Classify each song into umbrella genres
        s.isRock = s.isPop = s.isRap = s.isMetal = s.isClassical = s.isElectronic = s.isOther = Boolean(false) // Initialize all umbrella types to false before you loop through
        s.genres.forEach(function(g){ // Loop through all genres associated with this song and assign umbrella genres to the song
            if (classifyUmbrellaGenre(g).isRock) {s.isRock = Boolean(true)};
            if (classifyUmbrellaGenre(g).isPop) {s.isPop = Boolean(true)};
            if (classifyUmbrellaGenre(g).isRap) {s.isRap = Boolean(true)};
            if (classifyUmbrellaGenre(g).isMetal) {s.isMetal = Boolean(true)};
            if (classifyUmbrellaGenre(g).isClassical) {s.isClassical = Boolean(true)};
            if (classifyUmbrellaGenre(g).isElectronic) {s.isElectronic = Boolean(true)};
            if (classifyUmbrellaGenre(g).isOther) {s.isOther = Boolean(true)};
        // Take the date string and create a JS Date Object (date string format is "2019-05-27T04:34:26Z")
        s.dateAdded = parseUTCTime(s.date)
        })
    })

    console.log(librarydata);
    libraryData = librarydata.map(librarydata => librarydata); // .map allows you to do something for each element of the list
    console.log(libraryData);

    // Run the vis for the first time (otherwise the data won't appear until after the interval of time passes in the interval function above)
    updateSongPlot(libraryData);


    // Start running the interval function which will update data and repeat every ## ms
    // d3.interval(function(){
    //     updateGenrePlot(librarydata)
    //     flag = !flag;
    // }, 1500);
})


// The data loading takes some time, so if you try to print genreData right away it will be undefined. This prints the data after waiting some period of time.
setTimeout(function(){
    console.log('Out of loop');
    console.log(genreData);
    console.log(libraryData);
},300);



////////////////////////////////
/////// Play Button Test ///////
////////////////////////////////

// If you don't want to use a play button, just start the interval as soon as the data is loaded

// Define a test function to execute when the play button is pressed. This one does counting.
var count = 0;
function step() {
    console.log(count);
    count += count;
}

// Tells the play button what to do
$("#play-button")
.on("click", function(){
    var button = $(this);
    if (button.text() == "Play"){
        button.text("Pause");
        interval = setInterval(function(){
            updateGenrePlot(genreData);
            updateSongPlot(libraryData)
            flag = !flag;
            step();
        }, 1500);            
    }
    else {
        button.text("Play");
        clearInterval(interval);
    }
})


/////////////////////////////////
/////// Reset Button Test ///////
/////////////////////////////////

// A button to reset back to initial conditions
$("#reset-button")
    .on("click", function(){
        flag = true; // Reset the flag back to what it was at top of code
        count = 0;
        updateGenrePlot(genreData);
        updateSongPlot(libraryData);
    })


/////////////////////////////////
//// Dropdown Selection Test ////
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


$("#time-slider").slider({
    max: 2019,
    min: 2008,
    step: 1,
    range: true,
    values: [2010,2016],
    slide: function(event, ui){
        times = ui.values;
        updateSongPlot(libraryData);
    }
})

///////////////////////////////
///// The Update Function /////
///////////////////////////////

// This is the function we will call whenever we want to update the data that is showing on the screen

function updateGenrePlot(data) {

    // Filter data based on user selection //

    var selectedAttributeX = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    var selectedAttributeY = $("#y-attribute-select").val(); // This is the genre that has been selected by the user
    
    /*    var data = data.filter(function(d){           // Filter the data for dropdown
            if (selectedGenre == "all") { return true; }
            else if (selectedGenre == "pop") {
                return d.isPop;
            } else if (selectedGenre == "rock") {
                return d.isRock;
            } else if (selectedGenre == "rap") {
                return d.isRap;
            } else if (selectedGenre == "electronic") {
                return d.isElectronic;
            } else if (selectedGenre == "classical") {
                return d.isClassical;
            } else if (selectedGenre == "metal") {
                return d.isMetal;
            } else {
                return false;
            }
        })
    */

    // Filter the data for interactive legend
    var data = data.filter(function(d){           // Filter the data for dropdown
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) {
                return true;
            } else {
                return false;
            }
        })



    // Update the domain of your axes based on the new data you are using //
    //      Example: x.domain(data.map(function(d){ return d.month }));
    //      Example: y.domain([0, d3.max(data, function(d) { return d.revenue })])








    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points = svg.selectAll("circle") // Genre scatterplot
        .data(data, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.name;
        });

    // 2 -- EXIT old elements not present in new data.
    points.exit().remove();

    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(300) // Define a transition variable with 500ms duration so we can reuse it

    points
        .attr("r", 3)
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
            .attr("r", 3)
            .attr("fill-opacity", 0.5)
            .on("mouseover", tipForGenre.show)
            .on("mouseout", tipForGenre.hide)
            .on('click', function(d, i) { 
                console.log("click", d); 
                if (playlist_container.attr("style") === "display: none;") {
                    playlist_container.attr("style", "display: block;")
                }   
                playlist_container.html(
                    '<p><strong>genre_name</strong></p>\
                    <iframe src="https://open.spotify.com/embed/playlist/playlist_id" \
                    width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media">\
                    </iframe>'.replace('playlist_id', d.uri.split(":")[2]).replace("genre_name", d.name)
                );
                console.log(playlist_container.attr("style"));
                // rect.attr("display", "block");
            })
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





function updateSongPlot(data1) {

    // Filter data based on user selection //

    var selectedAttributeX = $("#x-attribute-select").val(); // This is the genre that has been selected by the user
    var selectedAttributeY = $("#y-attribute-select").val(); // This is the genre that has been selected by the user
    
    /*    var data = data.filter(function(d){           // Filter the data for dropdown
            if (selectedGenre == "all") { return true; }
            else if (selectedGenre == "pop") {
                return d.isPop;
            } else if (selectedGenre == "rock") {
                return d.isRock;
            } else if (selectedGenre == "rap") {
                return d.isRap;
            } else if (selectedGenre == "electronic") {
                return d.isElectronic;
            } else if (selectedGenre == "classical") {
                return d.isClassical;
            } else if (selectedGenre == "metal") {
                return d.isMetal;
            } else {
                return false;
            }
        })
    */

    // Filter the data for interactive legend & time slider
    var data1 = data1.filter(function(d){       
            if ((d.isPop && plotPop) || (d.isRock && plotRock) || (d.isRap && plotRap) || (d.isElectronic && plotElectronic) || (d.isClassical && plotClassical) || (d.isMetal && plotMetal) || (d.isOther && plotOther)) { // For interactive legend
                if ((d.dateAdded.getFullYear() >= times[0]) & (d.dateAdded.getFullYear()  <= times[1])) {
                    return true;
                } else {
                    return false;
                }
                
            } else {
                return false;
            }
        })




    // Update the domain of your axes based on the new data you are using //
    //      Example: x.domain(data.map(function(d){ return d.month }));
    //      Example: y.domain([0, d3.max(data, function(d) { return d.revenue })])



    // Plot the data, following the D3 update pattern //

    // 1 -- JOIN new data with old elements.
    var points1 = svg1.selectAll("circle") // Song scatterplot
        .data(data1, function(d){  // The function being passed to the data method returns a key which matches items between data arrays. So D3 knows that any data element with the same genre name is a match, rather than assuming the data array always contains all genres in the same order
            return d.uri;
        });


    // 2 -- EXIT old elements not present in new data.
    points1.exit().remove();


    // 3 -- UPDATE old elements present in new data.
    var update_trans = d3.transition().duration(300) // Define a transition variable with 500ms duration so we can reuse it

        points1
        .attr("r", 3)
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
            })


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
            .attr("r", 3)
            .attr("fill-opacity", 0.5)
            .on("mouseover", tipForSong.show)
            .on("mouseout", tipForSong.hide)
            .on('click', function(d, i) { 
                console.log("click", d); 
                if (song_container.attr("style") === "display: none;") {
                    song_container.attr("style", "display: block;")
                }   
                song_container.html(
                    '<iframe src="https://open.spotify.com/embed/track/track_id" width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'.replace('track_id', d.uri.split(":")[2])
                );
                console.log(song_container.attr("style"));
                // rect.attr("display", "block");
            })
            .merge(points1) // Anything after this merge command will apply to all elements in points - not just new ENTER elements but also old UPDATE elements. Helps reduce repetition in code if you want both to be updated in the same way
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



