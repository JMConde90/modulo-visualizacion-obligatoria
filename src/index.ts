import * as d3 from "d3";
import * as topojson from "topojson-client";
const d3Composite = require("d3-composite-projections");
const europejson = require("./europe.json");
const spainjson = require("./spain.json")

 import { stats22Marzo } from  "./stats";
// Esacala de colores para el numero de afectados por comunidad 
var color = d3
  .scaleThreshold<number, string>()
  .domain([200,500,700,1000,1500,1700,2000,2100,5000,10000])
  .range([
    "#ff0505",
    "#ff1919",
    "#ff2c2c",
    "#ff4040",
    "#ff5353",
    "#ff6767",
    "#ff7b7b",
    "#ff8e8e",
    "#ffa2a2",
    "#ffb6b6",
    "#ffc9c9",
    "#ffdddd",
    "#fff0f0"    
  ]);
  console.log(color)
/*
var color = d3
  .scaleThreshold<number, string>()
  .domain([0, 1, 100, 500, 700, 20000])
  .range([
    "#FFFFF",
    "#FFE8E5",
    "#F88F70",
    "#CD6A4E",
    "#A4472D",
    "#7B240E",
    "#540000"
  ]);
*/
//funcion para asignar colores a las comunidades
const assignRegionBackgroundColor = (RegionName: string) => {
  const item = stats22Marzo.find(
    item => item.name === RegionName
  );
  /*
  if (item) {
    console.log(item.value);
  }
  */
   //lo pongo el ternario por si hay fallo me devuelve color 0
  return item ? color(item.value) : color(0);
};



const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");
/*

*/
const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);


const geojson = topojson.feature(
  spainjson,
  spainjson.objects.ESP_adm1
);



svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country") //defino los bordes de las comunidades
  .style("fill", function(d: any) {
   // console.log(d.properties.geounit);
    return assignRegionBackgroundColor(d.properties.NAME_1);
  })
  // data loaded from json file
  .attr("d", geoPath as any);
