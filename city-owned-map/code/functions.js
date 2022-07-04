function getParentOverlayLabel(name) {
  return (
    `<span class='parentLayer'>${name}</span>`
  );
}

function getLeafOverlayLabel(layerInfo) {
  let label = "";
  if (layerInfo.color != null) {
    label += `<span style='color: ${layerInfo.color}'>&#9724;</span>`;
  }
  label += `<span class='leafLayer'> ${layerInfo.name}`;
  if ("markerCount" in layerInfo && layerInfo.markerCount > 0) {
    label += ` (${layerInfo.markerCount}  marker${layerInfo.markerCount > 1 ? "s" : ""})`;
  }
  label += "</span>";
  return label;
}

function getDatagroupOverlaySubtree(datagroup, options) {
  const children = [];
  // sort child layers if sortFunction is provided in options
  const childLayerKeys = options.sortFunction != null
    ? [...datagroup.childLayers.keys()].sort(options.sortFunction)
    : datagroup.childLayers.keys();
  // generate a leaf overlay object for each child
  for (const key of childLayerKeys) {
    const layerInfo = datagroup.childLayers.get(key);
    children.push({
      label: getLeafOverlayLabel(layerInfo),
      layer: layerInfo.layer,
      radioGroup: "radioGroupName" in options ? options.radioGroupName : "",
    });
  }
  return {
    label: getParentOverlayLabel(datagroup.name),
    selectAllCheckbox: options.selectAllCheckbox,
    collapsed: options.collapsed,
    children: children,
  };
}