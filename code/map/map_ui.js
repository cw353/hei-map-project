/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

const additionalMapControlsDiv = $("#additionalMapControls");
getToggleVisibilityButton(
  additionalMapControlsDiv, "+ Show Additional Map Controls", "- Hide Additional Map Controls", null,
).insertBefore(additionalMapControlsDiv.hide());

$("#pinSearchBarDiv").append(
  getPinSearchBar(
    map,
    pinSearchableDatagroups,
    markerClusterSupportGroup,
    (data) => userAddedMarkers.addSearchResult(data),
  )
);

const highlightSelectDiv = $("#highlightSelectDiv");
for (const item of highlightSelects) {
  highlightSelectDiv.append(
    $("<div></div>").addClass("formContainer")
      .append(item.highlightSelect.getHighlightSelectElement(item.sort, item.layerNames.map((layerName) => geoBoundaries.getChildLayer(layerName))))
  );
}

/*$("#toggleFillDiv").append(redliningToggleFill.getToggleFillElement(
  "redliningToggleFillCheckbox",
  `Show colors for \"HOLC Redlining in Chicago\" map layer (see ${getOpenInNewTabLink("https://dsl.richmond.edu/panorama/redlining/#text=intro", "Mapping Inequality")} for the meaning of these colors)`,
  "Show or hide colors for the \"HOLC Redlining in Chicago\" map layer",
  [geoBoundaries.getChildLayer("HOLC Redlining in Chicago")],
  () => legend.toggleSection(redliningLegendSection),
));*/

const radiiInputDiv = document.getElementById("radiiInputDiv");
for (const item of changeableRadiusDatagroups) {
  radiiInputDiv.appendChild(item.getRadiusInputElement());
}

const aboutMapTab = $("#aboutMapTab");
aboutMapTab.append([
  `<p class='italic'>This is a map of properties that may be of interest to Sunshine Gospel Ministries' ${getOpenInNewTabLink("https://www.sunshinegospel.org/hei/", "Housing Equity Initiative")} (HEI). This map was created by Claire Wagner, a member of the Wheaton College Summer 2022 Research Team. The ${getOpenInNewTabLink("https://github.com/cw353/hei-map-project", "source code")} for this map is licensed under the MIT License.</p>`,
  generatePluginsAttribution([
    { name: "Leaflet.markercluster", link: "https://github.com/Leaflet/Leaflet.markercluster", license: "MIT License" },
    { name: "Leaflet.MarkerCluster.LayerSupport", link: "https://github.com/ghybs/Leaflet.MarkerCluster.LayerSupport", license: "MIT License" },
    { name: "Leaflet.Control.Layers.Tree", link: "https://github.com/jjimenezshaw/Leaflet.Control.Layers.Tree", license: "BSD 3-Clause License"},
    { name: "Leaflet.fullscreen", link: "https://github.com/Leaflet/Leaflet.fullscreen", license: "ISC License" },
    { name: "Leaflet.defaultextent", link: "https://github.com/nguyenning/Leaflet.defaultextent", license: "MIT License", modified: true, },
    { name: "Leaflet.heat", link: "https://github.com/Leaflet/Leaflet.heat", license: "BSD 2-Clause \"Simplified\" License" },
    { name: "Leaflet Control Geocoder", link: "https://github.com/perliedman/leaflet-control-geocoder", license: "BSD 2-Clause \"Simplified\" License" },
  ], "italic"),
  generateMetadataTable("Data Used in This Map", allMetadata),
]);

$(".leaflet-popup-pane")
  .on("click", ".toggleFavoritedButton", (event) => {
    const target = $(event.target);
    const markerData = target.data("markerData");
    if (favoritedMarkers.has(markerData)) {
      favoritedMarkers.remove(markerData);
      target.text("Add to Favorited Markers");
    } else {
      favoritedMarkers.add(markerData);
      target.text("Remove from Favorited Markers");
    }
  })
  .on("click", ".removeSearchResultButton", (event) => {
    const markerData = $(event.target).data("markerData");
    userAddedMarkers.removeSearchResult(
      markerData,
      (markerData) => favoritedMarkers.remove(markerData), // remove from Favorited Markers if favorited
    );
  });

const favoritedMarkersTableDiv = $("#favoritedMarkersTableDiv");
const favoritedMarkersOverviewParagraph = $("#favoritedMarkersOverviewParagraph");
const favoritedMarkersDetailsDiv = $("#favoritedMarkersDetailsDiv");

favoritedMarkersTableDiv.on("click", ".showOnMapButton", (event) => {
  const markerData = $(event.target).data("markerData");
  $("#mapTabItem").trigger("click");
  showMarkerOnMap(map, markerData, markerClusterSupportGroup);
});

function generateFavoritedMarkersContent() {
  const numFavoritedMarkers = favoritedMarkers.size();
  favoritedMarkersOverviewParagraph.text(`You have ${numFavoritedMarkers} Favorited Marker${numFavoritedMarkers === 1 ? "" : "s"}.`);
  if (numFavoritedMarkers > 0) {
    favoritedMarkersTableDiv.html(generateFavoritedMarkersTable(favoritedMarkers.getAll()));
    favoritedMarkersDetailsDiv.show(0);
  } else {
    favoritedMarkersTableDiv.empty();
    favoritedMarkersDetailsDiv.hide(0);
  }
}

$("#favoritedMarkersButtonsDiv").append([
  $("<button type='button'>Delete All Favorited Markers</button>")
    .attr("title", "Permanently delete all Favorited Markers")
    .on("click", (event) => {
      if (favoritedMarkers.size() > 0 && window.confirm("Are you sure you want to delete all of your Favorited Markers?")) {
        favoritedMarkers.removeAll();
        generateFavoritedMarkersContent();
      }
    }),
  $("<button type='button'>Export All Favorited Markers</button>")
    .attr("title", "Export all Favorited Markers in JSON format")
    .on("click", (event) => {
      const toExport = JSON.stringify(
        favoritedMarkers.getAll().map((markerData) => {
          return {
            category: markerData.datagroup.name,
            subcategory: markerData.layerInfo.name,
            data: markerData.data,
          }
        })
      );
      downloadDataAsFile(toExport, "favorited_markers.json", "application/json");
    }),
]);

let restoreHeatLayer = false; // whether or not to restore heat layer after switching back to map tab

$("#tabDiv").append(getTabs([
  {
    label: "Map", id: "mapTabItem", tabContent: $("#mapTab"),
    prehide: () => {
      // remove heat layer to avoid problems with invalid map size
      if (heatLayerControl.removeHeatLayer()) {
        restoreHeatLayer = true;
      }
    },
    postshow: () => {
      map.invalidateSize(false);
      // restore heat layer if necessary
      if (restoreHeatLayer && heatLayerControl.addHeatLayer()) {
        restoreHeatLayer = false;
      }
    },
    initiallyActive: true,
  },
  { label: "About This Map", id: "aboutMapTabItem", tabContent: aboutMapTab, },
  { label: "Favorited Markers", id: "favoritedMarkersTabItem", tabContent: $("#favoritedMarkersTab"), postshow: generateFavoritedMarkersContent, }
]));
