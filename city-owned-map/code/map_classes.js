/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

class ColorGenerator {
  // source: Sasha Trubetskoy, https://sashamaps.net/docs/resources/20-colors/
  static colors = [
    "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
    "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
    "#469990", "#dcbeff", "#9A6324", "#fffac8", "#800000",
    "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9",
  ];
  static numberOfColors = ColorGenerator.colors.length;
  constructor() {
    this.nextColor = 0;
    this.getNextColor = () => {
      return ColorGenerator.colors[this.nextColor++ % ColorGenerator.numberOfColors];
    }
  }
}

class Datagroup {
  childLayers = new Map(); // map of LayerInfo objects
  constructor(name) {
    this.name = name;
  }
  addChildLayer(layerInfo) {
    this.childLayers.set(layerInfo.name, layerInfo);
  }
  getChildLayer(layerName) {
    return this.childLayers.has(layerName) ? this.childLayers.get(layerName) : undefined;
  }
}

class MarkerData {
  constructor(markerData, datagroup, layerInfo, marker) {
    this.markerData = markerData;
    this.datagroup = datagroup;
    this.layerInfo = layerInfo;
    this.marker = marker;
  }
}

class Dataset {
  constructor(data, attribution, identifierField) {
    this.data = data;
    this.attribution = attribution;
    this.identifierField = identifierField;
  }
  // can be overriden
  *dataIterator() {
    for (const key of Object.keys(this.data)) {
      yield this.data[key];
    }
  }
}

class MarkerDataDatagroup extends Datagroup {
  constructor(name, dataset) {
    super(name);
    this.dataset = dataset;
    this.markerData = new Map(); // map of MarkerData objects
  }
  hasMarkerData(identifier) {
    return this.markerData.has(identifier);
  }
  getMarkerData(identifier) {
    return this.hasMarkerData(identifier) ? this.markerData.get(identifier) : undefined;
  }
  #setMarkerData(identifier, markerData) {
    this.markerData.set(identifier.toString(), markerData);
  }
  addMarker(identifier, data, layerInfo, popupContent, getMarker) {
    const marker = getMarker
      ? getMarker([data.latitude, data.longitude], this, layerInfo)
      : new L.marker([data.latitude, data.longitude], { icon: generateIcon(layerInfo.color) });
    layerInfo.addLayer(marker);
    if (popupContent != null) {
      marker.bindPopup(popupContent, { maxHeight: 200, });
    }
    this.#setMarkerData(identifier, new MarkerData(
      data,
      this,
      layerInfo,
      marker,
    ));
  }
}

class ClassifiableMarkerDataDatagroup extends MarkerDataDatagroup {
  constructor(name, dataset, classify, getPopupContent, options) {
    super(name, dataset);
    this.classify = classify;
    this.getPopupContent = getPopupContent;

    for (const datum of this.dataset.dataIterator()) {
      const classification = this.classify(datum);
      // if the LayerInfo object corresponding to classification doesn't exist yet, create it
      if (!(this.childLayers.has(classification))) {
        this.addChildLayer(new LayerInfo(
          classification,
          "getColor" in options ? options.getColor() : "black",
          "getLayer" in options ? options.getLayer(this.dataset.attribution) : L.layerGroup([], { attribution : this.dataset.attribution }),
          options.trackMarkerCount,
        ));
      }
      const layerInfo = this.getChildLayer(classification);
      this.addMarker(
        datum[this.dataset.identifierField],
        datum,
        layerInfo,
        this.getPopupContent(datum),
        options.getMarker,
      );
    }
  }
}

class MarkerAndCircleDatagroup extends MarkerDataDatagroup {
  constructor(name, dataset, options) {
    super(name, dataset);
    this.markerName =  "markerName" in options ? options.markerName : name;
    this.circleName =  "circleName" in options ? options.circleName : `Circle around ${name}`;
    const markerColor = "markerColor" in options ? options.markerColor : "black";
    const circleColor = "circleColor" in options ? options.circleColor : "black";
    // add child layer for marker
    this.addChildLayer(new LayerInfo(
      this.markerName,
      markerColor,
      "getMarkerLayer" in options ? options.getMarkerLayer(this.dataset.attribution) : L.layerGroup([], { attribution: this.dataset.attribution }),
      options.trackMarkerCount,
    ));
    const data = this.dataset.data;
    this.addMarker(
      data[this.dataset.identifierField],
      data,
      this.getChildLayer(this.markerName),
      "markerPopupContent" in options ? options.markerPopupContent : null,
    )
    // add child layer for circle
    this.addChildLayer(new LayerInfo(
      this.circleName,
      circleColor,
      L.circle([data.latitude, data.longitude], {
        attribution: this.dataset.attribution,
        color: circleColor,
        radius: "initialRadius" in options ? options.initialRadius : 3000,
        fillOpacity: "circleFillOpacity" in options ? options.circleFillOpacity : 0.15,
      }),
      false,
    ));
  }
  *dataIterator() {
    yield this.dataset.data;
  }
  getRadiusInputElement() {
    const circle = this.getChildLayer(this.circleName).layer;
    const inputElement = $("<input type='number' min='0'/>")
      .addClass("radiusInput validInput")
      .val(circle.getRadius() / 1000) // meters to kilometers
      .get(0);
    const messageElement = $("<span></span>").addClass("successMessage");
    const applyChangesButton = $("<button type='button'>Set Radius</button>")
      .addClass("smallHorizontalMargin")
      .on("click", (event) => {
        messageElement.html("");
        const newRadius = parseFloat(inputElement.value);
        if (inputElement.validity.rangeUnderflow) {
          inputElement.setCustomValidity("Please enter a positive number.");
          inputElement.reportValidity();
        } else if (isNaN(newRadius)) {
          inputElement.setCustomValidity("Please enter a valid number.");
          inputElement.reportValidity();
        } else {
          inputElement.setCustomValidity("");
          circle.setRadius(newRadius * 1000); // kilometers to meters
          messageElement.text(`Success! The radius has been set to ${newRadius} km.`);
        }
      }
    );
    return $(`<div></div>`).addClass("formContainer")
      .append([
        $(`<label>Set radius of circle around ${this.markerName} (in kilometers): </label>`).append(inputElement),
        applyChangesButton,
        messageElement,
      ])
      .get(0);
  }
}

class MarkerDatasetDatagroup extends Datagroup {
  constructor(name, dataset, attribution, classify, getPopupContent, getNewLayer, trackMarkerCount) {
    super(name);
    this.dataset = dataset;
    this.attribution = attribution;
    this.classify = classify;
    this.getPopupContent = getPopupContent;
  }
  // get data for the given identifier
  // (assumes entries in dataset are indexed by an identifier property - can be overriden as necessary)
  getData(identifier) {
    return identifier in this.dataset ? this.dataset[identifier] : undefined;
  }
  // iterate over the dataset
  // (assumes entries in dataset are indexed by an identifier property - can be overriden as necessary)
  *dataIterator() {
    for (const key of Object.keys(this.dataset)) {
      yield this.dataset[key];
    }
  }
}

const DatagroupAwareMarker = L.Marker.extend({
  setDatagroupName: function(datagroupName) {
    L.Util.setOptions(this, { datagroupName: datagroupName });
    return this;
  },
  getDatagroupName: function() {
    return this.options.datagroupName;
  }
});

class LayerInfo {
  constructor(name, color, layer, trackMarkerCount) {
    this.name = name;
    this.color = color;
    this.layer = layer;
    if (trackMarkerCount) {
      this.markerCount = 0;
    }
  }
  addLayer(sublayer) {
    this.layer.addLayer(sublayer);
    if ("markerCount" in this) {
      this.markerCount++;
    }
  }
}

class BoundaryLayerInfo extends LayerInfo {
  constructor(name, dataset, attribution, options) {
    super(name, "color" in options ? options.color : "black", null, false);
    const strokeColor = this.color;
    const fillColor = "highlightColor" in options ? options.highlightColor : "#f1ab29";
    this.defaultStyle = function(feature) {
      return {
        color: strokeColor,
        fillColor: fillColor,
        weight: 2,
        opacity: 1,
        fillOpacity: ("highlightFunction" in options && options.highlightFunction(feature.properties)) ? 0.4 : 0,
      }
    };
    this.layer = L.geoJSON(
      dataset,
      {
        attribution: attribution,
        style: this.defaultStyle,
        onEachFeature: function(feature, layer) {
          if ("getTooltipText" in options) {
            layer.bindTooltip(
              options.getTooltipText(feature.properties),
              {
                className: "darkTooltip",
                sticky : true
              });
          }
          if ("onEachFeature" in options) {
            options.onEachFeature(feature);
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
            fillColor: fillColor,
            weight: 5,
            fillOpacity: ("highlightFunction" in options && options.highlightFunction(layer.feature.properties)) ? 0.4 : 0,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        },
        mouseout: function(event) { geojsonLayer.resetStyle(event.target) },
      });
    });
  }
  refreshStyles() {
    this.layer.resetStyle();
  }
}

class HighlightSelect {
  #defaultOption = "-- None --";
  constructor(label, highlightFunction) {
    this.label = label;
    this.comparand = this.#defaultOption;
    this.optionSet = new Set([this.#defaultOption]);
    this.highlightFunction = (props) => { return highlightFunction(props, this.comparand); }
  }
  addOption(option) {
    this.optionSet.add(option);
  }
  getHighlightSelectElement(sort, layersToRefresh) {
    return getSelect(
      this.label,
      sort ? [...this.optionSet.values()].sort() : [...this.optionSet.values()],
      (value) => {
        this.comparand = value;
        layersToRefresh.forEach((layer) => { layer.refreshStyles() });
      },
    );
  }
}