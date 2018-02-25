let getPoints = (data, x, y) => {
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

let drawCircles = (svg, points) => {
    // Add the scatterplot
    let sel = svg.selectAll("circle")
        .data(points)
    sel.enter().append("circle")
        .merge(sel)
        .attr("r", 4)
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .style('fill', 'steelblue');
};

class ScatterPlot {
    constructor () {
        this._tooltipContainer = d3.select('body').append('div').attr('class', 'tooltip')
                .style('display', 'none');
        this.margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };
    }

    data (data) {
        this._data = data;
        return this;
    }

    height (height) {
        let margin = this.margin;
        this._height = height - margin.top - margin.bottom;
        return this;
    }

    width (width) {
        let margin = this.margin;
        this._width = width - margin.left - margin.right;
        return this;
    }

    render (svg) {
        let margin = this.margin;
        this._svg = svg;
        // set the ranges
        let width = this._width,
            height = this._height,
            points = this.getDataPoints();//getPoints(this._data, x, y);
        this.points = points;
        var svg = svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Add the X Axis
        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${height})`)
            .call(d3.axisBottom(this._xScale));

        // Add the Y Axis
        svg.append("g")
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(this._yScale));

        let group = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this._svgGroup = group;
        drawCircles(group, points, this._xScale, this._yScale);
        this.createVoronoi();
        this.voronoiComputed = this.voronoi(points);
        return this;
    }

    getDataPoints () {
        let width = this._width,
            height = this._height,
            x = d3.scaleLinear().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            points = getPoints(this._data, x, y);
        this._xScale = x;
        this._yScale = y;
        return points;
    }

    createVoronoi () {
        let width = this._width;
        let height = this._height;
        let margin = this.margin;
        this.voronoi = d3.voronoi().x(d => d.x).y(d => d.y)
            .extent([[0, -margin.top], [width, height - margin.top]]);
    }

    getInteractionLayer () {
        let width = this._width,
            height = this._height,
            margin = this.margin;

        let tracker = this._svg.selectAll('.interaction-layer').data([1])
            .enter().append('rect').attr('x', 0).attr('y', 0)
            .attr('width', width).attr('height', height).style('fill-opacity', 0)
            .attr('class', 'interaction-layer');
        return tracker;
    }

    getNearestPoint (e) {
        let margin = this.margin;
        let point = this.voronoiComputed.find(e.x - margin.left - 8, e.y - margin.top - 8, 30);
        return point;
    }

    highlightCircle (point) {
        let margin = this.margin;
        if (point === null) {
            this._svgGroup.selectAll('.highlightCircle').style('fill', 'steelblue');
        }
        else {
            let appendCircle = this._svgGroup.selectAll('.highlightCircle').data(['highlightCircle']);
            appendCircle.enter().append('circle').merge(appendCircle).attr('cx', point.data.x)
                .attr('cy', point.data.y)
                .attr('r', 5)
                .style('fill', 'black')
                .attr('class', 'highlightCircle');
        }
        return this;
    }

    tooltip (point) {
        let tooltipContainer = this._tooltipContainer;
        tooltipContainer.style('display', 'none');
        if (point === null) {
            tooltipContainer.style('display', 'none');
        }
        else {
            let data = point.data,
                x = data.x,
                y = data.y;
            data = data.data;
            let values = [['Horsepower', data.Horsepower], ['Acceleration', data.Acceleration]];
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
        }
    }

    redrawPolygon(polygon) {
        polygon
            .attr("d", function(d) {
                return d ? "M " + d.join("L") + " Z" : null;
            });
    }

    drawVoronoi () {
        let points = this.points,
            margin = this.margin;
        var polygon = this._svg.append("g")
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr("class", "polygons")
            .selectAll("path")
            .data(this.voronoi.polygons(points))
            .enter().append("path")
            .style('stroke-opacity', '.2')
            .style('stroke', '#FA8072')
            .call(this.redrawPolygon);
        this.polygon = polygon;
    }
}