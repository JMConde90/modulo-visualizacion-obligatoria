import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { statsBase } from "./stats";
import { stats22Marzo } from "./stats";

//Define  a function to calculate maximum number of people in to communities it affected with covid-19.
const maxAffected = statsBase.reduce(
  (max, item) => (item.value > max ? item.value : max),
  0
);
// Define the circles scale to show
const affectedRadiusBasedScale = d3
  .scaleQuantile()
  .domain([0, maxAffected])
  // the number of the partitions are assigned by discrete range.
  .range([5,10,15,25,30,35,40]); 


                            
const affectedRadiusScale = d3
  .scaleQuantile()
  .domain([0, maxAffected])
  .range([5,10,15,25,30,35,40,45,50]); 
 
                          
                          
const calculateRadiusBasedOnAffectedCases = (comunidad: string, currentStats: any[]) => {
  let size = 0;
  
  if(currentStats === statsBase){// if it base case
    const entry = currentStats.find(item => item.name === comunidad);
    
    
    if(entry) {
        size = affectedRadiusBasedScale(entry.value);

    }
  }
  else{// if it the other case
    
      const entry = currentStats.find(item => item.name === comunidad);
      
      
      if(entry) {
          size = affectedRadiusScale(entry.value);
  
      }
    

  }

    
    
    return size;
  };

//initialize the currentStats in to  base case.
let currentStats = statsBase;


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  // background colour behind the map.
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);
//select all the communities
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // upload data json
  .attr("d", geoPath as any);

//Created the affected circles for each community. (initialize the first time).
svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  //Opacity fraction for allow show the background.
  .attr("class", "affected-marker") 
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name,currentStats))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1])
  //Actualize the circles for the transaction the base case to case 22Marzo.
  const updateCircles = (data: any[]) => {
    const circles = svg.selectAll("circle");
    circles
      .data(latLongCommunities)
      .merge(circles as any)
      .transition()
      .duration(500)
      .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name, data));
  };

  document
  .getElementById("base")
  .addEventListener("click", function handleResultsBase() {
    updateCircles (statsBase );
  });

  document
  .getElementById("22marzo")
  .addEventListener("click", function handleResults22Marzo() {
    updateCircles (stats22Marzo);
  });