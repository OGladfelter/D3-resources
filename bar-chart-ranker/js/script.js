const mobile = window.innerWidth < 600;
const heightAdjuster = .8;

function barRanker() {
    const margin = {top: 20, right: 30, bottom: 50, left: 30}

    // add svg
    let box = document.getElementById('barChart');
    let width = box.offsetWidth - margin.left - margin.right;
    let height = window.innerHeight * 1 - margin.top - margin.bottom;
    let yTickLabels = 'state';

    // x-axis labels
    let metricDict = {'lifeSat':'How satisfied are you with your life?', 'happiness':'How happy did you feel yesterday?', 'worthwhile':'To what extent do you feel that the things you do in your life are worthwhile?', 'anxiety':'How anxious did you feel yesterday?'};

    // adjust for mobile
    if (mobile) {
        height = window.innerHeight * heightAdjuster;
        margin.left = 20;
        margin.right = 20;
        width = box.offsetWidth - margin.left - margin.right;
        yTickLabels = 'stateShort'; // use 2-letter abbreviations
        metricDict = {'lifeSat':'Life satisfaction', 'happiness':'Happiness', 'worthwhile':"Agree one's activities are worthwhile", 'anxiety':'Anxiousness'};
    }
    const svg = d3.select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select("#tooltipBars");
    
    // Parse the Data
    d3.csv("data/stateData.csv").then( function(data) {

        data.forEach(function(d) {
            d.lifeSat = +d.lifeSat;
            d.lifeSatRank = +d.lifeSatRank;
            d.anxiety = +d.anxiety;
            d.anxietyRank = +d.anxietyRank;
            d.worthwhile = +d.worthwhile;
            d.worthwhileRank = +d.worthwhileRank;
            d.happiness = +d.happiness;
            d.happyRank = +d.happyRank;
        });

        const colorScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.lifeSat; }))
            .range(['#c1e1c1', '#097969']);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 10])
            .range([ 0, width]);   
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5));

        // Y axis
        const y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(d => d.lifeSatRank).sort(function(a, b){return a-b}))
            .padding(.05);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0).tickFormat((columnValue) => columnValue == 1 || columnValue % 5 == 0 ? columnValue : '')); // only label every 5 ticks

        // bars
        svg.selectAll(".barChartRectangles")
            .data(data)
            .join("rect")
            .attr('class', 'barChartRectangles')
            .attr("x", x(0) )
            .attr("y", d => y(d.lifeSatRank))
            .attr("width", d => x(d.lifeSat))
            .attr("height", y.bandwidth())
            .attr('fill', d => colorScale(d.lifeSat))
            .on('mouseover', function(event, d) {
                d3.select(this).style('fill', 'orange');
                tooltip.html('State: ' + d.state + '<br>Rank: ' + d.lifeSatRank + '<br> Avg life satisfaction: ' + d.lifeSat.toFixed(1))
                    .transition()
                    .duration(250)
                    .style('opacity', 1);
            }).on('mousemove', function(event) {
                tooltip
                    .style('left', event.pageX / window.innerWidth <= 0.5 ? event.pageX + 5 + 'px' : event.pageX - tooltip.node().getBoundingClientRect().width + 'px')
                    .style('top', event.pageY + 10 + 'px')
            }).on('mouseout', function(d) {
                d3.select(this).style('fill', colorScale(d.lifeSat));
                tooltip.transition().duration(250).style('opacity', 0);
            });

        // text
        svg.selectAll(".textOnBars")
            .data(data)
            .join("text")
            .attr("x", x(0) + 5 )
            .attr("y", d => y(d.lifeSatRank) + (y.bandwidth() / 2))
            .text(d => d.state)
            .attr('class', 'textOnBars');

        svg.append("text")
            .attr("class", "x-axis-label")
            .attr('id', 'rankerAxisLabel')
            .style('text-anchor', 'middle')
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text(metricDict['lifeSat']);

        d3.selectAll(".rankerButtons").on("click", function() {
            // determine which toggle was selected
            const metric = this.dataset.metric;
            const rankMetric = this.dataset.ranker;
            const metricTitle = this.innerHTML;

            // update scales
            colorScale.domain(d3.extent(data, function(d) { return d[metric]; }));
            y.domain(data.map(d => d[rankMetric]).sort(function(a, b){return a-b}));

            // update rectangles
            svg.selectAll(".barChartRectangles")
                .on('mouseover', function(event, d) { // update tooltip info
                    d3.select(this).style('fill', 'orange');
                    tooltip.html('State: ' + d.state + '<br>Rank: ' + d[rankMetric] + '<br> Avg ' + metricTitle.toLowerCase() + ': ' + d[metric].toFixed(1))
                        .transition()
                        .duration(250)
                        .style('opacity', 1);
                })
                .transition().duration(1500)
                .attr("fill", d => colorScale(d[metric])) // recolor
                .attr("y", d => y(d[rankMetric])) // move up or down
                .attr("width", d => x(d[metric])); // resize

            // move text labels
            svg.selectAll(".textOnBars").transition().duration(1500).attr("y", d => y(d[rankMetric]) + (y.bandwidth() / 2));

            // update x-axis label
            svg.select("#rankerAxisLabel").text(metricDict[metric]);

            // update button style
            d3.selectAll(".rankerButtons").each(function (p, j) {
                this.classList.remove('buttonSelected');
            });
            this.classList.add('buttonSelected');
        });
    });
}

function main() {
    barRanker();
}

main();