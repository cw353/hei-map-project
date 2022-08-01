/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

map.addControl(new L.Control.Fullscreen({
    title: {
      "false": "Enter fullscreen mode",
      "true": "Exit fullscreen mode",
    }
}));
map.addControl(L.control.zoom());
map.addControl(L.control.defaultExtent({ position: "topleft" }));  

const datagroupOverlays = allDatagroups
  .sort((a, b) => compare(a.name, b.name))
  .map((datagroup) => {
    return getChildLayerGroupOverlaySubtree(
      datagroup,
      {
        selectAllCheckbox: true,
        sort: true,
        collapsed: true,
      }
    )
  });

// add overlay control tree
const baseTree = {
  label: "Base Layers",
  children: [
    { label: "Open StreetMap", layer: osmtiles },
  ]
};

const overlayTree = [
  getChildLayerGroupOverlaySubtree(geoBoundaries, {
    radioGroupName: "geoboundaries",
    selectAllCheckbox: false,
  }),
  ...datagroupOverlays,
];

const layerControlTree = L.control.layers.tree(
  baseTree,
  overlayTree,
  {
    collapsed : true,
    hideSingleBase: true,
    collapseAll: "<span class='leafOverlayLayer'>Collapse all</span>",
    expandAll: "<span class='leafOverlayLayer'>Expand all</span>",
  }
);

const legend = L.control.collapsibleLegend({position: "bottomleft", className: "legend"}).addTo(map);
const heatmapLegendSection = "Heatmap";

const heatLayerControl = L.control.heatLayer({
  position: "topright",
  heatLayerOptions: {
    // generated from plasma colormap (https://github.com/BIDS/colormap, CC0 License) using scale-color-perceptual (https://github.com/politiken-journalism/scale-color-perceptual, ISC License) with the command "[0, 0.25, 0.5, 0.75, 1].map(scale.plasma)"
    gradient: { 0: "#0d0887", 0.25: "#7e03a8", 0.5: "#cb4679", 0.75: "#f89342", 1: "#f0f724" },
	  minOpacity: 0.08,
  },
  datagroups: [cityOwned, taxSale2019, taxSale2020, scavengerSale, schoolLocations, businessLicenses, crimes, userAddedMarkers],
  getMaxHeight: (mapHeight, topOffset) => { return (mapHeight >> 1) - (topOffset << 1) },
  toggleHeatLayerCallback: () => legend.toggleSection(heatmapLegendSection), // hide or show heatmap legend when heatmap is removed from or added to map, respectively
});

// add marker clusters legend (reference: https://leafletjs.com/examples/choropleth/)
const div1 = document.createElement("div");
const rangeBounds = [1, 10, 100];
const colors = ["rgba(110, 204, 57, 0.8)", "rgba(240, 194, 12, 0.6)", "rgba(241, 128, 23, 0.8)"];
for (let i = 0; i < rangeBounds.length; i++) {
  div1.innerHTML += `<p><i class='circle' style="background-color: ${colors[i]}"></i> ${rangeBounds[i]}` + (rangeBounds[i+1] ? `–${rangeBounds[i+1]} properties<br>` : "+ properties</p>");
}
legend.addSection(div1, "Marker Clusters");

// add redlining legend
const redliningLegendSection = "Redlining";
const redliningLayer = geoBoundaries.getChildLayer("HOLC Redlining in Chicago (with colors)").layer;
const div3 = document.createElement("div");
for (const item of Object.values(holcGrades).sort()) {
  div3.innerHTML += `<p><i class='square' style="opacity: 0.7; background-color: ${item.color}"></i> ${item.label}</p>`
}
legend.addSection(div3, redliningLegendSection);
!map.hasLayer(redliningLayer) && legend.toggleSection(redliningLegendSection); // hide initially if not on map
map.on("overlayadd overlayremove", (event) => event.layer === redliningLayer && legend.toggleSection(redliningLegendSection));

// add heatmap legend
const div2 = document.createElement("div");
div2.innerHTML = "<span class='gradientLabel', style='float: left'>Less<br>Dense</span>";
div2.innerHTML += "<span class='gradientLabel', style='float: right'>More<br>Dense</span>";
const gradient = heatLayerControl.getHeatLayerGradient();
const gradientColors = Object.keys(gradient).sort().map((intensity) => gradient[intensity]);
div2.innerHTML += `<i class='bar' style="background: linear-gradient(to right, ${gradientColors.join(", ")})"></i>`;
legend.addSection(div2, heatmapLegendSection);
legend.toggleSection(heatmapLegendSection); // hide initially

const geocoderControl = L.Control.geocoder({
  placeholder: "Search for a location...",
  errorMessage: "No results found.",
  showUniqueResult: false,
  defaultMarkGeocode: false,
  position: "topright",
}).on("markgeocode", function(e) {
  if (e.geocode && e.geocode.center) {
    map.setView(e.geocode.center, map.getMaxZoom());
	const div = L.DomUtil.create("div", "center");
	div.innerHTML = e.geocode.html;
    L.popup().setLatLng(e.geocode.center).setContent(div).openOn(map);
  }
});

heatLayerControl.addTo(map);
geocoderControl.addTo(map);
layerControlTree.addTo(map);
