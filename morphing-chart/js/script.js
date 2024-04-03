const primaryColorLight = 'hsl(197, 97%, 66%)'; // low end of map, bars, and younger ages in age analysis
const primaryColorDark = '#0006b8'; // high end of map, bars, and older ages in age analysis
const primaryColorMedium = '#2A6ADA'; 
const mobile = window.innerWidth < 600;

function clevelandDotPlot() {

    const margin = {top: 10, right: 30, bottom: 50, left: 120};
    let box = document.getElementById('lollipop');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#lollipop")
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
        data = data.slice().sort((a, b) => d3.ascending(a.daysUntilConventionAnnounced, b.daysUntilConventionAnnounced))

        // add X axis
        const xScale = d3.scaleLinear()
            .domain(
                [
                    d3.min(data, function(d) { return d.daysUntilConventionSuspended }),
                    d3.max(data, function(d) { return d.daysUntilConventionAnnounced })
                ]
            )
            .range([width, 0]);

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
        const y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.candidate; }))
            .padding(0.9);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0))
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
            .attr("y1", function(d) { return y(d.candidate); })
            .attr("y2", function(d) { return y(d.candidate); })
            .attr("stroke", "black");

        // Announced circles
        svg.selectAll("announcedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "announcedCircle")
            .attr("x2", function(d) { return xScale(d.daysUntilConventionSuspended); })
            .attr("cx", function(d) { return xScale(d.daysUntilConventionAnnounced); })
            .attr("cy", function(d) { return y(d.candidate); })
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
            .attr("cy", function(d) { return y(d.candidate); })
            .attr("r", 5) 
            .style("fill", primaryColorMedium)
            .attr("stroke", "black");

        // y-axis label
        svg.append("text")
            .attr("y", height + 25)
            .attr("x", width / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of days until party convention candidate announced & suspended campaign"); 

        const clickableText = document.getElementById("clickMe");
        clickableText.addEventListener("click", convertToLollipop, false);
        clickableText.data = data; // pass dataset to conversion function as a parameter. Otherwise we'd have to re-read the data, which would be inefficient
    });
}

function convertToLollipop(event) {

    const data = event.currentTarget.data; // 

    // step 0 - I copy + pasted this from the above function. But we should be able to re-use already defined vars. So that's an improvement for later.
    const margin = {top: 10, right: 30, bottom: 50, left: 120};
    let box = document.getElementById('lollipop');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // step 1 - access everything from the original chart
    // we need the axes and data points
    const announcedCircles = d3.selectAll(".announcedCircle"); // we'll probably just want to hide these
    const suspendedCircles = d3.selectAll(".suspendedCircle"); // this will become the lollipop
    const lengthLines = d3.selectAll(".campaignLengthLine"); // this will be part of the lollipop

    // let's also grab the x axis. The complication here is we have the x-axis in 'reverse' for the cleveland dot plot, but we want to switch it for the lollipop
    const xScale = d3.scaleLinear() // since we are changing the xScale completely, we just create a new one, rather than re-use old
            .domain(d3.extent(data, function(d) { return d.campaignLength; }))
            .range([0, width]);
    const xAxis = d3.select("#xAxis"); // grab original xAxis
    xAxis.call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0)); // update xAxis

    // to do next:
    // 1. move suspendedCircles to new x position
    // 2. hide / remove announced circles, since we only need one circle. but keep for converting back?
    // 3. move lines
    // 4. add ability to flip back to original cleveland dot plot. new function?
}

function main() {
    clevelandDotPlot();
}

main();