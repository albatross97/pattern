/** Data path **/
const PTEN = './data/PTEN_gene_expression.json';
const TISSUE = './data/tissue_info.json';

/** Find the default sorting tag **/
const select = document.getElementById('sort-btns');
const defaultSortTag = document.querySelector(
  'input[name="btnradio"]:checked'
).id;

/** Create a bar chart svg and its tooltip **/
const width = 800;
const height = 600;
const margin = { top: 30, bottom: 30, left: 200, right: 30 };

const barsvg = d3
  .select('#bar-chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .call(responsivefy)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tooltip = d3
  .select('#bar-chart')
  .append('div')
  .style('opacity', 0)
  .attr('class', 'tooltip');

function responsivefy(svg) {
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style('width'), 10),
    height = parseInt(svg.style('height'), 10),
    aspect = width / height;

  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize);

  d3.select(window).on('resize.' + container.attr('id'), resize);

  function resize() {
    const targetWidth = parseInt(container.style('width'));
    svg.attr('width', targetWidth);
    svg.attr('height', Math.round(targetWidth / aspect));
  }
}

/** Load and process data **/
Promise.all([d3.json(PTEN), d3.json(TISSUE)])
  .then(function ([ptenData, tissueData]) {
    // in pten data, two properties are needed: tissueSiteDetailId, data
    const tissueRollup = d3.rollup(
      ptenData['geneExpression'],
      (group) => d3.median(group, (d) => d.data),
      (d) => d.tissueSiteDetailId
    );

    const tissueMedian = Array.from(
      tissueRollup,
      ([tissueSiteDetailId, median]) => ({
        tissueSiteDetailId: tissueSiteDetailId,
        median: median,
      })
    );

    // in tissue data, two properties are needed: tissueSiteDetailId, colorHex
    const tissueMedianWithColor = tissueMedian.map(
      ({ tissueSiteDetailId, median }) => {
        const augData = tissueData['tissueInfo'].find(
          (d) => d.tissueSiteDetailId === tissueSiteDetailId
        );
        return { tissueSiteDetailId, median, ...augData };
      }
    );
    return tissueMedianWithColor;
  })
  .then((tissueMedianWithColor) => {
    // init chart with default sorting
    updateChart(tissueMedianWithColor, defaultSortTag);

    // update chart when changing sorting method
    select.addEventListener('click', ({ target }) => {
      if (target.getAttribute('name') === 'btnradio') {
        const sortTag = target.id;
        updateChart(tissueMedianWithColor, sortTag);
      }
    });
  });

/** Update Bar Chart **/
function updateChart(tissueMedianWithColor, sortTag) {
  /** 1. Sort data based on sortTag (alphabet or median value) **/
  let dataSorted = [];
  if (sortTag === 'alphabet') {
    // tissueSiteDetailId, ascending alphabetically
    dataSorted = tissueMedianWithColor.sort((a, b) =>
      d3.ascending(a.tissueSiteDetailId, b.tissueSiteDetailId)
    );
  } else {
    // Median gene expression, descending by value
    dataSorted = tissueMedianWithColor.sort((a, b) =>
      d3.descending(a.median, b.median)
    );
  }

  /** 2. Create axis **/
  barsvg.selectAll('g').remove();
  const xValues = dataSorted.map((d) => Number(d.median));
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(xValues)])
    .range([0, width]);
  barsvg.append('g').call(d3.axisTop(x).ticks(6));

  const yValues = dataSorted.map((d) => d.tissueSiteDetailId);
  const y = d3.scaleBand().domain(yValues).range([0, height]).padding(0.15);
  barsvg
    .append('g')
    .attr('id', 'yAxis')
    .attr('transform', 'translate(-5, 0)')
    .call(d3.axisLeft(y).tickSize(0))
    .select('.domain')
    .remove();

  /** 3. Hover animation **/
  const mouseover = (event, d) => {
    barsvg
      .selectAll('rect')
      .filter((a) => a.tissueSiteDetailId !== d.tissueSiteDetailId)
      .style('opacity', 0.2);
    tooltip.transition().duration(200).style('opacity', 1);
    tooltip
      .html(
        `<div>
            <div>Tissue Site Detail: ${d.tissueSiteDetail}</div> 
            <div>Median: ${d3.format('(.1f')(d.median)}</div>
            <div>Tissue Site: ${d.tissueSite}</div>
            <div>eGene Count: ${d.eGeneCount}</div>
        </div>`
      )
      .style('left', event.pageX + 'px')
      .style('top', event.pageY + 'px');
  };
  const mouseout = (d) => {
    barsvg.selectAll('rect').style('opacity', 1);
    tooltip.transition().duration(200).style('opacity', 0);
  };

  /** 4. Bar Chart **/
  let rect = barsvg
    .selectAll('rect')
    .data(dataSorted)
    .join('rect')
    .attr('x', (d) => x(0))
    .attr('y', (d) => y(d.tissueSiteDetailId))
    .attr('width', (d) => x(d.median))
    .attr('height', y.bandwidth())
    .attr('fill', (d) => `#${d.colorHex}`)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout);
}
