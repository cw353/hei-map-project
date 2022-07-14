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

const DatagroupAwareMarker = L.Marker.extend({
  options: {
    _datagroupName: "Unknown Category",
  },
  initialize(latlng, options, datagroupName) {
    L.Marker.prototype.initialize.call(this, latlng, options);
    this.setDatagroupName(datagroupName);
  },
  setDatagroupName: function(datagroupName) {
    L.Util.setOptions(this, { _datagroupName: datagroupName });
  },
  getDatagroupName: function() {
    return this.options._datagroupName;
  }
});

class MarkerData {
  constructor(identifier, data, datagroup, layerInfo, marker) {
    this.identifier = identifier;
    this.data = data;
    this.datagroup = datagroup;
    this.layerInfo = layerInfo;
    this.marker = marker;
  }
  toJSON() {
    return ({
      "identifier": this.identifier,
      "datagroupName": this.datagroup.name,
    });
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

class ChildLayerGroup {
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

class Datagroup extends ChildLayerGroup {
  constructor(name, dataset, options) {
    super(name);
    this.dataset = dataset;
    this.markerData = new Map(); // map of MarkerData objects
    this.getMarkerIcon = "getMarkerIcon" in options
      ? options.getMarkerIcon
      : (markerData) => generateIcon(markerData.layerInfo.color);
    this.markerOptions = Object.assign(
      {
        riseOnHover: true,
        riseOffset: 1000000,
        title: `Marker from "${this.name}"`,
      },
      options.markerOptions,
    );
    this.getMarkerPopupContent = "getMarkerPopupContent" in options
      ? options.getMarkerPopupContent
      : null;
    this.markerPopupContentOptions = "markerPopupContentOptions" in options
      ? options.markerPopupContentOptions
      : null;
  }
  hasMarkerData(identifier) {
    return this.markerData.has(identifier.toString());
  }
  getMarkerData(identifier) {
    const identifierAsString = identifier.toString();
    return this.hasMarkerData(identifierAsString) ? this.markerData.get(identifierAsString) : undefined;
  }
  #setMarkerData(identifier, markerData) {
    this.markerData.set(identifier.toString(), markerData);
  }
  addMarker(identifier, data, layerInfo) {
    const marker = new DatagroupAwareMarker(
      [data.latitude, data.longitude],
      this.markerOptions,
      this.name,
    );
    layerInfo.addLayer(marker);
    const markerData = new MarkerData(identifier, data, this, layerInfo, marker);
    this.#setMarkerData(identifier, markerData);
    marker.setIcon(this.getMarkerIcon(markerData));
    if (this.getMarkerPopupContent) {
      marker.bindPopup("", { maxWidth: 250, maxHeight: 300, });
      this.#setMarkerPopupContent(markerData);
    }
  }
  // postcondition: the marker has been removed from its parent layer and from this.markerData,
  // but the associated data in this.dataset has not been modified
  removeMarker(identifier) {
    const markerData = this.getMarkerData(identifier);
    const marker = markerData.marker;
    marker.closePopup();
    markerData.layerInfo.layer.removeLayer(marker);
    this.markerData.delete(identifier);
  }
  // precondition: this.getMarkerPopupContent != null
  #setMarkerPopupContent(markerData) {
    const marker = markerData.marker;
    marker.closePopup();
    marker.setPopupContent(
      this.getMarkerPopupContent(markerData, this.markerPopupContentOptions),
    );
  }
  refreshMarkerPopupContent(identifier) {
    const markerData = this.getMarkerData(identifier);
    if (markerData && this.getMarkerPopupContent) {
      this.#setMarkerPopupContent(markerData);
    }
  }
}

class AutomaticClassificationDatagroup extends Datagroup {
  constructor(name, dataset, classify, options) {
    super(name, dataset, options);
    this.classify = classify;

    for (const datum of this.dataset.dataIterator()) {
      const classification = this.classify(datum);
      // if the LayerInfo object corresponding to classification doesn't exist yet, create it
      if (!(this.childLayers.has(classification))) {
        this.addChildLayer(new LayerInfo(
          classification,
          "getLayerColor" in options ? options.getLayerColor() : "blue",
          "getLayer" in options
            ? options.getLayer(this.dataset.attribution)
            : L.layerGroup([], { attribution : this.dataset.attribution }),
          options.trackMarkerCount,
        ));
      }
      const layerInfo = this.getChildLayer(classification);
      this.addMarker(
        datum[this.dataset.identifierField],
        datum,
        layerInfo,
      );
    }
  }
}

class MarkerAndCircleDatagroup extends Datagroup {
  constructor(name, dataset, options) {
    super(name, dataset, options);
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
  getRadiusInputElement() {
    const circle = this.getChildLayer(this.circleName).layer;
    const inputElement = $("<input type='number' min='0'/>")
      .addClass("radiusInput validInput")
      .val(circle.getRadius() / 1000) // meters to kilometers
      .get(0);
    const messageElement = $("<span></span>").addClass("successMessage");
    const applyChangesButton = $("<button type='button'>Set Radius</button>")
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

class SearchResultsDatagroup extends Datagroup {
  constructor(name, dataset, localStorageItemName, options) {
    super(name, dataset, options);
    this.localStorageItemName = localStorageItemName;
    this.addChildLayer(
      new LayerInfo(
        "Search Results",
        "red",
        getCheckedInLayer(markerClusterSupportGroup, { attribution: this.dataset.attribution }),
        false,
      )
    );
    this.restoreFromLocalStorage();
  }
  localStorageSize() {
    const saved = localStorage.getItem(this.localStorageItemName);
    return saved ? JSON.parse(saved).length : 0;
  }
  saveToLocalStorage() {
    localStorage.setItem(this.localStorageItemName, JSON.stringify([...this.markerData.keys()]));
  }
  restoreFromLocalStorage() {
    const toRestore = localStorage.getItem(this.localStorageItemName);
    if (toRestore) {
      for (const pin of JSON.parse(toRestore)) {
        getLocationDataViaAjax(
          pin,
          (data) => {
            if (data.length < 1) {
              console.error(`Error: no data found for user-added PIN ${pin}`);
            } else {
              this.addSearchResult(data[0], true);
            }
          },
          (jqxhr, textStatus) => { 
            console.log(`Error: failed to retrieve data for user-added PIN ${pin} - ${textStatus}`);
          },
        );
      }
    }
  }
  removeFromLocalStorage() {
    localStorage.removeItem(this.localStorageItemName);
  }
  addSearchResult(data, skipUpdatingLocalStorage) {
    const identifier = data[this.dataset.identifierField];
    this.addMarker(
      identifier,
      data,
      this.getChildLayer("Search Results"),
    );
    !skipUpdatingLocalStorage && this.saveToLocalStorage();
    return this.getMarkerData(identifier);
  }
  removeSearchResult(markerData, callback) {
    if (window.confirm("Are you sure you want to remove this marker from the map?")) {
      this.removeMarker(markerData.identifier);
      this.saveToLocalStorage();
      callback && callback(markerData);
    }
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
  removeLayer(sublayer) {
    this.layer.removeLayer(sublayer);
    if ("markerCount" in this) {
      this.markerCount--;
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

class FavoritedMarkerGroup {
  constructor(localStorageItemName) {
    this.favoritedMarkers = new Set();
    this.sourceDatagroups = new Map();
    this.localStorageItemName = localStorageItemName;
  }
  size() {
    return this.favoritedMarkers.size;
  }
  localStorageSize() {
    const saved = localStorage.getItem(this.localStorageItemName);
    return saved ? JSON.parse(saved).length : 0;
  }
  getAll() {
    // sort primary by datagroup name and secondarily by layerinfo name
    return [...this.favoritedMarkers.values()].sort(
      (a, b) => compare(a.datagroup.name, b.datagroup.name, () => compare(a.layerInfo.name, b.layerInfo.name, null))
    );
  }
  has(markerData) {
    return this.favoritedMarkers.has(markerData);
  }
  add(markerData, skipUpdatingLocalStorage) {
    this.favoritedMarkers.add(markerData);
    markerData.marker.setIcon(generateFavoritedIcon(markerData.layerInfo.color));
    !skipUpdatingLocalStorage && this.saveToLocalStorage();
  }
  remove(markerData, skipUpdatingLocalStorage) {
    if (this.has(markerData)) {
      this.favoritedMarkers.delete(markerData);
      markerData.marker.setIcon(generateIcon(markerData.layerInfo.color));
      !skipUpdatingLocalStorage && this.saveToLocalStorage();
    }
  }
  removeAll() {
    for (const markerData of this.favoritedMarkers.values()) {
      this.remove(markerData, true);
      markerData.datagroup.refreshMarkerPopupContent(markerData.identifier);
    }
    this.removeFromLocalStorage();
  }
  registerDatagroup(datagroup) {
    this.sourceDatagroups.set(datagroup.name, datagroup);
  }
  saveToLocalStorage() {
    const toSave = [];
    this.favoritedMarkers.forEach((markerData) => toSave.push({
      identifier: markerData.identifier,
      datagroupName: markerData.datagroup.name,
    }));
    localStorage.setItem(this.localStorageItemName, JSON.stringify(toSave));
  }
  restoreFromLocalStorage() {
    const toRestore = localStorage.getItem(this.localStorageItemName);
    if (toRestore) {
      for (const item of JSON.parse(toRestore)) {
        if (this.sourceDatagroups.has(item.datagroupName)) {
          const markerData = this.sourceDatagroups.get(item.datagroupName).getMarkerData(item.identifier);
          if (markerData) {
            this.add(markerData, true);
            markerData.datagroup.refreshMarkerPopupContent(markerData.identifier);
          } else {
            console.error("error: could not find marker data for " + JSON.stringify(item));
          }
        } else {
          console.error("error: could not find source datagroup for " + JSON.stringify(item));
        }
      }
    }
  }
  removeFromLocalStorage() {
    localStorage.removeItem(this.localStorageItemName);
  }
}