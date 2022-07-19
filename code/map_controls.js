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
).addTo(map);

const legend = L.control({position: "bottomleft"});

const heatLayerControl = L.control.heatLayer({
  position: "topleft",
  heatLayerOptions: {
    gradient: {.4:"blue", .6:"cyan",.7:"lime",.8:"yellow",1:"red"}, // based on https://github.com/Leaflet/Leaflet.heat/blob/gh-pages/dist/leaflet-heat.js
  },
  datagroups: [cityOwned, taxSale2019, taxSale2020, scavengerSale, schoolLocations, businessLicenses, crimes, userAddedMarkers],
  getBottomOffset: () => {
    return 30 + (legend._container.offsetParent
      ? legend._container.offsetParent.clientHeight
      : 0);
  },
});

// reference: https://leafletjs.com/examples/choropleth/
legend.onAdd = function(map) {
  const rangeBounds = [1, 10, 100];
  const colors = ["rgba(110, 204, 57, 0.8)", "rgba(240, 194, 12, 0.6)", "rgba(241, 128, 23, 0.8)"];
  const div = L.DomUtil.create("div", "legend leaflet-bar");
  div.innerHTML = "<header>Marker Clusters</header>";
  for (let i = 0; i < rangeBounds.length; i++) {
    div.innerHTML += `<p><i class='circle' style="background-color: ${colors[i]}"></i> ${rangeBounds[i]}` + (rangeBounds[i+1] ? `–${rangeBounds[i+1]} properties<br>` : "+ properties</p>");
  }
  div.innerHTML += "<hr><header>Heatmap</header>";
  div.innerHTML += "<span class='gradientLabel', style='float: left'>Less<br>Dense</span>";
  div.innerHTML += "<span class='gradientLabel', style='float: right'>More<br>Dense</span>";
  const gradient = heatLayerControl.getHeatLayerGradient();
  const gradientColors = Object.keys(gradient).sort().map((intensity) => gradient[intensity]);
  div.innerHTML += `<i class='bar' style="background: linear-gradient(to right, ${gradientColors.join(", ")})"></i>`;
  return div;
}
legend.addTo(map);
heatLayerControl.addTo(map);