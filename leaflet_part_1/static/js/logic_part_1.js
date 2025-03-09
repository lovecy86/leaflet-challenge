// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
 attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map  with center and zoom options.
let myMap = L.map('map', {
  center: [38.32, -95.91], 
  zoom: 2
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquakesLayer = new L.LayerGroup();

let baseMaps = {
  "Satellite Map": basemap,
  "Street Map": streetmap
};

let overlayMaps = {
  "Earthquakes": earthquakesLayer,
};


// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
 
  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
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
  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "#8B0000";
    else if (depth > 70) return "#FF0000";
    else if (depth > 50) return "#FF6347";
    else if (depth > 30) return "#FFA500";
    else if (depth > 10) return "#FFFF00";
    else return "#00FF00";
   }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 2;

  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);

     },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depth = [-10, 10, 30, 50, 70, 90];
    let colors = ["#00FF00", "#FFFF00", "#FFA500", "#FF6347", "#FF0000", "#8B0000"];

   // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depth.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "; width: 30px; height: 20px; display: inline-block; margin-right: 5px;'></i> " +
        depth[i] + (depth[i + 1] ? "&ndash;" + depth[i + 1] + " <br>" : "+");
    }
    return div;
  };
  
  // Finally, add the legend to the map.
  legend.addTo(myMap);

});