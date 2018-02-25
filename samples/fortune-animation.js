Voronoi.canvas = document.getElementById('myCanvas');
Voronoi.init();
Voronoi.canvas.width = width;
Voronoi.canvas.height = height;
// Get the data
d3.json("./cars.json", function(error, data) {
    if (error) throw error;
    data = data.filter(d => d.Origin === 'Europe');
    let plot = new ScatterPlot().data(data).width(870).height(500);

    let points = plot.getDataPoints();
    Voronoi.sites = points.map(d => new Voronoi.Site(d.x, d.y));
    VoronoiAnimate(10, 100);
  });