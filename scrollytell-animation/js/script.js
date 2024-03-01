const defaultColor = '#E0B0FF';
const highlightColor1 = 'red';
const highlightColor2 = 'cyan';

const mobile = window.innerWidth < 600;

function drawBeeswarm() {
    const margin = {top: 10, right: 30, bottom: 75, left: 30};
    const box = document.getElementById('beeswarm');
    const width = box.offsetWidth - margin.left - margin.right;
    let height = window.innerHeight / 2 - margin.top - margin.bottom;
    let tickCount = 10;
    let circleRadius = 8;

    if (mobile) {
        height = window.innerHeight / 1.25 - margin.top - margin.bottom;
        tickCount = 5;
        circleRadius = 7;
    }

    // append the svg object to the body of the page
    const svg = d3.select("#beeswarm")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parse the Data
    d3.csv("data/primaryCandidates.csv").then( function(data) {

        data.forEach(function(d) {
            d.daysAfterMidtermsAnnounced = +d.daysAfterMidtermsAnnounced;
        })
        data = data.slice().sort((a, b) => d3.ascending(a.daysAfterMidtermsAnnounced, b.daysAfterMidtermsAnnounced))

        // add X axis
        let x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.daysAfterMidtermsAnnounced }),)
            .range([0, width]);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(tickCount).tickSizeOuter(0));

        xScale = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.daysAfterMidtermsAnnounced; }));

        // Create simulation with specified dataset
        let simulation = d3.forceSimulation(data)
            // Apply positioning force to push nodes towards desired position along X axis
            .force("x", d3.forceX(function(d) {
                // Mapping of values from total/perCapita column of dataset to range of SVG chart (<margin.left, margin.right>)
                return xScale(d.daysAfterMidtermsAnnounced);  // This is the desired position
            }).strength(2))  // Increase velocity
            .force("y", d3.forceY((height / 2)))  // // Apply positioning force to push nodes towards center along Y axis
            .force("collide", d3.forceCollide(circleRadius + 1)) // Apply collision force to keep nodes centers 9 pixels apart
            .stop();  // Stop simulation from starting automatically

        // Manually run simulation
        for (let i = 0; i < data.length; ++i) {
            simulation.tick(5);
        }

        const tooltip = d3.select("#tooltip");
        const tooltip2 = d3.select("#tooltip2");

        svg.selectAll(".announcedCircle")
            .data(data)
            .enter()
            .append("circle")
            .attr('id', d => 'circle' + d.id)
            .attr('class', 'announcedCircle')
            .attr("cx", d => d.x )
            .attr("cy", d => d.y )
            .attr("r", circleRadius) 
            .style("fill", defaultColor)
            .style('opacity', 0.7)
            .attr("stroke", "black")
            .on('mouseover', function(event, d) {
                d3.select(this).style('stroke-width', '2px').attr("r", circleRadius + 2);
                tooltip
                    .html(d.candidate + ' announced ' + d.announced + ', ' + Math.abs(d.daysAfterMidtermsAnnounced) + ' days ' + (d.daysAfterMidtermsAnnounced > 0 ? ' after ' : ' before ') + 'midterms')
                    .style('left', event.pageX / window.innerWidth <= 0.5 ? d.x + 40 + 'px' : d.x - tooltip.node().getBoundingClientRect().width + 25 + 'px')
                    .style('top', d.y + 50 + 'px')
                    .transition()
                    .duration(500)
                    .style('opacity', 0.95);
            })
            .on('click', function(event, d) {
                tooltip2
                    .html(d.candidate + ' announced ' + d.announced + ', ' + Math.abs(d.daysAfterMidtermsAnnounced) + ' days ' + (d.daysAfterMidtermsAnnounced > 0 ? ' after ' : ' before ') + 'midterms')
                    .style('left', event.pageX / window.innerWidth <= 0.5 ? d.x + 40 + 'px' : d.x - tooltip.node().getBoundingClientRect().width + 25 + 'px')
                    .style('top', d.y + 50 + 'px')
                    .transition()
                    .duration(500)
                    .style('opacity', 0.95);
            })
            .on('mouseout', function() {
                d3.select(this).style('stroke-width', '1px').attr("r", circleRadius);
                tooltip.transition().duration(500).style('opacity', 0);
            });

        svg.append('text')
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 1.5)
            .style("text-anchor", "middle")
            .style("fill", "whitesmoke")
            .text('Days passed since midterm elections');
    });
}

function main() {
    let offset = '75%';
    if (mobile) {
        offset = '95%';
    }

    drawBeeswarm();

    // highlight one specific circle 
    new Waypoint({
        element: document.getElementById('step1'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.select("#circle85")
                    .transition().duration(1000)
                    .style("fill", highlightColor1)
                    .style('stroke-width', '2px')
                    .style('opacity', 1);
            }
            else {
                d3.selectAll('.announcedCircle')
                    .style("fill", defaultColor)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7);
            }
        },
        offset: offset
    });

    // highlight delaney circle
    new Waypoint({
        element: document.getElementById('step2'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.select("#circle65")
                    .transition().duration(1000)
                    .style("fill", highlightColor2)
                    .style('stroke-width', '2px')
                    .style('opacity', 1);
            }
            else {
                d3.select("#circle65")
                    .transition().duration(1000)
                    .style("fill", defaultColor)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7);
            }
        },
        offset: offset
    });

    // highlight yang, gravel, ojeda circle
    new Waypoint({
        element: document.getElementById('step3'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.selectAll("#circle7,#circle54,#circle75")
                    .transition().duration(1000)
                    .style("fill", highlightColor2)
                    .style('stroke-width', '2px')
                    .style('opacity', 1);
            }
            else {
                d3.selectAll("#circle7,#circle54,#circle75")
                    .transition().duration(1000)
                    .style("fill", defaultColor)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7);
            }
        },
        offset: offset
    });

    // color circles by party
    new Waypoint({
        element: document.getElementById('step4'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.selectAll(".announcedCircle")
                .transition().duration(1000)
                .style('stroke-width', '1px')
                .style('opacity', 0.7)
                .style("fill", function(d) {
                    if (d.party == 'R') {
                        return highlightColor1;
                    } return highlightColor2;
                });
            }
            else {
                d3.selectAll(".announcedCircle")
                    .transition().duration(1000)
                    .style("fill", defaultColor)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7);
                d3.select("#circle85")
                    .transition().duration(1000)
                    .style("fill", highlightColor1)
                    .style('stroke-width', '2px')
                    .style('opacity', 1);
                d3.selectAll("#circle7,#circle54,#circle75,#circle65")
                    .transition().duration(1000)
                    .style("fill", highlightColor2)
                    .style('stroke-width', '2px')
                    .style('opacity', 1);
            }
        },
        offset: offset
    });

    // color circles by year
    new Waypoint({
        element: document.getElementById('step5'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.selectAll(".announcedCircle")
                    .transition().duration(1000)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7)
                    .style("fill", function(d) {
                        if (d.year == '2008') {
                            return 'green';
                        } else if (d.year == '2012') {
                            return 'orange';
                        } return 'gray';
                    })
                    .style("opacity", function(d) {
                        if (d.year == '2008') {
                            return 1;
                        } else if (d.year == '2012') {
                            return 1;
                        } return 0.2;
                    });
            }
            else {
                d3.selectAll(".announcedCircle")
                    .transition().duration(1000)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7)
                    .style("fill", function(d) {
                        if (d.party == 'R') {
                            return highlightColor1;
                        } return highlightColor2;
                    });
            }
        },
        offset: offset
    });

    // return to default
    new Waypoint({
        element: document.getElementById('step6'),
        handler: function(direction) {
            if (direction == 'down') {
                d3.selectAll(".announcedCircle")
                    .transition().duration(1000)
                    .style("fill", defaultColor)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7);
            }
            else {
                d3.selectAll(".announcedCircle")
                    .transition().duration(1000)
                    .style('stroke-width', '1px')
                    .style('opacity', 0.7)
                    .style("fill", function(d) {
                        if (d.year == '2008') {
                            return 'green';
                        } else if (d.year == '2012') {
                            return 'orange';
                        } return 'gray';
                    })
                    .style("opacity", function(d) {
                        if (d.year == '2008') {
                            return 1;
                        } else if (d.year == '2012') {
                            return 1;
                        } return 0.2;
                    });
            }
        },
        offset: offset
    });

}

main();