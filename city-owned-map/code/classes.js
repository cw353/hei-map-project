class Datagroup {
  childLayers = new Map(); // map of LayerInfo objects
  constructor(name) {
    this.name = name;
  }
  addChildLayer(layerInfo) {
    this.childLayers.set(layerInfo.name, layerInfo);
  }
}

class MarkerDatagroup extends Datagroup {
  constructor(name, dataset, classify, getPopupContent) {
    super(name);
    this.dataset = dataset;
    this.classify = classify;
    this.getPopupContent = getPopupContent;
  }
  getData(identifier) {
    return dataset[identifier];
  }
}

class LayerInfo {
  constructor(name, color, layer, trackMarkerCount) {
    this.name = name;
    this.color = color;
    this.layer = layer;
    if (trackMarkerCount) {
      this.markerCount = 0;
    }
  }
}

class BoundaryLayerInfo extends LayerInfo {
  constructor(name, dataset, getTooltipText) {
    super(name, "black", null, false);
    this.defaultStyle = {
      color: this.color,
      weight: 2,
      opacity: 1,
      dashArray: "4",
      fillOpacity: 0,
    };
    this.layer = L.geoJSON(
      dataset,
      {
        style: this.defaultStyle,
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            layer.bindTooltip(getTooltipText(feature.properties), { className: "tooltip", sticky : true });
          }
        }
      }
    );
    const geojsonLayer = this.layer;
    // based on https://leafletjs.com/examples/choropleth/
    geojsonLayer.eachLayer(function (layer) {
      layer.on({
        mouseover: (event) => {
          const layer = event.target;
            layer.setStyle({
              color: "#262626",
                weight: 5,
                dashArray: "",
                fillOpacity: 0,
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              layer.bringToFront();
            }
          },
        mouseout: function(event) { geojsonLayer.resetStyle(event.target) },
      });
    });
  }
}
