const primaryColorLight = 'hsl(197, 97%, 66%)'; // low end of map, bars, and younger ages in age analysis
const primaryColorDark = '#0006b8'; // high end of map, bars, and older ages in age analysis
const primaryColorMedium = '#2A6ADA'; 
const mobile = window.innerWidth < 600;

function lollipop() {
    const colorOlder = primaryColorDark;
    const colorYounger = primaryColorLight;
    const colorBothAgeGroups = primaryColorMedium;

    const margin = {top: 10, right: 30, bottom: 30, left: 120};
    let box = document.getElementById('lollipop');
    let width = box.offsetWidth - margin.left - margin.right;
    const height = window.innerHeight * 2 - margin.top - margin.bottom;

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
        })
        data = data.slice().sort((a, b) => d3.ascending(a.daysUntilConventionAnnounced, b.daysUntilConventionAnnounced))

        // add X axis
        const x = d3.scaleLinear()
            .domain(
                [
                    d3.min(data, function(d) { return d.daysUntilConventionSuspended }),
                    d3.max(data, function(d) { return d.daysUntilConventionAnnounced })
                ]
            )
            .range([width, 0]);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

        // user can mouse over any where on this rect to get x-axis value on mouse position
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('stroke', 'black')
            .attr('fill', 'white')
            .on('mousemove', function(event) {
                const selectedDaysValue = x.invert(d3.pointer(event)[0]);
                const matchingCandidates = data.filter(d => d.daysUntilConventionAnnounced > selectedDaysValue & d.daysUntilConventionSuspended < selectedDaysValue);
                console.log(matchingCandidates.length);
                // move vertical line to follow mouse cursor
                verticalLine
                    .attr("x1", function(d) { return x(selectedDaysValue); })
                    .attr("x2", function(d) { return x(selectedDaysValue); })
            });
        
        // get days between today and mid-August, when the convention may be
        const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const thisDate = new Date();
        const conventionDate = new Date(2024, 8, 14); // this is just a guess for now, needs updated later
        const daysTillConvention = Math.round(Math.abs((thisDate - conventionDate) / oneDay));

        console.log(daysTillConvention)
        
        // draw a vertical line
        const verticalLine = svg.append("line")
            .attr("x1", function(d) { return x(daysTillConvention); })
            .attr("x2", function(d) { return x(daysTillConvention); })
            .attr("y1", function(d) { return 0; })
            .attr("y2", function(d) { return height; })
            .attr("stroke", "gray");

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
        svg.selectAll("myline")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x(d.daysUntilConventionAnnounced); })
            .attr("x2", function(d) { return x(d.daysUntilConventionSuspended); })
            .attr("y1", function(d) { return y(d.candidate); })
            .attr("y2", function(d) { return y(d.candidate); })
            .attr("stroke", "black");

        // Announced circles
        svg.selectAll("announcedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.daysUntilConventionAnnounced); })
            .attr("cy", function(d) { return y(d.candidate); })
            .attr("r", 5) 
            .style("fill", colorBothAgeGroups)
            .attr("stroke", "black");
        // Announced circles
        svg.selectAll("suspendedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.daysUntilConventionSuspended); })
            .attr("cy", function(d) { return y(d.candidate); })
            .attr("r", 5) 
            .style("fill", colorBothAgeGroups)
            .attr("stroke", "black");
    });
}

function main() {
    lollipop();
}

main();