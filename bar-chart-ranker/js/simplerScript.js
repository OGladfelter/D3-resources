function barRanker() {
    const margin = {top: 20, right: 30, bottom: 50, left: 30}

    // add svg
    let box = document.getElementById('barChartSimple');
    let width = box.offsetWidth - margin.left - margin.right; // even empty divs are intialized with width
    let height = window.innerHeight * 1 - margin.top - margin.bottom; // empty divs are intialized with height = 0, so let's use screen size
    let yTickLabels = 'state'; // overwrite this later if user is on mobile

    // adjust height, margins, ytickLabels for mobile users
    if (mobile) {
        height = window.innerHeight * heightAdjuster;
        margin.left = 20;
        margin.right = 20;
        width = box.offsetWidth - margin.left - margin.right;
        yTickLabels = 'stateShort'; // use 2-letter abbreviations
    }

    // append svg and g elements to div container
    const svg = d3.select("#barChartSimple")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Parse the Data
    d3.csv("data/stateData.csv").then( function(data) {

        data.forEach(function(d) {
            // loop over data, make sure D3 interprets the following columns as integers
            d.lifeSat = +d.lifeSat;
            d.lifeSatRank = +d.lifeSatRank;
        });

        // const colorScale = d3.scaleLinear()
        //     .domain(d3.extent(data, function(d) { return d.lifeSat; }))
        //     .range(['#c1e1c1', '#097969']);

        // Add X scale and axis
        const xScale = d3.scaleLinear()
            .domain([0, 10]) // chose 0 and 10 because the question "how satisified are you with life?" is on a 0 - 10 scale
            .range([ 0, width]);   
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0).ticks(5));

        // Add Y scale and axis
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.lifeSatRank).sort(function(a, b){return a-b})) // can't just do min/max rank because we're using .scaleBand() for this scale
            .range([ 0, height ])
            .padding(.05);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale).tickSizeOuter(0).tickSize(0)); // only label every 5 ticks

        // add rectangles to the svg
        svg.selectAll(".staticRectangles")
            .data(data) 
            .join("rect")
            .attr('class', 'staticRectangles')
            .attr("x", 0 ) // bar charts typically start every bar at x = 0
            .attr("y", d => yScale(d.lifeSatRank))
            .attr("width", d => xScale(d.lifeSat))
            .attr("height", yScale.bandwidth())
            .attr('fill', '#097969');

        // add text labels to svg, position so they appear above bars
        svg.selectAll(".textOnBars")
            .data(data)
            .join("text")
            .attr("x", xScale(0) + 5 )
            .attr("y", d => yScale(d.lifeSatRank) + (yScale.bandwidth() / 2))
            .text(d => d.state)
            .attr('class', 'textOnBars');

        // add x-axis label at bottom of svg space
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr('id', 'rankerAxisLabel')
            .style('text-anchor', 'middle')
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("How satisfied are you with your life?");
    });
}

function main() {
    barRanker();
}

main();