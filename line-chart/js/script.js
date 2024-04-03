const mobile = window.innerWidth < 600;
const heightAdjuster = .8;

function drawLineChart(containerId, dataset, color) {

    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 60}

    let width, height;

    if (mobile) {
        width = window.innerWidth * 0.9 - margin.left - margin.right;
    } else {
        width = window.innerWidth * 0.4 - margin.left - margin.right;
    }

    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //Read the data
    d3.csv("data/" + dataset,

    // When reading the csv, I must format variables:
    function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
        }).then(

            // Now I can use this dataset:
            function(data) {

            // Add X axis --> it is a date format
            const x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ]);
            svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

            // Add Y axis
            const y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.value; })])
            .range([ height, 0 ]);
            svg.append("g")
            .call(d3.axisLeft(y));

            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
                )
    })
}

function switchChart() {
    const lineChart1DisplayStatus = document.getElementById("lineChart1").style.display;
    if (lineChart1DisplayStatus == 'block') {
        document.getElementById("lineChart2").style.display = 'block';
        document.getElementById("lineChart1").style.display = 'none';
        document.getElementById("yearInHeader").innerHTML = '2022';
        document.getElementById("buttonToSwitch").innerHTML = 'Switch to 2021 mileage';
    } else {
        showOnly2021();
    }
}

function showBothCharts() {
    document.getElementById("lineChart2").style.display = 'inline-block';
    document.getElementById("lineChart1").style.display = 'inline-block';
    document.getElementById("buttonToSwitch").style.display = 'none';
    document.getElementById("buttonToShowBoth").style.display = 'none';
    document.getElementById("buttonToReset").style.display = 'inline-block';
}

function showOnly2021() {
    document.getElementById("lineChart2").style.display = 'none';
    document.getElementById("lineChart1").style.display = 'block';
    document.getElementById("yearInHeader").innerHTML = '2021';
    document.getElementById("buttonToSwitch").innerHTML = 'Switch to 2022 mileage';
    document.getElementById("buttonToSwitch").style.display = 'inline-block';
    document.getElementById("buttonToShowBoth").style.display = 'inline-block';
    document.getElementById("buttonToReset").style.display = 'none';
}

function main() {
    drawLineChart("lineChart1", "2021_mileage.csv", "blue");
    drawLineChart("lineChart2", "2022_mileage.csv", "orange");
}

main();