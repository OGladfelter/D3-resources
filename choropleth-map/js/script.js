d3.csv("data/data.csv", function(data) {

    div = d3.select("#tooltip");
    headerMap = {
                    'population':'Population',
                    'GrowthRate':'Growth rate',
                    'drugOverdoseRate':'Drug overdoses',
                    'NaloxoneRate':'Naloxone administrations',
                    'suicideRate':'Suicides'
                }
    formatMap = {
        'population':'.3s',
        'GrowthRate':'.1f',
        'drugOverdoseRate':'.1f',
        'NaloxoneRate':'.1f',
        'suicideRate':'.2f',
    }
    detailsMap = {
        'population':'',
        'GrowthRate':'%',
        'drugOverdoseRate':' per 1,000',
        'NaloxoneRate':' per 1,000',
        'suicideRate':' per 1,000',
    }

    data.forEach(function(d) {
        d.population = +d.population;
        d.GrowthRate = +d.GrowthRate;
        d.drugOverdoseRate = +d.drugOverdoseRate;
        d.NaloxoneRate = +d.NaloxoneRate;
        d.suicideRate = +d.suicideRate;
     });

    drawLineplot(data);

    // filter to 2020 data
    data = data.filter(d => d.year == 2020);

    drawMap(data);
    drawScatterplot(data);
});

function mapTooltipHTML(d, columnName) {
    return "<b>" + d.properties.NAME + "</b><br>"
        + headerMap[columnName] + ": " + d3.format(formatMap[columnName])(d.properties[columnName]) + detailsMap[columnName];
}

function tooltipHTML(d) {
    const xColumn = document.getElementById("scatterplotXAxisUpdater").value;
    const yColumn = document.getElementById("scatterplotYAxisUpdater").value;
    return "<b>" + d.CTYNAME + "</b><br>"
        + headerMap[xColumn] + ": " + d3.format(formatMap[xColumn])(d[xColumn]) + detailsMap[xColumn] + "<br>"
        + headerMap[yColumn] + ": " + d3.format(formatMap[yColumn])(d[yColumn]) + detailsMap[yColumn];
}

function drawMap(data) {

    // add csv data to json data
    ohio.features.forEach(function(c) {
        const countyName = c.properties.NAME;
        const countyData = data.filter(d => d.CTYNAME == countyName);
        c.properties.population = countyData[0].population;
        c.properties.GrowthRate = countyData[0].GrowthRate;
        c.properties.drugOverdoseRate = countyData[0].drugOverdoseRate;
        c.properties.NaloxoneRate = countyData[0].NaloxoneRate;
        c.properties.suicideRate = countyData[0].suicideRate;
    });

    const mapContainer = document.getElementById("map");

    // set the dimensions and margins of the map
    if (screen.width < 600) { // user is on mobile
        var margin = {top: 10, right: 10, bottom: 10, left: 10};
    } else { // user is on computer or tablet
        var margin = {top: 10, right: 10, bottom: 10, left: 10};
    }
    width = mapContainer.offsetWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

    // Create SVG and append g element
    var svg = d3.select("#map")
        .append("svg")
        .attr("id", "mapSVG")
        .attr("width", width)
        .attr("height", height);
    var g = svg.append("g");

    // set projection for the map
    var projection = d3.geoAlbers()
        .scale(10000) // zoom in extent (1 is min)
        .rotate([82.695556,0]) // longitude
        .center([0, 40.304444]) // latitude
        .translate([width / 2, height / 2]);

    // D3 function converts longitude and latitude to (x, y) coords
    var geoPath = d3.geoPath().projection(projection);

    const colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.population; }))
        .range(["white", "maroon"]);

    // draw path of nyc map
    g.selectAll("path")
        .data( ohio.features )
        .enter()
        .append("path")
        .attr("id", function(d){return d.properties.NAME})
        .attr("class", "mapPath")
        .attr("d", geoPath)
        .style("fill", function (d) {
            return colorScale(d.properties.population);
        })
        .on("mouseover", function(d) { 
            div.transition()		
                .duration(200)		
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 5) + "px")		
                .style("top", (d3.event.pageY - 5) + "px");		
            div.html(mapTooltipHTML(d, "population"));
            d3.select(this).raise().style('stroke', 'cyan');
        })
        .on("mouseout", function() {
            div.transition()		
                .duration(200)		
                .style("opacity", 0);
            d3.select(this).style('stroke', 'black');
        })
        .on("click", function(d) {
            d3.selectAll("circle").style("fill","maroon"); // reset all dots to original color
            d3.select("#" + d.properties.NAME + "Dot").raise().style('fill', 'orange'); // highlight dot corresponding to this county
            lineplotHighlighter(d.properties.NAME);
            document.getElementById('countySelect').value = d.properties.NAME;
        });

        // add color scale
        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legendColor()
            //.shapeWidth(30)
            .cells(5)
            .orient('vertical')
            .scale(colorScale)
            .labelFormat(".2s")
            .title("Legend created with d3-legend by Susie Lu")
            .titleWidth(150);

        svg.select(".legendLinear").call(legendLinear);
}

function legendFormatter(columnName) {
    return d3.format(formatMap[columnName]);
}

function updateMap(columnName) {

    // Get the data again
    d3.csv("data/data.csv", function(data) {
        data.forEach(function(d) {
            d[columnName] = +d[columnName];
         });

        data = data.filter(d => d.year == 2020);

    	// new colorScale
    	const colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d[columnName]; }))
        .range(["white", "maroon"]);

        d3.select("#map").selectAll('path')
            .on("mouseover", function(d) { 
                div.transition()		
                    .duration(200)		
                    .style("opacity", 1)
                    .style("left", (d3.event.pageX + 5) + "px")		
                    .style("top", (d3.event.pageY - 5) + "px");		
                div.html(mapTooltipHTML(d, columnName));
                d3.select(this).raise().style('stroke', 'cyan');
            })
            .transition().duration(500)
            .style("fill", function (d) {
                return colorScale(d.properties[columnName]);
            });

        // new legend
        var legendLinear = d3.legendColor()
            //.shapeWidth(30)
            // .cells(5)
            // .orient('vertical')
            .scale(colorScale)
            .labelFormat(legendFormatter(columnName));

        d3.select(".legendLinear").call(legendLinear);
    });
}

function drawScatterplot(data) {
    const plotContainer = document.getElementById("scatterplot");

    // set the dimensions and margins of the map
    if (screen.width < 600){ // user is on mobile
        var margin = {top: 10, right: 30, bottom: 60, left: 60};
    } else{ // user is on computer or tablet
        var margin = {top: 10, right: 30, bottom: 80, left: 70};
    }
    var width = (plotContainer.offsetWidth * .9) - margin.left - margin.right,
    height = (window.innerHeight * .75) - margin.top - margin.bottom,
    padding = 10;

    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot")
        .append("svg")
        .attr("id", "scatterplotSVG")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.GrowthRate; }))
        .range([ padding, width - padding ]);
    svg.append("g")
        .attr("id", "scatterplot_x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(3).tickSizeOuter(0).tickFormat(d => d + "%"));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.drugOverdoseRate; }))
        .range([ height - padding, padding]);
    svg.append("g").attr("id", "scatterplot_y_axis").call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));

    // sizing scale by population
    var popScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.population; }))
        .range([ 5, 15]);

    // Add dots
    svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.GrowthRate); } )
        .attr("cy", function (d) { return y(d.drugOverdoseRate); } )
        .attr("r", function (d) { return popScale(d.population); } )
        .attr("id", function (d) { return d.CTYNAME + "Dot"})
        .style("fill", "maroon")
        .style("stroke", "white")
        .on("mouseover", function(d) { 
            div.transition()		
                .duration(200)		
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 5) + "px")		
                .style("top", (d3.event.pageY - 5) + "px");		
            div.html(tooltipHTML(d));
            d3.select(this).raise().style('stroke', 'cyan');
        })
        .on("mouseout", function() {
            div.transition()		
                .duration(200)		
                .style("opacity", 0);
            d3.select(this).style('stroke', 'white');
        })

    // axis labels
    svg.append("text")             
      .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 40) + ")")
      .text("Growth rate")
      .attr("class", "text")
      .attr("id", "xAxisLabel");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .text("Drug overdose rate")
        .attr("class", "text")
        .attr("id", "yAxisLabel");

    function axisFormatter(columnName) {
        if (columnName == 'GrowthRate') {
            return d => d + "%";
        }
        else if (columnName == 'population') {
            return d3.format(".0s")
        }
        else {
            return d => d;
        }
    }

    function updateScatterplotAxis(data, columnName, axis, axisTitle) {
            
        // new axis
        var newAxisScale = d3.scaleLinear().domain(d3.extent(data, function(d) { return d[columnName]; }));
        if (axis == 'x') {
            newAxisScale.range([ padding, width - padding ]);
            d3.select("#scatterplotSVG").select("#scatterplot_x_axis").call(d3.axisBottom(newAxisScale).ticks(3).tickSizeOuter(0).tickFormat(axisFormatter(columnName)));
        } else if (axis == 'y') {
            newAxisScale.range([ height - padding, padding]);
            d3.select("#scatterplotSVG").select("#scatterplot_y_axis").call(d3.axisLeft(newAxisScale).ticks(3).tickSizeOuter(0).tickFormat(axisFormatter(columnName)));
        }

        // move the dots
        d3.select("#scatterplot").selectAll('circle')
            .transition().duration(500)
            .attr("c" + axis, function (d) { return newAxisScale(d[columnName]); } );

        // update axis title
        document.getElementById(axis + "AxisLabel").innerHTML = axisTitle[0].toUpperCase() + axisTitle.substring(1);
    }

    // add listeners to the selects
    const xAxisUpdater = document.getElementById("scatterplotXAxisUpdater");
    const yAxisUpdater = document.getElementById("scatterplotYAxisUpdater");
    const rUpdater = document.getElementById("scatterplotRadiusUpdater");

    xAxisUpdater.addEventListener("change", function() {
        updateScatterplotAxis(data, xAxisUpdater.value, "x", xAxisUpdater.options[xAxisUpdater.selectedIndex].text);
    });
    yAxisUpdater.addEventListener("change", function() {
        updateScatterplotAxis(data, yAxisUpdater.value, "y", yAxisUpdater.options[yAxisUpdater.selectedIndex].text);
    });
    rUpdater.addEventListener("change", function() {
        scatterplotRadiusUpdater(data, rUpdater.value);
    });
}

function scatterplotRadiusUpdater(data, columnName) {

    if (columnName == 'nothing') {
        d3.select("#scatterplot").selectAll('circle')
            .transition().duration(500)
            .attr("r", 7)
    } else {
       // new scale
        var radiusScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d[columnName]; }))
            .range([ 5, 15]);

        // update the dots
        d3.select("#scatterplot").selectAll('circle')
            .transition().duration(500)
            .attr("r", function (d) { return radiusScale(d[columnName]); } );
    }
}

function drawLineplot(data) {
    const plotContainer = document.getElementById("lineplot");

    // set the dimensions and margins of the map
    if (screen.width < 600){ // user is on mobile
        var margin = {top: 10, right: 30, bottom: 60, left: 60};
    } else{ // user is on computer or tablet
        var margin = {top: 10, right: 30, bottom: 80, left: 70};
    }
    var width = (plotContainer.offsetWidth * .9) - margin.left - margin.right,
    height = (window.innerHeight * .75) - margin.top - margin.bottom,
    padding = 10;

    // append the svg object to the body of the page
    var svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.CTYNAME;})
        .entries(data);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ padding, width - padding ]);
    svg.append("g")
        .attr("id", "lineplotXAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(d3.map(data, function(d){return d.year;}).keys()).tickSizeOuter(0).tickFormat(d => d));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.drugOverdoseRate; })])
        .range([ height - padding, padding ]);
    svg.append("g")
        .attr("id", "lineplotYAxis")
        .call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));

    // Draw the line
    svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.key + "Line"})
        .attr("class", "line")
        .attr("d", function(d){
        return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.drugOverdoseRate); })
            (d.values)
        })
        .on("mouseover", function(d) {
            d3.select(this).raise().style("stroke", "cyan").style("stroke-opacity", 1);
            div.transition()		
                .duration(200)		
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 5) + "px")		
                .style("top", (d3.event.pageY - 5) + "px");	
            div.html(d.key);
        })
        .on("mouseout", function() {
            div.transition()		
                .duration(200)		
                .style("opacity", 0);
            d3.select(this).style("stroke", "maroon").style("stroke-opacity", 0.5);
        });

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .text("Drug overdose rate")
        .attr("class", "text")
        .attr("id", "lineplotYAxisLabel");

    // add options to line highlighter select
    const countySelect = document.getElementById("countySelect");
    sumstat.forEach(function(d) {
        var opt = document.createElement('option');
        opt.value = d.key;
        opt.innerHTML = d.key;
        countySelect.appendChild(opt);
    });

    // event listener for updating variable
    const lineplotUpdater = document.getElementById("lineplotUpdater");
    lineplotUpdater.addEventListener("change", function() {
        updateLineplot(data, lineplotUpdater.value, lineplotUpdater.options[lineplotUpdater.selectedIndex].text);
    });
}

function updateLineplot(data, columnName, axisTitle) {
    document.getElementById('countySelect').value = "-"; // turn off highlighting
    lineplotHighlighter("-");
    data = data.filter(d => d[columnName] != 0);

    // set the dimensions and margins of the map
    if (screen.width < 600){ // user is on mobile
        var margin = {top: 10, right: 30, bottom: 60, left: 60};
    } else{ // user is on computer or tablet
        var margin = {top: 10, right: 30, bottom: 80, left: 70};
    }
    var width = (document.getElementById("lineplot").offsetWidth * .9) - margin.left - margin.right,
    height = (window.innerHeight * .75) - margin.top - margin.bottom,
    padding = 10;

    function axisFormatter(columnName) {
        if (columnName == 'GrowthRate') {
            return d => d + "%";
        }
        else if (columnName == 'population') {
            return d3.format(".0s")
        }
        else {
            return d => d;
        }
    }

    // new axes
    var newXAxis = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ padding, width - padding ]);
    var newYAxis = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d[columnName]; }))
        .range([ height - padding, padding ]);
    // call them
    d3.select("#lineplotXAxis").call(d3.axisBottom(newXAxis).tickValues(d3.map(data, function(d){return d.year;}).keys()).tickSizeOuter(0).tickFormat(d => d));
    d3.select("#lineplotYAxis").call(d3.axisLeft(newYAxis).ticks(3).tickSizeOuter(0).tickFormat(axisFormatter(columnName)));

    // group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.CTYNAME;})
        .entries(data);

    // move the lines
    // Create a update selection: bind to the new data
    d3.selectAll(".line")
        .data(sumstat)
        .attr("id", function(d) { return d.key + "Line"})
        .transition()
        .duration(1000)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return newXAxis(d.year); })
                .y(function(d) { return newYAxis(+d[columnName]); })
                (d.values)
            });

    // update axis title
    document.getElementById("lineplotYAxisLabel").innerHTML = axisTitle[0].toUpperCase() + axisTitle.substring(1);
}

function lineplotHighlighter(countyName) {

    if (countyName=='-') {
        d3.selectAll(".line").style("stroke", "maroon").style("stroke-opacity", 0.5).on("mouseover", function(d) {
            d3.select(this).raise().style("stroke", "cyan").style("stroke-opacity", 1);
            div.transition()		
                .duration(200)		
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 5) + "px")		
                .style("top", (d3.event.pageY - 5) + "px");	
            div.html(d.key);
        })
        .on("mouseout", function() {
            div.transition()		
                .duration(200)		
                .style("opacity", 0);
            d3.select(this).style("stroke", "maroon").style("stroke-opacity", 0.5);
        });
        return;
    }

    d3.selectAll(".line").style("stroke", "gray").style("stroke-opacity", 0.1).on("mouseout", function() {
        d3.select(this).style("stroke", "gray").style("stroke-opacity", 0.1);
        div.transition()		
            .duration(200)		
            .style("opacity", 0);
    });
    d3.select("#" + countyName + "Line").raise().style("stroke", "maroon").style("stroke-opacity", 1).style("stroke-width","3px").on("mouseover", function(d) {
        d3.select(this).raise().style("stroke", "cyan");
        div.transition()		
            .duration(200)		
            .style("opacity", 1)
            .style("left", (d3.event.pageX + 5) + "px")		
            .style("top", (d3.event.pageY - 5) + "px");	
        div.html(d.key);
    })
    .on("mouseout", function() {
        div.transition()		
            .duration(200)		
            .style("opacity", 0);
        d3.select(this).style("stroke", "maroon");
    });
}