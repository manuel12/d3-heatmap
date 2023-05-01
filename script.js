const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// Create heading with id="title"
d3.select(".container")
  .append("h1")
  .attr("id", "title")
  .text("Global Monthly Temperature");

// Create heading with id="description"
d3.select(".container")
  .append("h3")
  .attr("id", "description")
  .text("1753 - 2015: base temperature");

const margin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30,
};

const legendRectHeight = 33;

const getMonthName = d3.utcFormat("%B");

d3.json(url)
  .then((data) => callback(data))
  .catch((err) => console.error(err));

const callback = (data) => {
  const width = 5 * Math.ceil(data.monthlyVariance.length / 12);
  const height = 40 * 12;

  // Create svg
  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create tooltip
  const tooltip = d3
    .select(".container")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

  data.monthlyVariance.forEach((item) => (item.month -= 1));

  const sampleData = data.monthlyVariance;

  const yearsArray = sampleData.map((item) => item.year);

  // Create and append x-axis
  const xScale = d3.scaleBand().domain(yearsArray).range([0, width]).padding(0);
  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickValues(xScale.domain().filter((year) => year % 10 === 0));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr(
      "transform",
      "translate(" + (margin.left + margin.right) + ", " + height + ")"
    )
    .call(xAxis);

  // Create and append y-axis
  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([0, height]);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yScale.domain())
    .tickFormat((month) => {
      const date = new Date(0);
      date.setUTCMonth(month);
      return getMonthName(date);
    });

  svg
    .append("g")
    .attr("id", "y-axis")
    .call(yAxis)
    .attr(
      "transform",
      "translate(" + (margin.left + margin.right) + ", " + 0 + ")"
    );

  // Min and Max temps
  const varianceArray = sampleData.map((item) => item.variance);
  const minTemp = data.baseTemperature + Math.min.apply(null, varianceArray);
  const maxTemp = data.baseTemperature + Math.max.apply(null, varianceArray);

  // Color scale
  colorScale = d3
    .scaleSequential()
    .domain([maxTemp, minTemp])
    .interpolator(d3.interpolateRdYlBu);

  // Create legend SVG
  const legendSvg = d3
    .select(".container")
    .append("svg")
    .attr("id", "legendSvg")
    .attr("class", "legendSvg")
    .attr("transform", "translate(" + 100 + ", " + 50 + ")");

  // Create legend
  const legend = legendSvg
    .append("g")
    .attr("id", "legend")
    .attr("class", "legend");

  const legendXScale = d3
    .scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, 400]);

  console.log(legendXScale);

  const legendXAxis = d3
    .axisBottom()
    .scale(legendXScale)
    .tickSize(20)
    .tickPadding(5);

  const domain = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  domain.map((item) => {
    console.log(legendXScale(item));
  });

  //Add legend rects
  legend
    .append("g")
    .selectAll("rect")
    .data([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    .enter()
    .append("rect")
    .attr("x", (d) => legendXScale(d))
    .style("width", 33)
    .style("height", legendRectHeight)
    .style("fill", (d) => colorScale(d));

  // Add legend xAxis
  legend
    .append("g")
    .call(legendXAxis)
    .attr("transform", "translate(0, " + legendRectHeight + ")");

  // Chart
  svg
    .append("g")
    .classed("map", true)
    .attr(
      "transform",
      "translate(" + (margin.left + margin.right) + "," + 0 + ")"
    )
    .selectAll("rect")
    .data(sampleData)
    .enter()
    .append("rect")
    .attr("class", "cell")

    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => (data.baseTemperature + d.variance).toFixed(2))

    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))

    .attr("width", (d) => xScale.bandwidth(d.year))
    .attr("height", (d) => yScale.bandwidth(d.month))

    .attr("fill", (d) => colorScale(data.baseTemperature + d.variance))

    .on("mouseover", function (e, d) {
      d3.select(this).style("fill", "rgb(0, 209, 84)");

      const html = `<p>Year: ${d.year}</p> 
      <p>Month: ${getMonthName(d.month)}</p> 
      <p>Total Temperature: ${(data.baseTemperature + d.variance).toFixed(
        2
      )}</p>
      <p>Variance: ${d.variance}</p>`;
      tooltip.html(html);
      tooltip
        .attr("data-year", () => d.year)
        .style("left", e.pageX + "px")
        .style("top", e.pageY + "px")
        .style("opacity", 0.8);
    })
    .on("mouseout", function (e, d) {
      d3.select(this).style(
        "fill",
        colorScale(data.baseTemperature + d.variance)
      );
      tooltip.style("opacity", 0);
    });
};
