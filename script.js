const tooltip = document.getElementById("tooltip");

// show tooltip
function showTip(e, d) {
  tooltip.style.display = "block";
  tooltip.style.left = (e.pageX + 10) + "px";
  tooltip.style.top = (e.pageY + 10) + "px";
  tooltip.innerHTML = d.title + "<br>" + d.artist;
}

function hideTip() {
  tooltip.style.display = "none";
}

// draw axes
function drawAxes(svg, x, y, isTimeChart = false) {
  let xAxis = d3.axisBottom(x);

  if (isTimeChart) {
    xAxis.tickValues(x.domain().filter((d, i) => i % 5 === 0));
  }

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(50,350)")
    .call(xAxis);

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(50,50)")
    .call(d3.axisLeft(y));
}

(function(){
  const svg = d3.select("#time");
  const g = svg.append("g").attr("transform","translate(50,50)");

  let data = d3.rollups(SONGS,v=>v.length,d=>d.year)
    .map(([year,count])=>({year,count}))
    .sort((a,b)=>a.year-b.year);

  let x = d3.scaleBand().domain(data.map(d=>d.year)).range([0,600]).padding(0.2);
  let y = d3.scaleLinear().domain([0,d3.max(data,d=>d.count)]).range([300,0]);

  drawAxes(svg, x, y, true);

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x",d=>x(d.year))
    .attr("y",d=>y(d.count))
    .attr("width",x.bandwidth())
    .attr("height",d=>300-y(d.count))
    .attr("fill","#2ecc71")
    .on("mousemove",(e,d)=>showTip(e,{title:"Year "+d.year,artist:"Count "+d.count}))
    .on("mouseleave",hideTip);
})();

(function(){
  const svg = d3.select("#genre");
  const g = svg.append("g").attr("transform","translate(150,50)");

  let data = d3.rollups(SONGS,v=>v.length,d=>d.genre)
    .map(([genre,count])=>({genre,count}))
    .sort((a,b)=>b.count-a.count)
    .slice(0,10);

  let y = d3.scaleBand().domain(data.map(d=>d.genre)).range([0,300]).padding(0.2);
  let x = d3.scaleLinear().domain([0,d3.max(data,d=>d.count)]).range([0,500]);

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(150,350)")
    .call(d3.axisBottom(x));

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y",d=>y(d.genre))
    .attr("width",d=>x(d.count))
    .attr("height",y.bandwidth())
    .attr("fill","#2ecc71")
    .on("mousemove",(e,d)=>showTip(e,{title:d.genre,artist:d.count+" songs"}))
    .on("mouseleave",hideTip);

  g.selectAll(".genre-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "genre-label")
    .attr("y", d=>y(d.genre) + y.bandwidth()/2 + 5)
    .attr("x", -10)
    .attr("text-anchor", "end")
    .text(d=>d.genre)
    .attr("fill","#ccc")
    .style("font-size", "14px");
})();

// scatter plot
function scatter(id, xKey, yKey) {
  const svg = d3.select(id);
  const g = svg.append("g").attr("transform","translate(70,50)");

  let x = d3.scaleLinear().domain([0,1]).range([0,800]);
  let y = d3.scaleLinear().domain([0,1]).range([300,0]);

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(70,350)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(70,50)")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", 470)
    .attr("y", 400)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaa")
    .text(xKey.charAt(0).toUpperCase() + xKey.slice(1));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -200)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaa")
    .text(yKey.charAt(0).toUpperCase() + yKey.slice(1));

  g.selectAll("circle")
    .data(SONGS)
    .enter()
    .append("circle")
    .attr("cx",d=>x(d[xKey]))
    .attr("cy",d=>y(d[yKey]))
    .attr("r",5)
    .on("mousemove",(e,d)=>showTip(e,d))
    .on("mouseleave",hideTip)
    .on("click",function(){
      d3.selectAll("circle").attr("r",5);
      d3.select(this).attr("r",10);
    });
}

scatter("#scatter1","energy","danceability");
scatter("#scatter2","valence","energy");

(function() {
  const svg = d3.select("#explore");
  const g = svg.append("g").attr("transform", "translate(70,50)");
  const countLabel = d3.select("#count");

  const genres = ["All", ...new Set(SONGS.map(d => d.genre))];
  d3.select("#genreFilter")
    .selectAll("option")
    .data(genres)
    .enter()
    .append("option")
    .text(d => d);

  let x = d3.scaleLinear().domain([0, 1]).range([0, 800]);
  let y = d3.scaleLinear().domain([0, 1]).range([300, 0]);

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(70,350)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(70,50)")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", 470)
    .attr("y", 400)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaa")
    .text("Energy");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -200)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaa")
    .text("Danceability");

  function update() {
    const selectedGenre = d3.select("#genreFilter").property("value");
    const energyVal = +d3.select("#energy").property("value");
    const danceVal = +d3.select("#dance").property("value");

    const filtered = SONGS.filter(d => {
      const matchGenre = selectedGenre === "All" || d.genre === selectedGenre;
      return matchGenre && d.energy >= energyVal && d.danceability >= danceVal;
    });

    const circles = g.selectAll("circle").data(filtered, d => d.title);

    circles.exit().remove();

    circles.enter()
      .append("circle")
      .attr("r", 6)
      .attr("fill", "#2ecc71")
      .attr("opacity", 0.7)
      .on("mousemove", (e, d) => showTip(e, d))
      .on("mouseleave", hideTip)
      .merge(circles)
      .transition()
      .duration(500)
      .attr("cx", d => x(d.energy))
      .attr("cy", d => y(d.danceability));

    countLabel.text(`Showing ${filtered.length} songs`);
  }

  d3.select("#genreFilter").on("change", update);
  d3.select("#energy").on("input", update);
  d3.select("#dance").on("input", update);

  update(); 
})();