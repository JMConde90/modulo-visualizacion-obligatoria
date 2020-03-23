import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { statsBase } from "./stats";
import { stats22Marzo } from "./stats";

//Se calcula el numero maxima de afectados de todas
//las comunidades
const maxAffected = statsBase.reduce(
  (max, item) => (item.value > max ? item.value : max),
  0
);
// creo los circulos para mostrar
const affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([0, 50]); // 50 pixel max radius, we could calculate it relative to width and height

const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
  const entry = statsBase.find(item => item.name === comunidad);

  return entry ? affectedRadiusScale(entry.value) : 0;
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);
//Selecciono todos las comunidades 
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);

//Creo los circulos de afectados por cada comunidad
svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1])
  
  const updateCircles = (data: any[]) => {
    const circles = svg.selectAll("circle");
    circles
      .data(latLongCommunities)
      .merge(circles as any)
      .transition()
      .duration(500)
      .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name));
  };
  const updateChart = (data: any[]) => {
    d3.selectAll("path")
      .data(calculateRadiusBasedOnAffectedCases(data))
      .transition()
      .duration(500)
      .attr("d", <any>arc);
  };

  document
  .getElementById("base")
  .addEventListener("click", function handleResultsBase() {
  console.log('He llegado');
    updateCircles (statsBase );
  });

  document
  .getElementById("22marzo")
  .addEventListener("click", function handleResults22Marzo() {
    console.log('He llegado');
    updateCircles (stats22Marzo);
  });