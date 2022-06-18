/**
 * Generate a custom icon with the specified fill color.
 * The icon is based on https://commons.wikimedia.org/wiki/File:Octicons-location.svg (MIT license).
 * Resources referenced: https://onestepcode.com/leaflet-markers-svg-icons/.
 * @param color The fill color.
 * @returns The custom icon with the specified fill color.
 */
function generateIcon(color) {
  const width = 24;
  const height = 48;
  return L.divIcon({
    className: "custom_divicon",
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [0,-(height/5)*4],
    html:
      `<svg
        width="${width}"
        height="${height}"
        viewBox="0 0 640 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M320 0c-177 0-320 143-320 320s160 416 320 704c160-288 320-527 320-704s-143-320-320-320z m0 448c-71 0-128-57-128-128s57-128 128-128 128 57 128 128-57 128-128 128z"
          fill=${color}
          stroke=black
          stroke-width=10px
        />
      </svg>`
  });
};

/**
 * Helper function to create a new marker layer and add it to the specified marker layer Map.
 * @param key The key for the map entry.
 * @param label The label to associate with the marker layer.
 * @param color The color to associate with the marker layer.
 * @param parentMarkerCluster The marker cluster group to use as the parent (or null
 * if the markers in this layer should not be clustered).
 * @param markerLayerMap The Map of marker layers to which to add this layer.
 */
function addMarkerLayer(key, label, color, parentMarkerCluster, markerLayerMap) {
  markerLayerMap.set(key, {
    layer: parentMarkerCluster ? L.featureGroup.subGroup(parentMarkerCluster) : L.layerGroup(),
    label: label,
    color: color,
    markerCount: 0,
  });
}

/**
 * Helper function to add a new GeoJSON layer to the specified GeoJSON layer Map.
 * @param key The key for the map entry.
 * @param label The label to associate with the layer.
 * @param color The color to associate with the layer.
 * @param geoJSONLayerMap The Map of GeoJSON layers to which to add this layer.
 * @param layer The layer to add.
 */
function addGeoJSONLayer(key, label, color, geoJSONLayerMap, layer) {
  geoJSONLayerMap.set(key, {
    layer: layer,
    label: label,
    color: color,
  });
}


/**
 * Add a marker to the specified marker layer.
 * @param layerName The name of the marker layer (used as a key to get the layer from
 * markerLayers).
 * @param pin The pin to which the marker corresponds.
 * @param pinData An object containing the data for the marker (must include latitude and
 * longitude properties).
 * @param popupContent The content for the marker popup.
 * @return The marker.
 * Postcondition: The marker has been added to the specified marker layer and the marker
 * property for that layer has been incremented by one. The "marker" property of the data
 * object now points to the marker, and the "layerName" property of the data object now
 * holds the layer name.
 */
function addMarker(layerName, pin, pinData, markerLayerMap, popupContent) {
  const markerLayer = markerLayerMap.get(layerName);
  const marker = L.marker([pinData.latitude, pinData.longitude], {
    icon: generateIcon(savedPins.has(pin) ? savedPinColor : markerLayer.color),
  })
    .bindPopup(popupContent)
    .addTo(markerLayer.layer);
  markerLayer.markerCount++;
  pinData.marker = marker;
  pinData.layerName = layerName;
}

/**
 * Helper function to generate the label for a layer.
 * @param color The color associated with the layer.
 * @param name The name of the layer.
 * @param markerCount The number of markers in the layer.
 */
function getOverlayLabel(color, name, markerCount) {
  // include the layer color and name in the overlay label
  let label = `<span style='color: ${color}'>&#9724;</span> ${name}`;
  // if the layer has a marker count greater than zero, include it in the overlay label
  if (markerCount && markerCount > 0) {
    label += ` (${markerCount} marker${markerCount > 1 ? "s" : ""})`;
  }
  return label;
}

/**
 * Helper function to add all overlays in the specified Map of overlays to the map and to
 * the map's layer control.
 * @param overlayMap The Map of overlays.
 * @param layerControl The layer control to which to add the overlays.
 * @param map The map to which to add the overlays.
 */
function addOverlaysToMap(overlayMap, layerControl, map) {
  // add each overlay in overlayMap to the map and the map's layer control
  for (const overlay of overlayMap.values()) {
    layerControl.addOverlay(
      overlay.layer,
      getOverlayLabel(overlay.color, overlay.label, overlay.markerCount),
    );
    overlay.layer.addTo(map);
  }
}

/**
 * Helper function to display a message to the user.
 * @param destination The element where the message should be displayed.
 * @param message The message to display.
 * @param color The color for the message.
 */
function displayMessage(destination, message, color) {
  destination.style.color = color;
  destination.innerText = message;
}

/**
 * Helper function to download data as file.
 * Based on https://stackoverflow.com/a/30832210 (CC BY-SA 3.0 license).
 * @param data The data to include in the file.
 * @param filename The name of the file to download.
 * @param type The MIME type of the data.
 */
function downloadDataAsFile(data, filename, type) {
  const file = new Blob([data], {type: type});
  const downloadLink = document.createElement("a");
  const url = URL.createObjectURL(file);
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
  setTimeout(function() {
    URL.revokeObjectURL(url);  
  }, 0);
}