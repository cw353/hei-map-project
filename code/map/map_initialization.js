/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

const map = L.map("map", {
  center: { lat: 41.79153671046777, lng: -87.62755393981935 },
  zoom: 13,
  scrollWheelZoom: false,
  zoomControl: false,
  attributionControl: false,
});

// add attribution control manually to avoid bug with using setPosition to change position
map.addControl(
  L.control.attribution({position: "bottomleft"}).addAttribution("&copy; " + getOpenInNewTabLink("https://github.com/cw353/", "Claire Wagner"))
);

const osmtiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: getOpenInNewTabLink("http://www.openstreetmap.org/copyright", "OpenStreetMap"),
}).addTo(map);

// marker cluster support group for all clusterable markers
const markerClusterSupportGroup = L.markerClusterGroup.layerSupport({
  maxClusterRadius: 50,
}).addTo(map);

markerClusterSupportGroup.on("clustermouseover", (a) => {
  a.layer.bindTooltip(
    L.tooltip({offset: [15, 0]}).setContent(getMarkerClusterTooltipContent(a.layer.getAllChildMarkers()))
  ).openTooltip();
});

const favoritedMarkers = new FavoritedMarkerGroup(true, "hei-map-favorited-markers");
