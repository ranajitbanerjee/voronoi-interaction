// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 870 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

let getPoints = (data) => {
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.Horsepower; }));
    y.domain([0, d3.max(data, function(d) { return d.Acceleration; })]);
    x.domain([x.domain()[0] - 3, x.domain()[1] + 3]);
    let points = data.map(d => ({
        x: x(d.Horsepower),
        y: y(d.Acceleration),
        data: d
    }));
    return points;
};

let drawCircles = (points) => {
    // Add the scatterplot
    let sel = svg.selectAll("circle")
        .data(points)
    sel.enter().append("circle")
        .merge(sel)
        .attr("r", 4)
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .style('fill', 'steelblue');
}

let createScatterPlotChart = (data) => {
        let points = getPoints(data);

        drawCircles(points);
        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        let voronoi = d3.voronoi().x(d => d.x).y(d => d.y)
            .extent([[0, 0], [width , height]]);

        let diagram = voronoi(points);
        let tracker = svg.append('rect').attr('x', 0).attr('y', 0)
            .attr('width', width).attr('height', height).style('fill-opacity', 0);
        let selectedPoint;
        tracker.on('mouseover', () => {
            mouseHandler(d3.event);
        }).on('mousemove', () => {
            mouseHandler(d3.event);
        });

    let mouseHandler = (event) => {
        let point = diagram.find(event.x - margin.left, event.y - margin.top, 30);
            if (point === null) {
                hideTooltip();
                svg.selectAll('.highlightCircle').style('fill', 'steelblue');
            }
            else {
                showTooltip(point.data.x, point.data.y, point.data.data);
                let appendCircle = svg.selectAll('.highlightCircle').data(['highlightCircle']);
                appendCircle.enter().append('circle').merge(appendCircle).attr('cx', point.data.x)
                    .attr('cy', point.data.y)
                    .attr('r', 5)
                    .style('fill', 'black')
                    .attr('class', 'highlightCircle');
            }
    }

    function redrawPolygon(polygon) {
        polygon
            .attr("d", function(d) {
                return d ? "M " + d.join("L") + " Z" : null;
            });
        }
    function redraw() {
        drawCircles(points);
        var diagram = voronoi(points);
        polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
        drawCircles(points);
    }

    var polygon = svg.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(diagram.polygons(points))
        .enter().append("path")
        .call(redrawPolygon);
};

let tooltipContainer = d3.select('body').append('div').attr('class', 'tooltip')
    .style('display', 'none');

let showTooltip = (x, y, data) => {
    let values = [['Horsepower : ', data.Horsepower], ['Acceleration : ', data.Acceleration]];
    let selection = tooltipContainer.selectAll('p').data(values),
            selectionEnter = selection.enter().append('p');

        selectionEnter.merge(selection).each(function (row) {
            let rowEl = d3.select(this),
                cells = rowEl.selectAll('span').data([0, 1]);
            cells.enter().append('span').merge(cells).html(d => `${row[d]} `);
        });
    tooltipContainer.style('position', 'absolute')
        .style('display', 'block')
        .style('left', `${x + 60}px`)
        .style('top', `${y + 40}px`);
    tooltipContainer.style('display', 'block');
};

let hideTooltip = () => {
    tooltipContainer.style('display', 'none');
}
// Get the data
d3.json("./cars.json", function(error, data) {
  if (error) throw error;
  data = data.filter(d => d.Origin === 'Europe');
  createScatterPlotChart(data);
});