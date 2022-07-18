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

L.Marker.DatagroupAwareMarker = L.Marker.extend({
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
  constructor(data, attribution, getIdentifier, getLatLng) {
    this.data = data;
    this.attribution = attribution;
    this.getIdentifier = getIdentifier instanceof Function
      ? getIdentifier // user provided function
      : (data) => data[getIdentifier]; // user provided accessor for identifier
    this.getLatLng = getLatLng ? getLatLng : (data) => [data.latitude, data.longitude];
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
  _setMarkerData(identifier, markerData) {
    this.markerData.set(identifier.toString(), markerData);
  }
  createNewMarker(data) {
    return new L.Marker.DatagroupAwareMarker(this.dataset.getLatLng(data), this.markerOptions, this.name);
  }
  addMarker(identifier, data, layerInfo) {
    const marker = this.createNewMarker(data);
    layerInfo.addLayer(marker);
    const markerData = new MarkerData(identifier, data, this, layerInfo, marker);
    this._setMarkerData(identifier, markerData);
    marker.setIcon(this.getMarkerIcon(markerData));
    if (this.getMarkerPopupContent) {
      marker.bindPopup("", { maxWidth: 300, minWidth: 250, maxHeight: 300, });
      this._setMarkerPopupContent(markerData);
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
  _setMarkerPopupContent(markerData) {
    const marker = markerData.marker;
    marker.closePopup();
    marker.setPopupContent(
      this.getMarkerPopupContent(markerData, this.markerPopupContentOptions),
    );
  }
  refreshMarkerPopupContent(identifier) {
    const markerData = this.getMarkerData(identifier);
    if (markerData && this.getMarkerPopupContent) {
      this._setMarkerPopupContent(markerData);
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
        this.addChildLayer(
          "getLayerInfo" in options
            ? options.getLayerInfo(classification, this.dataset.attribution)
            : new LayerInfo(classification, "blue", L.layerGroup([], { attribution : this.dataset.attribution }), false)
        );
      }
      const layerInfo = this.getChildLayer(classification);
      this.addMarker(
        this.dataset.getIdentifier(datum),
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
      this.dataset.getIdentifier(data),
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
      .attr("title", "Enter the new radius for the circle")
      .addClass("radiusInput validInput")
      .val(circle.getRadius() / 1000) // meters to kilometers
      .get(0);
    const messageElement = $("<span></span>").addClass("successMessage");
    const applyChangesButton = $("<button type='button'>Set Radius</button>")
      .attr("title", "Apply your changes to the circle radius")
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
      "getLayerInfo" in options
        ? options.getLayerInfo("Search Results", this.dataset.attribution)
        : new LayerInfo("Search Results", "blue", L.layerGroup([], { attribution : this.dataset.attribution }), false)
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
    const identifier = this.dataset.getIdentifier(data);
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
  _defaultOption = "-- None --";
  constructor(label, selectTitleText, highlightFunction) {
    this.label = label;
    this.selectTitleText = selectTitleText;
    this.comparand = this._defaultOption;
    this.optionSet = new Set([this._defaultOption]);
    this.highlightFunction = (props) => { return highlightFunction(props, this.comparand); }
  }
  addOption(option) {
    this.optionSet.add(option);
  }
  getHighlightSelectElement(sort, layersToRefresh) {
    return getSelect(
      this.label,
      this.selectTitleText,
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
    this.registeredDatagroups = new Map();
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
  // only markers from registered datagroups will be saved to and restored from local storage
  registerDatagroup(datagroup) {
    this.registeredDatagroups.set(datagroup.name, datagroup);
  }
  saveToLocalStorage() {
    const toSave = [];
    this.favoritedMarkers.forEach((markerData) => {
      if (this.registeredDatagroups.has(markerData.datagroup.name)) {
        toSave.push({
          identifier: markerData.identifier,
          datagroupName: markerData.datagroup.name,
        })
      }
    });
    localStorage.setItem(this.localStorageItemName, JSON.stringify(toSave));
  }
  restoreFromLocalStorage() {
    const toRestore = localStorage.getItem(this.localStorageItemName);
    if (toRestore) {
      for (const item of JSON.parse(toRestore)) {
        if (this.registeredDatagroups.has(item.datagroupName)) {
          const markerData = this.registeredDatagroups.get(item.datagroupName).getMarkerData(item.identifier);
          if (markerData) {
            this.add(markerData, true);
            markerData.datagroup.refreshMarkerPopupContent(markerData.identifier);
          } else {
            console.error("Error: could not find marker data for " + JSON.stringify(item));
          }
        } else {
          console.error("Error: could not find source datagroup for " + JSON.stringify(item));
        }
      }
    }
  }
  removeFromLocalStorage() {
    localStorage.removeItem(this.localStorageItemName);
  }
}

L.Control.HeatLayerControl = L.Control.extend({
  options: {
    selectNoneValue: "-- None --",
    datagroups: [],
    selectId: "heatLayerControlSelect",
    selectLabelText: "Select category for heatmap: ",
    selectTitleText: "Select a category of data to show on the map as a heatmap",
    className: "heatLayerControl",
    collapsedText: "&#9660; Heatmap Options",
    expandedText: "&#9650; Heatmap Options",
  },
  initialize(options) {
    L.Util.setOptions(this, options);
  },
  onAdd: function(map) {
    this._map = map;
    this._initContainer();
    this._addEventListeners();
    return this._container;
  },
  onRemove: function() {
    this._removeEventListeners();
  },
  _initContainer() {
    this._visibilityToggle = $(`<div>${this.options.collapsedText}</div>`).addClass("center pointerCursor controlHeader");
    this._select = $(`<select id="${this.options.selectId}"></select>`)
      .attr("title", this.options.selectTitleText)
      .html(Object.keys(this._datagroupMap).sort().map(
        (option) => { return `<option value="${option}">${option}</option>` }
      ));
    this._checkboxDiv = $("<div></div>");
    this._button = $("<button type='button'>Apply Changes</button>");
    this._subcategoryDiv = $("<div></div>")
      .append([
        this._checkboxDiv,
        $("<div></div>").addClass("center").append(this._button),
      ])
      .hide(0);
    this._contents = $("<div></div>")
      .append([
        $(`<label for="${this.options.selectId}">${this.options.selectLabelText}</label><br>`),
        this._select,
        this._subcategoryDiv,
      ])
      .hide(0);
    this._container = $("<div></div>")
      .addClass("leaflet-bar scrollable" + ("className" in this.options ? ` ${this.options.className}` : ""))
      .append([
        this._visibilityToggle,
        this._contents,
      ])
      .get(0);
  },
  _updateHeatLayer(data) {
    if (data && data.length > 0) {
      if (!this._map.hasLayer(this._heatLayer)) {
        this._map.addLayer(this._heatLayer);
      }
      this._heatLayer.setLatLngs(data);
    } else if (this._map.hasLayer(this._heatLayer)) {
      this._map.removeLayer(this._heatLayer);
    }
  },
  _toggleContentsHandler() {
    this._contents.toggle();
    this._visibilityToggle.html(
      this._contents.is(":visible") ? this.options.expandedText : this.options.collapsedText
    );
  },
  _selectChangeHandler() {
    const value = this._select.val();
    this._selectedDatagroup = (value === this.options.selectNoneValue)
      ? null
      : this._datagroupMap[value];
    if (this._selectedDatagroup) {
      this._checkboxDiv.html("Choose subcategories: <br>");
      this._selectedDatagroup = this._datagroupMap[value];
      for (const childLayerName of [...this._selectedDatagroup.childLayers.keys()].sort()) {
        this._checkboxDiv.append(
          $("<div></div>").append(getCheckbox(childLayerName, "italic", true))
        );
      }
      // modified from Leaflet source code
      this._container.style.maxHeight = (this._map.getSize().y - (this._container.offsetTop + 50)) + "px";
      this._subcategoryDiv.show(0);
    } else {
      this._subcategoryDiv.hide(0);
      this._updateHeatLayer(null);
    }
  },
  _updateHeatLayerHandler() {
    const data = [];
    const checkedCheckboxes = this._checkboxDiv.find("input:checked");
    for (let i = 0; i < checkedCheckboxes.length; i++) {
      const childLayerName = checkedCheckboxes.eq(i).val();
      this._selectedDatagroup.getChildLayer(childLayerName).layer.eachLayer((marker) => {
        data.push(marker.getLatLng());
      });
    }
    this._updateHeatLayer(data);
    //this._subcategoryDiv.hide(0);
  },
  _addEventListeners() {
    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.disableScrollPropagation(this._container);
    L.DomEvent.on(this._visibilityToggle.get(0), "click", this._toggleContentsHandler, this);
    L.DomEvent.on(this._select.get(0), "change", this._selectChangeHandler, this);
    L.DomEvent.on(this._button.get(0), "click", this._updateHeatLayerHandler, this);
  },
  _removeEventListeners() {
    L.DomEvent.off(this._visibilityToggle.get(0), "click", this._toggleContentsHandler, this);
    L.DomEvent.off(this._select.get(0), "change", this._selectChangeHandler, this);
    L.DomEvent.off(this._button.get(0), "click", this._updateHeatLayerHandler, this);  },
});
L.Control.HeatLayerControl.addInitHook(function() {
  this._heatLayer = L.heatLayer([], this.options.heatLayerOptions);
  this._datagroupMap = {};
  this._datagroupMap[this.options.selectNoneValue] = null;
  for (const datagroup of this.options.datagroups) {
    this._datagroupMap[datagroup.name] = datagroup;
  }
});