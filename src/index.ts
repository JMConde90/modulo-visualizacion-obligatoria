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
const affectedRadiusBasedScale = d3
  .scaleQuantile()
  .domain([0, maxAffected])
  .range([5,10,15,25,30,35,40]); //rango de valores a asiganr
                            //para el domino, hace tantas
                            //particiones como rangos se le
                            //indique

const affectedRadiusScale = d3
  .scaleQuantile()
  .domain([0, maxAffected])
  .range([5,10,15,25,30,35,40,45,50]); //rango de valores a asiganr
                           //para el domino, hace tantas
                          //particiones como rangos se le
                         //indique
                          
                          
const calculateRadiusBasedOnAffectedCases = (comunidad: string, currentStats: any[]) => {
  let size = 0;
  //para el caso base
  if(currentStats === statsBase){
    const entry = currentStats.find(item => item.name === comunidad);
    
    
    if(entry) {
        size = affectedRadiusBasedScale(entry.value);

    }
  }
  else{
    
      const entry = currentStats.find(item => item.name === comunidad);
      
      
      if(entry) {
          size = affectedRadiusScale(entry.value);
  
      }
    

  }

    
    
    return size;
  };

//inicializo la primera vez el currentStats al caso base
let currentStats = statsBase;


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  //color de fondo para el mapa
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);
//Selecciono todas las comunidades 
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // datos cargados del archivo json
  .attr("d", geoPath as any);

//Creo los circulos de afectados por cada comunidad (la primera vez )
svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  //fracciono la opacidad en los circulos para que se vea el fondo
  .attr("class", "affected-marker") 
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name,currentStats))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1])
  //actualizo los circulos para la transicion de caso base a caso 22Marzo
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