function sunburstBarChart() {
  var edge = 400,
      maxBarValue = 5,
      rotation = -95 * Math.PI / 180;

  var radius = edge / 2,
      effectiveEdge = edge * 1.2,
      scale = d3.scale.linear().domain([0,maxBarValue + 2]);

  var partition = d3.layout.partition()
      .sort(null)
      .size([2 * Math.PI, radius * radius])
      .value(function(d) { return 1; });

  var arc = d3.svg.arc()
      .startAngle(function(d) { return d.x + rotation; })
      .endAngle(function(d) { return d.x + d.dx + rotation; })
      .innerRadius(function(d) {
        if(d.depth == 0) {
          d.yi = Math.sqrt(d.y);
        } else {
          d.yi = scale.range([Math.sqrt(d.dy), edge / 2.15])(d.depth);
        }
        return d.yi;
      })
      .outerRadius(function(d) { 
        if(d.depth == 0) {
          d.yo = Math.sqrt(d.y + d.dy);
        } else if(d.depth == maxBarValue + 1) {
          d.yo = edge / 2;
        } else {
          d.yo = scale.range([Math.sqrt(d.y + d.dy), edge / 2.15])(d.depth);
        }
        return d.yo;
      });

  var labelArc = d3.svg.arc()
      .startAngle(function(d) { return d.x + rotation; })
      .endAngle(function(d) { return d.x + d.dx + rotation; })
      .innerRadius(function(d, i) {
        return d3.scale.linear().domain([-1, d.textLines.length]).range([d.yi, d.yo])(i);
      })
      .outerRadius(function(d, i) { 
        return d3.scale.linear().domain([-1, d.textLines.length]).range([d.yi, d.yo])(i);
      });

  var oArc = d3.svg.arc()
      .startAngle(function(d) {
        return d.values[0].x + rotation;
      })
      .endAngle(function(d) {
        return d.values[d.values.length - 1].x + d.values[d.values.length - 1].dx + rotation;
      })
      .innerRadius(function(d) { d.yi = edge / 2; return d.yi; })
      .outerRadius(function(d) { d.yo = effectiveEdge * 0.96 / 2; return d.yo; });

  var outerLabelArc = d3.svg.arc()
      .startAngle(function(d) {
        return d.values[0].x + rotation;
      })
      .endAngle(function(d) {
        return d.values[d.values.length - 1].x + d.values[d.values.length - 1].dx + rotation;
      })
      .innerRadius(function(d, i) { 
        return d3.scale.linear().domain([0, d.values[0].textLines.length - 1]).range([d.yi * 1.05, d.yo * 0.9])(i);
      })
      .outerRadius(function(d, i) {
        //(edge / 2) + ((effectiveEdge - edge) * 0.12)
        return d3.scale.linear().domain([0, d.values[0].textLines.length - 1]).range([d.yi * 1.05, d.yo * 0.9])(i);
      });

  var chart = function(selection) {
    selection.each(function(data) {
      var root = getRoot(data);

      var svg = d3.select(this).append("svg")
        .attr("width", effectiveEdge)
        .attr("height", effectiveEdge)
        .append("g")
        .attr("transform", "translate(" + (effectiveEdge / 2) + "," + (effectiveEdge / 2) + ")");

      // Inner nodes including the last node for names
      var g = svg.datum(root).selectAll("path")
          .data(partition.nodes)
          .enter()
          .append("g");
      
      g.append("path")
        .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
        .attr("d", arc)
        .attr("class", function(d) { 
          var styleClass = "nodesBorder";
          if(d.depth && d.depth <= maxBarValue) {
            styleClass += " group-" + d.group + (d.on ? "-on" : "-off");
          } else if(d.depth == maxBarValue + 1) {
            styleClass += " labelTextBackground";
          }
          return styleClass;
        })
        .attr("fill-rule", "evenodd");

      // Add labels to the last arc
      g.filter(function(d) { return d.depth == maxBarValue + 1; })
        .selectAll(".labelPath")
        .data(function(d, i) { d.i = i; return Array(d.textLines.length).fill(d); })
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "none")
        .attr("id", function (d, i) {
          return "arc-label" + d.i + "-" + i;
        })
        .attr("d", labelArc);
      
      g.filter(function(d) { return d.depth == maxBarValue + 1; })
        .selectAll(".labelText")
        .data(function(d, i) { d.i = i; return Array(d.textLines.length).fill(d); })
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .append("textPath")
        .attr("class", "labelText")
        .attr("startOffset", "25%")
        .attr("xlink:href", function(d, i) {
          return "#arc-label" + d.i + "-" + i;
        })
        .text(function(d, i) {
          return d.textLines[d.textLines.length - 1 - i];
        });

      // Groups data for outer circle
      var groups = d3.nest()
          .key(function(d) { return d.group; })
          .entries(root.children);

      var og = svg.selectAll(".outerLabels")
          .data(groups, function(d, i) { return i; })
          .enter()
          .append("g");

      // Outer circle
      og.append("path")
        .attr("d", oArc)
        .attr("class", function(d, i) { return "outerCircleBorder group-" + (i + 1) + "-on";});

      // Outer labels
      og.selectAll(".outerLabelPath")
        .data(function(d, i) { d.i = i; return Array(d.values[0].textLines.length).fill(d); })
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "none")
        .attr("id", function (d, i) {
          return "outer-arc-label" + d.i + "-" + i;
        })
        .attr("d", outerLabelArc);
      
      og.selectAll(".outerLabelText")
        .data(function(d, i) { d.i = i; return Array(d.values[0].textLines.length).fill(d); })
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("class", "outerLabelText")
        .append("textPath")
        .attr("startOffset", "25%")
        .attr("xlink:href", function(d, i) {
          return "#outer-arc-label" + d.i + "-" + i;
        })
        .text(function(d, i) {
          return d.values[0].textLines[d.values[0].textLines.length - 1 - i];
          return d.key;
        });

      // Center labels
      var cg = svg.append("g");
      var yScale = d3.scale.linear().domain([-1, root.textLines.length]).range([-root.yo * 0.5, root.yo * 0.8]);

      cg.selectAll(".centerLabelText")
        .data(root.textLines)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", function(d, i) { return yScale(i); })
        .attr('text-anchor', 'middle')
        .attr("class", "centerLabelText")
        .text(function(d) { return d; });
    });
  };

  chart.edge = function(_) {
    if(arguments.length) {
      edge = _;
      effectiveEdge = edge * 1.2
      radius = edge / 2;
    }
    return chart;
  };

  chart.maxBarValue = function(_) {
    if(arguments.length) {
      maxBarValue = _;
      scale = d3.scale.linear().domain([0, maxBarValue + 2]);
    }
    return chart;
  };

  chart.rotation = function(_) {
    if(arguments.length) {
      rotation = _;
    }
    return chart;
  };

  function appendChild(parent, g, b, i, j) {
    var child = {};
    child.group = i + 1;
    child.textLines = g.textLines;
    
    if(j < b.value) {
      child.on = true;
    }
    parent.children = parent.children || [];
    parent.children.push(child);

    if(j < maxBarValue) {
      appendChild(parent.children[parent.children.length - 1], g, b, i, j+1);
    } else {
      child.textLines = b.textLines;
    }
  }

  function getRoot(data) {
    var root = {};

    root.textLines = data.textLines;
    root.children = [];

    data.groups.forEach(function(g, i) {
      g.bars.forEach(function(b) {
        appendChild(root, g, b, i, 0);
      });
    });

    return root;
  }

  return chart;
}
