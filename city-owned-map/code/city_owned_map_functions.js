/**
 * Functions for use with city-owned-map.html
 * @author Claire Wagner (Summer 2022 Wheaton College Research Team)
 */

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

function generateIconNew(color, pin) {
  const width = 35;
  const height = 35;
  return L.divIcon({
    className: "custom_divicon",
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [0,-(height/5)*4],
    html: savedPins.has(pin) ? getCheckMarkIcon(color, width, height) : getDefaultIcon(color, width, height)
  });
}

function getDefaultIcon(color, width, height) {
  // Modified from https://www.onlinewebfonts.com/icon/467222 (CC BY 3.0 license)
  return (
    `<svg
      width="${width}" height="${height}"
      x="0px" y="0px"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M4699.4,5003.3c-777.2-93.3-1379.9-346.8-1951.4-825c-746.1-621.8-1202.9-1597.5-1210.1-2575.6c-2.4-327.6,40.7-578.7,162.6-963.7c346.8-1095.3,1377.5-2896,2769.3-4837.8c432.9-607.4,495-657.6,643.3-540.4c150.7,119.6,1403.8,1953.8,1913.1,2798c746.1,1243.5,1210.1,2236,1367.9,2927.1c145.9,636.1,55,1363.1-253.5,2023.1c-471.1,1006.8-1387,1721.8-2482.3,1939.5C5438.4,4991.3,4874,5024.8,4699.4,5003.3z M5428.8,3307.8c461.5-141.1,846.6-552.4,959-1030.7c52.6-222.4,33.5-585.9-38.3-791.6c-119.6-339.6-385-640.9-703.1-798.7c-318.1-155.4-612.2-196.1-930.3-129.2c-667.2,141.1-1138.3,715-1140.7,1391.8c0,236.8,35.9,392.2,145.9,621.8c210.4,437.6,633.7,743.7,1107.2,791.6C5062.9,3386.7,5204,3374.7,5428.8,3307.8z"
        />
      </g></g>
    </svg>`
  );
};

function getStarIcon(color, width, height) {
  // Modified from https://www.onlinewebfonts.com/icon/467210 (CC BY 3.0 license)
  return (
    `<svg
      width="${width}" height="${height}"
      x="0px" y="0px"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M4294.7,5003.3c-858.6-102.8-1569-432.9-2128.6-990.2c-354-351.6-571.6-672.1-765.3-1119.3c-253.5-588.3-337.2-1308.3-215.3-1855.9c205.7-923.2,877.8-2250.6,2004.2-3960.6c571.6-870.6,1188.7-1738.8,1291.5-1820.1c143.5-110,212.9-55,586,464l234.4,325.3l-86.1,112.4c-122,157.8-287,514.2-351.6,751c-78.9,294.2-78.9,808.4,0,1100.2c69.4,253.5,210.5,557.2,349.2,748.6c122,172.2,406.6,452,571.6,564.5c181.8,124.4,495.1,260.7,724.7,315.7c212.9,52.6,609.9,74.1,880.2,45.4l117.2-12l129.2,296.6c162.6,373.1,325.3,861,377.9,1126.5c23.9,122,38.2,320.5,38.2,497.5c-2.4,1624-1179.1,3035.1-2798.3,3355.6C5033.7,4991.3,4469.3,5024.8,4294.7,5003.3z M4950,3329.1c389.9-95.7,743.8-385.1,918.4-751c119.6-253.5,157.9-442.5,143.5-712.7c-23.9-368.3-167.4-681.6-435.3-942.3c-241.6-236.8-645.8-401.8-983-401.8c-327.7,0-741.4,167.4-973.4,389.8c-282.2,270.3-420.9,576.4-442.5,973.4C3127.6,2848.4,4000.5,3558.7,4950,3329.1z"
        />
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M6794-715.3C6184.2-799,5626.9-1217.5,5371-1784.3c-119.6-260.7-153.1-428.1-153.1-755.8c0-327.7,33.5-495.1,155.5-760.6c421-932.8,1566.6-1339.4,2475.4-882.5c480.7,241.6,834.7,672.1,968.6,1181.5c69.4,258.3,69.4,664.9,2.4,920.8C8626.1-1363.4,8042.5-837.2,7313-724.8C7148-698.5,6939.9-696.1,6794-715.3z M7085.8-1660c14.4-16.7,57.4-126.7,100.5-241.6c117.2-327.6,86.1-303.7,368.3-303.7c413.7,0,435.3-28.7,181.8-232c-95.7-76.5-198.5-160.2-229.6-186.5l-57.4-47.8l71.7-263.1c40.6-145.9,74.1-277.5,74.1-294.2c0-74.1-83.7-45.5-308.5,105.2l-239.2,160.2l-243.9-160.2c-133.9-86.1-258.3-157.9-275-157.9c-19.2,0-33.5,23.9-33.5,55c0,43.1,76.5,346.8,129.2,514.2c9.6,31.1-43.1,86.1-212.9,220.1c-131.5,105.2-227.2,196.1-227.2,220s2.4,45.4,7.2,45.4c2.4,2.4,138.7,12,303.8,19.1l299,14.4l90.9,248.7C6997.3-1633.7,7030.8-1588.2,7085.8-1660z"
        />
      </g></g>
    </svg>`
  );
};

function getCheckMarkIcon(color, width, height) {
  // Modified from https://www.onlinewebfonts.com/icon/467207 (CC BY 3.0 license)
  return (
    `<svg
      width="${width}" height="${height}"
      x="0px" y="0px"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M4294.7,5003.3c-858.6-102.8-1569-432.9-2128.6-990.2c-354-351.6-571.6-672.1-765.3-1119.3c-253.5-588.3-337.2-1308.3-215.3-1855.9c205.7-923.2,877.8-2250.6,2004.2-3960.6c571.6-870.6,1188.7-1738.8,1291.5-1820.1c143.5-110,212.9-55,586,464l234.4,325.3l-86.1,112.4c-122,157.8-287,514.2-351.6,751c-78.9,294.2-78.9,808.4,0,1100.2c69.4,253.5,210.5,557.2,349.2,748.6c122,172.2,406.6,452,571.6,564.5c181.8,124.4,495.1,260.7,724.7,315.7c212.9,52.6,609.9,74.1,880.2,45.4l117.2-12l129.2,296.6c162.6,373.1,325.3,861,377.9,1126.5c23.9,122,38.2,320.5,38.2,497.5c-2.4,1624-1179.1,3035.1-2798.3,3355.6C5033.7,4991.3,4469.3,5024.8,4294.7,5003.3z M4950,3329.1c389.9-95.7,743.8-385.1,918.4-751c119.6-253.5,157.9-442.5,143.5-712.7c-23.9-368.3-167.4-681.6-435.3-942.3c-241.6-236.8-645.8-401.8-983-401.8c-327.7,0-741.4,167.4-973.4,389.8c-282.2,270.3-420.9,576.4-442.5,973.4C3127.6,2848.4,4000.5,3558.7,4950,3329.1z"
        />
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M6794-715.3C6184.2-799,5626.9-1217.5,5371-1784.3c-119.6-260.7-153.1-428.1-153.1-755.8c0-327.7,33.5-495.1,155.5-760.6c421-932.8,1566.6-1339.4,2475.4-882.5c480.7,241.6,834.7,672.1,968.6,1181.5c69.4,258.3,69.4,664.9,2.4,920.8C8626.1-1363.4,8042.5-837.2,7313-724.8C7148-698.5,6939.9-696.1,6794-715.3z M7887-2037.8c74.1-57.4,93.3-141.1,55-232c-16.8-35.9-239.2-275-495.1-526.2c-420.9-418.5-471.2-461.6-545.3-461.6c-74.1,0-119.6,35.9-435.3,353.9c-394.6,394.6-411.4,428.1-284.6,557.3c47.8,47.8,93.3,69.4,148.3,69.4c64.6,0,112.4-35.9,325.3-244l246.3-243.9l389.8,387.4C7714.8-1956.5,7755.5-1932.6,7887-2037.8z"
        />
      </g></g>
    </svg>`
  );
};


function getHeartIcon(color, width, height) {
  // Modified from https://www.onlinewebfonts.com/icon/467209 (CC BY 3.0 license)
  return (
    `<svg
      width="${width}" height="${height}"
      x="0px" y="0px"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M4294.7,5003.3c-858.6-102.8-1569-432.9-2128.6-990.2c-354-351.6-571.6-672.1-765.3-1119.3c-253.5-588.3-337.2-1308.3-215.3-1855.9c205.7-923.2,877.8-2250.6,2004.2-3960.6c571.6-870.6,1188.7-1738.8,1291.5-1820.1c143.5-110,212.9-55,586,464l234.4,325.3l-86.1,112.4c-122,157.8-287,514.2-351.6,751c-78.9,294.2-78.9,808.4,0,1100.2c69.4,253.5,210.5,557.2,349.2,748.6c122,172.2,406.6,452,571.6,564.5c181.8,124.4,495.1,260.7,724.7,315.7c212.9,52.6,609.9,74.1,880.2,45.4l117.2-12l129.2,296.6c162.6,373.1,325.3,861,377.9,1126.5c23.9,122,38.2,320.5,38.2,497.5c-2.4,1624-1179.1,3035.1-2798.3,3355.6C5033.7,4991.3,4469.3,5024.8,4294.7,5003.3z M4950,3329.1c389.9-95.7,743.8-385.1,918.4-751c119.6-253.5,157.9-442.5,143.5-712.7c-23.9-368.3-167.4-681.6-435.3-942.3c-241.6-236.8-645.8-401.8-983-401.8c-327.7,0-741.4,167.4-973.4,389.8c-282.2,270.3-420.9,576.4-442.5,973.4C3127.6,2848.4,4000.5,3558.7,4950,3329.1z"
        />
        <path
          fill="${color}"
          stroke="black"
          stroke-width="40px"
          d="M6794-715.3C6184.2-799,5626.9-1217.5,5371-1784.3c-119.6-260.7-153.1-428.1-153.1-755.8c0-327.7,33.5-495.1,155.5-760.6c421-932.8,1566.6-1339.4,2475.4-882.5c480.7,241.6,834.7,672.1,968.6,1181.5c69.4,258.3,69.4,664.9,2.4,920.8C8626.1-1363.4,8042.5-837.2,7313-724.8C7148-698.5,6939.9-696.1,6794-715.3z M6935.2-1748.5l107.6-52.6l100.4,52.6c315.7,160.2,708,26.3,877.8-299c50.3-98.1,62.2-155.5,62.2-289.4c0-265.5-45.4-339.6-492.7-794.1c-215.3-217.6-420.9-409-456.8-430.5c-126.8-64.6-177-28.7-631.4,430.5c-382.7,385.1-435.3,449.7-473.6,564.5c-50.2,153.1-40.7,380.3,23.9,504.7c81.3,162.6,248.7,306.1,418.5,361.1C6571.6-1667.1,6817.9-1693.4,6935.2-1748.5z"
        />
        </g></g>
    </svg>`
  );
};

/**
 * Helper function to create a new marker layer and add it to the specified marker layer Map.
 * @param key The key for the map entry.
 * @param name The name to associate with the marker layer.
 * @param color The color to associate with the marker layer.
 * @param parentMarkerCluster The marker cluster group to use as the parent (or null
 * if the markers in this layer should not be clustered).
 * @param markerLayerMap The Map of marker layers to which to add this layer.
 */
function addMarkerLayer(key, name, color, parentMarkerCluster, markerLayerMap) {
  markerLayerMap.set(key, {
    layer: parentMarkerCluster ? L.featureGroup.subGroup(parentMarkerCluster) : L.layerGroup(),
    name: name,
    color: color,
    markerCount: 0,
  });
}

/**
 * Helper function to add a new GeoJSON layer to the specified GeoJSON layer Map.
 * @param key The key for the map entry.
 * @param name The name to associate with the layer.
 * @param color The color to associate with the layer.
 * @param geoJSONLayerMap The Map of GeoJSON layers to which to add this layer.
 * @param layer The layer to add.
 */
function addGeoJSONLayer(key, name, color, geoJSONLayerMap, layer) {
  geoJSONLayerMap.set(key, {
    layer: layer,
    name: name,
    color: color,
  });
}


/**
 * Add a marker to the specified marker layer.
 * @param layerName The name of the marker layer object.
 * @param markerData An object containing the data for the marker (must include latitude and
 * longitude properties).
 * @param icon The icon for the marker.
 * @param markerLayer The layer object representing the layer to which to add the marker.
 * @param popupContent The content for the marker popup.
 * @return The marker.
 * Postcondition: The marker has been added to the specified marker layer and the markerCount
 * property for that layer has been incremented by one. The "marker" property of the data
 * object now points to the marker, and the "layerName" property of the data object now
 * holds the layer name.
 */
function addMarker(layerName, markerData, icon, markerLayer, popupContent) {
  const marker = L.marker([markerData.latitude, markerData.longitude], {
    icon: icon,
  })
    .bindPopup(popupContent)
    .addTo(markerLayer.layer);
  markerLayer.markerCount++;
  markerData.marker = marker;
  markerData.layerName = layerName;
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
 * @param overlays An iterable containing objects representing the overlays to add.
 * @param layerControl The layer control to which to add the overlays.
 * @param map The map to which to add the overlays.
 */
function addOverlaysToMap(overlays, layerControl, map) {
  // add each overlay in overlayMap to the map and the map's layer control
  for (const overlay of overlays) {
    layerControl.addOverlay(
      overlay.layer,
      getOverlayLabel(overlay.color, overlay.name, overlay.markerCount),
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
