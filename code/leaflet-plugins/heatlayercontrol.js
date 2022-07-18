L.Control.HeatLayer = L.Control.extend({
  options: {
    selectNoneValue: "-- None --",
    datagroups: [],
    selectId: "heatLayerControlSelect",
    selectLabelText: "Select category to show as heatmap: ",
    selectTitleText: "Select a category of data to show on the map as a heatmap",
    className: "heatLayerControl",
    collapsedText: "&#9660; Heatmap",
    expandedText: "&#9650; Heatmap",
    getBottomOffset: () => { return 50; }, // based on line 155 of https://github.com/Leaflet/Leaflet/blob/v1.8.0/src/control/Control.Layers.js
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
    this._subcategoryDiv.empty();
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
        $("<div></div>").addClass("center additionalTopMargin").append(this._button),
      ])
      .hide(0);
    this._contents = $("<div></div>")
      .append([
        $(`<label for="${this.options.selectId}">${this.options.selectLabelText}</label><br>`)
          .addClass("bolded"),
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
  _updateHeight() {
    // based on line 155 of https://github.com/Leaflet/Leaflet/blob/v1.8.0/src/control/Control.Layers.js
    const offset = this._container.offsetTop + this.options.getBottomOffset();
    this._container.style.maxHeight = (this._map.getSize().y - offset) + "px";
  },
  _updateHeatLayer(data, attribution) {
    // remove heatlayer from map before updating it
    if (this._map.hasLayer(this._heatLayer)) {
      this._map.removeLayer(this._heatLayer);
    }
    // if valid data was provided, update heatlayer and add it to map
    if (data && data.length > 0) {
      this._heatLayer.options.attribution = attribution ? attribution : "";
      this._map.addLayer(this._heatLayer);
      this._heatLayer.setLatLngs(data);
    }
  },
  _toggleContentsHandler() {
    this._contents.toggle();
    this._visibilityToggle.html(
      this._contents.is(":visible") ? this.options.expandedText : this.options.collapsedText
    );
    this._updateHeight();
  },
  _selectChangeHandler() {
    const value = this._select.val();
    this._selectedDatagroup = (value === this.options.selectNoneValue)
      ? null
      : this._datagroupMap[value];
    if (this._selectedDatagroup) {
      this._checkboxDiv.html("<br><span class='bolded'>Choose subcategories:</span><br>");
      this._checkboxDiv.append([
        $("<span>Check all</span>").addClass("italic pointerCursor")
          .on("click", (event) => {
            this._checkboxDiv.find("input[type='checkbox']:not(:checked)").prop("checked", true);
          }),
        "<br>",
        $("<span>Uncheck all</span>").addClass("italic pointerCursor")
        .on("click", (event) => {
          this._checkboxDiv.find("input[type='checkbox']:checked").prop("checked", false);
        }),
        "<br>",
      ]);
      this._selectedDatagroup = this._datagroupMap[value];
      for (const childLayerName of [...this._selectedDatagroup.childLayers.keys()].sort()) {
        this._checkboxDiv.append(
          $("<div></div>").addClass("additionalPadding").append(getCheckbox(childLayerName, "italic", true))
        );
      }
      this._subcategoryDiv.show(0);
    } else {
      this._subcategoryDiv.hide(0);
      this._updateHeatLayer(null);
    }
    this._updateHeight();
  },
  _updateHeatLayerHandler() {
    const data = [];
    const checkedCheckboxes = this._checkboxDiv.find("input[type='checkbox']:checked");
    for (let i = 0; i < checkedCheckboxes.length; i++) {
      const childLayerName = checkedCheckboxes.eq(i).val();
      this._selectedDatagroup.getChildLayer(childLayerName).layer.eachLayer((marker) => {
        data.push(marker.getLatLng());
      });
    }
    this._updateHeatLayer(data, this._selectedDatagroup.dataset.attribution);
  },
  _addEventListeners() {
    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.disableScrollPropagation(this._container);
    L.DomEvent.on(this._visibilityToggle.get(0), "click", this._toggleContentsHandler, this);
    L.DomEvent.on(this._select.get(0), "change", this._selectChangeHandler, this);
    L.DomEvent.on(this._button.get(0), "click", this._updateHeatLayerHandler, this);
    map.on("resize", this._updateHeight, this);
  },
  _removeEventListeners() {
    L.DomEvent.off(this._visibilityToggle.get(0), "click", this._toggleContentsHandler, this);
    L.DomEvent.off(this._select.get(0), "change", this._selectChangeHandler, this);
    L.DomEvent.off(this._button.get(0), "click", this._updateHeatLayerHandler, this);
    map.off("resize", this._updateHeight, this);
  },
});
L.Control.HeatLayer.addInitHook(function() {
  this._heatLayer = L.heatLayer([], this.options.heatLayerOptions);
  this._datagroupMap = {};
  this._datagroupMap[this.options.selectNoneValue] = null;
  for (const datagroup of this.options.datagroups) {
    this._datagroupMap[datagroup.name] = datagroup;
  }
});
L.control.heatLayer = function(options) {
  return new L.Control.HeatLayer(options);
}