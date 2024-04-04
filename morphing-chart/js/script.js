const primaryColorLight = 'hsl(197, 97%, 66%)'; // low end of map, bars, and younger ages in age analysis
const primaryColorDark = '#0006b8'; // high end of map, bars, and older ages in age analysis
const primaryColorMedium = '#2A6ADA'; 
const mobile = window.innerWidth < 600;

function clevelandDotPlot() {

    const margin = {top: 10, right: 30, bottom: 50, left: 120};
    let box = document.getElementById('chart');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parse the Data
    d3.csv("data/primaryCandidates.csv").then( function(data) {

        data.forEach(function(d) {
            d.daysUntilConventionAnnounced = +d.daysUntilConventionAnnounced;
            d.daysUntilConventionSuspended = +d.daysUntilConventionSuspended;
            d.campaignLength = +d.campaignLength;
        })
        //data = data.slice().sort((a, b) => d3.ascending(a.daysUntilConventionAnnounced, b.daysUntilConventionAnnounced));

        // add X axis
        const xScale = d3.scaleLinear()
            .domain(
                [
                    d3.min(data, function(d) { return d.daysUntilConventionSuspended }),
                    d3.max(data, function(d) { return d.daysUntilConventionAnnounced })
                ]
            )
            .range([width, 0]); // notice this is in 'reverse' since the x-axis is a count down to zero

        svg.append("g")
            .attr("class", "axis")
            .attr("id", "xAxis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0));

        // rect boundary
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('stroke', 'black')
            .attr('fill', 'none');

        // add Y axis
        const yScale = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.sort((a, b) => d3.ascending(a.daysUntilConventionAnnounced, b.daysUntilConventionAnnounced)).map(function(d) { return d.candidate; }))
            .padding(0.9);
        svg.append("g")
            .attr("id", "yAxis")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale).tickSizeOuter(0).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "start")
            .style("transform", `translate(-${margin.left-2}px, 0`);

        // Lines
        svg.selectAll("campaignLengthLine")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "campaignLengthLine")
            .attr("x1", function(d) { return xScale(d.daysUntilConventionAnnounced); })
            .attr("x2", function(d) { return xScale(d.daysUntilConventionSuspended); })
            .attr("y1", function(d) { return yScale(d.candidate); })
            .attr("y2", function(d) { return yScale(d.candidate); })
            .attr("stroke", "black");

        // Announced circles
        svg.selectAll("announcedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "announcedCircle")
            .attr("cx", function(d) { return xScale(d.daysUntilConventionAnnounced); })
            .attr("cy", function(d) { return yScale(d.candidate); })
            .attr("r", 5) 
            .style("fill", primaryColorMedium)
            .attr("stroke", "black");
        // Announced circles
        svg.selectAll("suspendedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "suspendedCircle")
            .attr("cx", function(d) { return xScale(d.daysUntilConventionSuspended); })
            .attr("cy", function(d) { return yScale(d.candidate); })
            .attr("r", 5) 
            .style("fill", primaryColorMedium)
            .attr("stroke", "black");

        // x-axis label
        svg.append("text")
            .attr("id", "xAxisLabel")
            .attr("y", height + 25)
            .attr("x", width / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of days until party convention candidate announced & suspended campaign"); 

        const clickableText = document.getElementById("clickMe");
        clickableText.onclick = convertToLollipop;
        clickableText.data = data; // pass dataset to conversion function as a parameter. Otherwise we'd have to re-read the data, which would be inefficient
   
        const fixedClickableDiv = document.getElementById("fixedClickMe");
        fixedClickableDiv.onclick = convertToLollipop;
        fixedClickableDiv.data = data;
    });
}

function convertToLollipop(event) {

    const duration = 2000;

    const data = event.currentTarget.data; // 

    // step 0 - I copy + pasted this from the above function. But we should be able to re-use already defined vars. So that's an improvement for later.
    const margin = {top: 10, right: 30, bottom: 50, left: 120};
    let box = document.getElementById('chart');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // step 1 - access everything from the original chart
    // we need the axes and data points
    const announcedCircles = d3.selectAll(".announcedCircle"); // we'll probably just want to hide these
    const suspendedCircles = d3.selectAll(".suspendedCircle"); // this will become the lollipop
    const lengthLines = d3.selectAll(".campaignLengthLine"); // this will be part of the lollipop

    // NEW SCALES AND ADJUST AXES
    // create new x scale
    const xScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.campaignLength; }))
            .range([0, width]);
    const xAxis = d3.select("#xAxis"); // grab original x-axis
    xAxis.call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0)); // and update .axisBottom() with new scale

    // create new y scale
    const yScale = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.sort((a, b) => d3.ascending(a.campaignLength, b.campaignLength)).map(function(d) { return d.candidate; }))
            .padding(0.9);
    const yAxis = d3.select("#yAxis"); // grab original y-axis
    yAxis.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSize(0)); // and update it

    // Move suspendedCircles to new x and y position by updating cx and xy with new scales
    suspendedCircles
        .transition().duration(duration)
        .attr("cx", function(d) { return xScale(d.campaignLength); })
        .attr("cy", function(d) { return yScale(d.candidate); });

    // 2. hide / remove announced circles, since we only need one circle. but keep for converting back?
    announcedCircles
        .transition().duration(duration)
        .style('opacity', 0)
        .attr("r", 0); // I didn't really know what else to do lol

    // adjust lines, by once again updating the x and y values
    lengthLines
            .transition().duration(duration)
            .attr("x1", 0)
            .attr("x2", function(d) { return xScale(d.campaignLength); })
            .attr("y1", function(d) { return yScale(d.candidate); })
            .attr("y2", function(d) { return yScale(d.candidate); })

    // update text for x axis label
    document.getElementById("xAxisLabel").innerHTML = "Campaign length (days)";

    // update click effect
    const clickableText = document.getElementById("clickMe");
    clickableText.onclick = convertToDotPlot;
    clickableText.data = data; // pass dataset to conversion function as a parameter. Otherwise we'd have to re-read the data, which would be inefficient
    clickableText.innerHTML = "Click me to switch to dot plot";

    const fixedClickableDiv = document.getElementById("fixedClickMe");
    fixedClickableDiv.onclick = convertToDotPlot;
    fixedClickableDiv.data = data;
    fixedClickableDiv.innerHTML = "Switch to dot plot";
}

function convertToDotPlot(event) {

    const duration = 2000;

    const data = event.currentTarget.data; // 

    // step 0 - I copy + pasted this from the above function. But we should be able to re-use already defined vars. So that's an improvement for later.
    const margin = {top: 10, right: 30, bottom: 50, left: 120};
    let box = document.getElementById('chart');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // step 1 - access everything from the original chart
    // we need the axes and data points
    const announcedCircles = d3.selectAll(".announcedCircle"); // we'll probably just want to hide these
    const suspendedCircles = d3.selectAll(".suspendedCircle"); // this will become the lollipop
    const lengthLines = d3.selectAll(".campaignLengthLine"); // this will be part of the lollipop

    // NEW SCALES AND ADJUST AXES
    // create new x scale
    const xScale = d3.scaleLinear()
    .domain(
        [
            d3.min(data, function(d) { return d.daysUntilConventionSuspended }),
            d3.max(data, function(d) { return d.daysUntilConventionAnnounced })
        ]
    )
    .range([width, 0]); // notice this is in 'reverse' since the x-axis is a count down to zero

    const xAxis = d3.select("#xAxis"); // grab original x-axis
    xAxis.call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0)); // and update .axisBottom() with new scale

    // create new y scale
    const yScale = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.sort((a, b) => d3.ascending(a.daysUntilConventionAnnounced, b.daysUntilConventionAnnounced)).map(function(d) { return d.candidate; }))
        .padding(0.9);
    const yAxis = d3.select("#yAxis"); // grab original y-axis
    yAxis.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSize(0)); // and update it

    // Move suspendedCircles to new x and y position by updating cx and xy with new scales
    suspendedCircles
        .transition().duration(duration)
        .attr("cx", function(d) { return xScale(d.daysUntilConventionSuspended); })
        .attr("cy", function(d) { return yScale(d.candidate); });

    // 2. hide / remove announced circles, since we only need one circle. but keep for converting back?
    announcedCircles
        .transition().duration(duration)
        .style('opacity', 1)
        .attr("r", 5)
        .attr("cx", function(d) { return xScale(d.daysUntilConventionAnnounced); })
        .attr("cy", function(d) { return yScale(d.candidate); });

    // adjust lines, by once again updating the x and y values
    lengthLines
            .transition().duration(duration)
            .attr("x1", function(d) { return xScale(d.daysUntilConventionAnnounced); })
            .attr("x2", function(d) { return xScale(d.daysUntilConventionSuspended); })
            .attr("y1", function(d) { return yScale(d.candidate); })
            .attr("y2", function(d) { return yScale(d.candidate); })

    // update text for x axis label
    document.getElementById("xAxisLabel").innerHTML = "Number of days until party convention candidate announced & suspended campaign";

    // update click effect
    const clickableText = document.getElementById("clickMe");
    clickableText.onclick = convertToLollipop;
    clickableText.data = data; // pass dataset to conversion function as a parameter. Otherwise we'd have to re-read the data, which would be inefficient
    clickableText.innerHTML = "Click me to switch to lollipop";

    const fixedClickableDiv = document.getElementById("fixedClickMe");
    fixedClickableDiv.onclick = convertToLollipop;
    fixedClickableDiv.data = data;
    fixedClickableDiv.innerHTML = "Switch to lollipop";
}

function main() {
    clevelandDotPlot();
}

main();