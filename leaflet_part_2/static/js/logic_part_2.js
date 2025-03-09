// Initialize the map
let myMap = L.map('map', {
  center: [38.32, -95.91], // Centered near San Francisco
  zoom: 2
});

// Base maps
let satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
 });


let grayscaleMap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL.'
});

let outdoorMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: © <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
// Add the default base map
satelliteMap.addTo(myMap);

// Layer groups for overlays
let earthquakesLayer = new L.LayerGroup();
let tectonicPlatesLayer = new L.LayerGroup();

// Base maps object
let baseMaps = {
  "Satellite Map": satelliteMap,
  "Grayscale Map": grayscaleMap,
  "Outdoor Map": outdoorMap
};

// Overlay maps object
let overlayMaps = {
  "Earthquakes": earthquakesLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

// Add layer control
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Earthquake styling functions
function getColor(depth) {
  if (depth > 90) return "#8B0000"; // Dark red
  else if (depth > 70) return "#FF0000"; // Red
  else if (depth > 50) return "#FF6347"; // Tomato
  else if (depth > 30) return "#FFA500"; // Orange
  else if (depth > 10) return "#FFFF00"; // Yellow
  else return "#00FF00"; // Green
}

function getRadius(magnitude) {
  if (magnitude === 0) 
    return 1;
  else
  return magnitude * 2;
}

function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 0.7,
    fillColor: getColor(feature.geometry.coordinates[2]),
    color: "#000000",
    radius: getRadius(feature.properties.mag),
    stroke: true,
    weight: 0.5
  };
}

// Fetch and plot earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2] + " km");
    }
  }).addTo(earthquakesLayer).addTo(myMap);
});

// Fetch and plot tectonic plate data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
  L.geoJson(plateData, {
    color: "orange",
    weight: 2
  }).addTo(tectonicPlatesLayer).addTo(myMap);
});

// Add legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ["#00FF00", "#FFFF00", "#FFA500", "#FF6347", "#FF0000", "#8B0000"];
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML += "<i style='background: " + colors[i] + "; width: 30px; height: 20px; display: inline-block; margin-right: 5px;'></i> " +
      depths[i] + (depths[i + 1] ? "–" + depths[i + 1] + "<br>" : "+");
  }
  return div;
};
legend.addTo(myMap);