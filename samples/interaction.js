// Get the data
d3.json("./cars.json", function(error, data) {
    if (error) throw error;
    data = data.filter(d => d.Origin === 'Europe');
    let plot = new ScatterPlot().data(data).width(870).height(500)
      .render(d3.select('body').append('svg'))

    let mouseHandler = (point) => {
          plot.highlightCircle(point);
          plot.tooltip(point);
      };

      plot.getInteractionLayer().on('mouseover', () => {
          mouseHandler(plot.getNearestPoint(d3.event));
      }).on('mousemove', () => {
          mouseHandler(plot.getNearestPoint(d3.event));
      });
  });