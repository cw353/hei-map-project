/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

// create map
const map = L.map("map", {
  center: { lat: 41.79153671046777, lng: -87.62755393981935 },
  zoom: 13,
  scrollWheelZoom: false,
  zoomControl: false,
});

map.attributionControl.addAttribution("&copy; " + getOpenInNewTabLink("https://github.com/cw353/", "Claire Wagner"));

// add tiles to map - reference: https://leafletjs.com/examples/layers-control/
const osmtiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: getOpenInNewTabLink("http://www.openstreetmap.org/copyright", "OpenStreetMap"),
}).addTo(map);

// marker cluster support group for all clusterable markers
const markerClusterSupportGroup = L.markerClusterGroup.layerSupport({
  maxClusterRadius: 50,
}).addTo(map);

// popup that describes marker cluster content when user mouses over marker cluster
markerClusterSupportGroup.on("clustermouseover", (a) => {
  a.layer.bindTooltip(
    getMarkerClusterTooltipContent(a.layer.getAllChildMarkers()),
  ).openTooltip();
});

const favoritedMarkers = new FavoritedMarkerGroup("hei-map-favorited-markers");