/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

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
  constructor(name, dataset, attribution, classify, getPopupContent) {
    super(name);
    this.dataset = dataset;
    this.attribution = attribution;
    this.classify = classify;
    this.getPopupContent = getPopupContent;
  }
  // get data for the given identifier
  // (assumes entries in dataset are indexed by an identifier property - can be overriden as necessary)
  getData(identifier) {
    return dataset[identifier];
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
  register: function(registrationInfo) {
    L.Util.setOptions(
      this,
      { datagroup: registrationInfo.datagroup, layerInfo: registrationInfo.layerInfo, }
    );
  }
});

class MarkerAndCircleDatagroup extends Datagroup {
  constructor(name, data, attribution, options) {
    super(name);
    this.markerName =  "markerName" in options ? options.markerName : name;
    this.circleName =  "circleName" in options ? options.circleName : `Circle around ${name}`;
    const markerColor = "markerColor" in options ? options.markerColor : "black";
    const circleColor = "circleColor" in options ? options.circleColor : "black";
    // add child layer for marker
    this.addChildLayer(new LayerInfo(
      this.markerName,
      markerColor,
      L.layerGroup([], { attribution: attribution }),
      options.trackMarkerCount,
    ));
    addMarkerToLayer(
      data,
      this,
      this.childLayers.get(this.markerName),
      "markerPopupContent" in options ? options.markerPopupContent : null,
    );
    // add child layer for circle
    this.addChildLayer(new LayerInfo(
      this.circleName,
      circleColor,
      L.circle([data.latitude, data.longitude], {
        attribution: attribution,
        color: circleColor,
        radius: "initialRadius" in options ? options.initialRadius : 3000,
        fillOpacity: "circleFillOpacity" in options ? options.circleFillOpacity : 0.15,
      }),
      false,
    ));
  }
  getRadiusInputElement() {
    const circle = this.childLayers.get(this.circleName).layer;
    const inputElement = $("<input type='number'/>")
      .addClass("radiusInput validInput")
      .val(circle.getRadius() / 1000); // meters to kilometers
    const messageElement = $("<span></span>").addClass("successMessage");
    const applyChangesButton = $("<button type='button'>Set Radius</button>")
      .addClass("smallHorizontalMargin")
      .on("click", (event) => {
        const newRadius = parseFloat(inputElement.val());
        if (!isNaN(newRadius)) { // valid float
          circle.setRadius(newRadius * 1000); // kilometers to meters
          inputElement.removeClass("invalidInput").addClass("validInput");
          messageElement.removeClass("failureMessage").addClass("successMessage").text(`Success! The radius has been set to ${newRadius} km.`);
        } else { // invalid float
          inputElement.removeClass("validInput").addClass("invalidInput");
          messageElement.removeClass("successMessage").addClass("failureMessage").text("Error: input must be a valid number.");
        }
      }
    );
    return $(`<div></div>`).addClass("formDiv")
      .append([
        $(`<label>Set radius of circle around ${this.markerName} (in kilometers): </label>`).append(inputElement),
        applyChangesButton,
        messageElement,
      ])
      .get(0);
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