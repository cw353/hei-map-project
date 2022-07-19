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

const legend = L.control({position: "bottomright"});

const gradients = {
  viridis1: { 0: "#440154", 0.25: "#3b528b", 0.5: "#21908d", 0.75: "#5bc864", 1: "#fbe723", },
  magma1: { 0: "#000004", 0.25: "#50127c", 0.5: "#b5367a", 0.75: "#fb8661", 1: "#fcfbbd", },
  inferno1: { 0: "#000004", 0.25: "#56106e", 0.5: "#ba3655", 0.75: "#f98c0b", 1: "#fafda1", },
  plasma1: { 0: "#0d0887", 0.25: "#7e03a8", 0.5: "#cb4679", 0.75: "#f89342", 1: "#f0f724", },
  viridis2: { 0.4: "#2a788e", 0.6: "#22a785", 0.7: "#42be71", 0.8: "#78d153", 1: "#fbe723", },
  magma2: { 0.4: "#8c2981", 0.6: "#dd4869", 0.7: "#f66e5c", 0.8: "#fe9d6c", 1: "#fcfbbd" },
  inferno2: { 0.4: "#932667", 0.6: "#dc503b", 0.7: "#f3761b", 0.8: "#fca309", 1: "#fafda1", },
  plasma2: { 0.4: "#b12a90", 0.6: "#e06363", 0.7: "#f1834c", 0.8: "#fca537", 1: "#f0f724", },
};

const heatLayerControl = L.control.heatLayer({
  position: "topleft",
  heatLayerOptions: {
    // generated from plasma colormap (https://github.com/BIDS/colormap, CC0 License) using scale-color-perceptual (https://github.com/politiken-journalism/scale-color-perceptual, ISC License) with the command "[0, 0.25, 0.5, 0.75, 1].map(scale.plasma)"
    gradient: { 0: "#0d0887", 0.25: "#7e03a8", 0.5: "#cb4679", 0.75: "#f89342", 1: "#f0f724" },
  },
  datagroups: [cityOwned, taxSale2019, taxSale2020, scavengerSale, schoolLocations, businessLicenses, crimes, userAddedMarkers],
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

layerControlTree.addTo(map);
legend.addTo(map);
heatLayerControl.addTo(map);