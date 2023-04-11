 // links to earthquake data and tectonic plate data 
 var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
 var tectonplateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// create layer groups for for earthquakes and technonic plates
var earthquakes = L.layerGroup();
var tectonicplates = L.layerGroup();

// Adding the tile layers (background maps)
var satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Define a baseMaps object to hold the base layers
var baseMaps = {
    "Satellite Map": satelliteMap,
    "Topography": topo
  };
  
// Create overlay object to hold the overlay layer
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicplates
  };

// Creating the map object with layers 
var myMap = L.map("map", {
    center: [40, -10],
    zoom: 2,
    layers: [satelliteMap, earthquakes]
  });

// Create a layer control to toggle between maps then add to map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// use d3 to load tectonic plate data
d3.json(tectonplateUrl).then(function(data) {
    L.geoJSON(data, {
      style: {
        color: "orange",
        weight: 1.5
      }
    }).addTo(tectonicplates);
    // add tectonic plate layer to map 
    tectonicplates.addTo(myMap);
  });

  // use d3 to load earthquake data 
  d3.json(earthquakeUrl).then(function(data){
    // marker size determined by magnitude
    function markerSize(magnitude) {
        return magnitude * 3.5;
    };
    // marker color determined by depth
    function markerColor(depth) {
            if (depth > 110) {
                return "brown"
            }
            else if (depth > 90) {
                return "red"
            }
            else if (depth > 70) {
                return "orangered"
            }
            else if (depth > 50) {
                return "orange"
            }
            else if (depth > 30) {
                return "gold"
            }
            else if (depth > 10) {
                return "yellow"
            }
            else {
                return "lightgreen"
            }
    }

    // create geoJSON layer containing features array
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng,
            // set style of marker based on magnitude
            {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                fillOpacity: 1.5,
                color: "white",
                stroke: true,
                weight: 0.5
            }
            );
        },
        // popup describing location, magnitude, and depth 
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Location: " + feature.properties.place + "<hr>Magnitude: " + feature.properties.mag
            + "<hr>Depth: " + feature.geometry.coordinates[2]);
        }
    }).addTo(earthquakes);
    // add earthquakes layer to map
    earthquakes.addTo(myMap);

    // add legend
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Depth</h4>";
        div.innerHTML += '<i style="background: brown"></i><span>>110</span><br>';
        div.innerHTML += '<i style="background: red"></i><span>>90</span><br>';
        div.innerHTML += '<i style="background: orangered"></i><span>>70</span><br>';
        div.innerHTML += '<i style="background: orange"></i><span>>50</span><br>';
        div.innerHTML += '<i style="background: gold"></i><span>>30</span><br>';
        div.innerHTML += '<i style="background: yellow"></i><span>>10</span><br>';
        div.innerHTML += '<i style="background: lightgreen"></i><span><10</span><br>'

       return div;

    };

    legend.addTo(myMap);

  });
