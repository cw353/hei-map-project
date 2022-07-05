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