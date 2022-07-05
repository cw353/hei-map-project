/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

// source: Sasha Trubetskoy, https://sashamaps.net/docs/resources/20-colors/
const colors = [
  "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
  "#469990", "#dcbeff", "#9A6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9",
];
let nextColor = 0;

function getParentOverlayLabel(name) {
  return (
    `<span class='parentLayer'>${name}</span>`
  );
}

function getLayerInfoOverlayChild(layerInfo, options) {
  let label = "";
  if (layerInfo.color != null) {
    label += `<span style='color: ${layerInfo.color};'>&#9724;</span> `;
  }
  label += `<span class=${options && "labelClassName" in options ? options.labelClassName : "leafLayer"}>${layerInfo.name}`;
  if ("markerCount" in layerInfo && layerInfo.markerCount > 0) {
    label += ` (${layerInfo.markerCount}  marker${layerInfo.markerCount > 1 ? "s" : ""})`;
  }
  label += "</span>";
  return {
    label: label,
    layer: layerInfo.layer,
    radioGroup: options && "radioGroupName" in options ? options.radioGroupName : "",
  };
}

function getDatagroupOverlaySubtree(datagroup, options) {
  const children = [];
  // sort child layers if sortFunction is provided in options
  const childLayerKeys = options && (options.sortFunction != null)
    ? [...datagroup.childLayers.keys()].sort(options.sortFunction)
    : datagroup.childLayers.keys();
  // generate a leaf overlay object for each child
  for (const key of childLayerKeys) {
    const layerInfo = datagroup.childLayers.get(key);
    children.push(getLayerInfoOverlayChild(layerInfo, options));
  }
  return {
    label: getParentOverlayLabel(datagroup.name),
    selectAllCheckbox: options && options.selectAllCheckbox,
    collapsed: options && options.collapsed,
    children: children,
  };
}

function setUpRadiusInput(circleMarker, inputElement, applyChangesButton, messageElement) {
  // allow the user to change the radius of circleMarker
  inputElement.value = circleMarker.getRadius() / 1000; // meters to kilometers
  applyChangesButton.addEventListener("click", (event) => {
    const newRadius = parseFloat(inputElement.value);
    if (!isNaN(newRadius)) {
      // valid float
      circleMarker.setRadius(newRadius * 1000); // kilometers to meters
      inputElement.classList.replace("invalidInput", "validInput");
      displayMessage(messageElement, `Success! The radius has been set to ${newRadius} km.`, "green");
    } else {
      // invalid float
      inputElement.classList.replace("validInput", "invalidInput");
      displayMessage(messageElement, "Error: input must be a valid number.", "red");
    }
  });
}

function addDatagroupToMap(datagroup, getNewLayer, trackMarkerCount) {
  const dataIterator = datagroup.dataIterator();
  for (const datum of dataIterator) {
    const classification = datagroup.classify(datum);
    // if the LayerInfo object corresponding to classification doesn't exist yet, create it
    if (!(childLayers.has(classification))) {
      childLayers.addChildLayer(new LayerInfo(
          classification,
          colors[nextColor++ % colors.length],
          getNewLayer(),
          trackMarkerCount
      ));
    }
    // add marker to layer
    addMarkerToLayer(datum, childLayers.get(classification));
  }
}

function addMarkerToLayer(data, layerInfo) {
  const marker = L.marker([data.latitude, data.longitude], {
    icon: generateIcon(layerInfo.color),
  });
  layerInfo.layer.addLayer(marker);
  if (layerInfo.markerCount != null) {
    layerInfo.markerCount++;
  }
  markerData.marker = marker;
  markerData.layerInfo = layerInfo;
  marker.bindPopup(layerInfo.datagroup.getPopupContent(markerData));
}
