/*
 * Copyright (c) 2014 Alex Nguyen, MIT License
 * Source: https://github.com/nguyenning/Leaflet.defaultextent
 * Modified by Claire Wagner
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["leaflet"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  } else {
    root.L.Control.DefaultExtent = factory(root.L);
  }
}(this, function(L) {

return (function () {
  /* global L */
  'use strict';
  L.Control.DefaultExtent = L.Control.extend({
    options: {
      position: 'topleft',
      toggleText: 'Home View',
      toggleTitle: 'Set and go to Home View',
      zoomToHomeViewButtonText: "Go to Home View",
      zoomToHomeViewButtonTitle: "",
      setHomeViewButtonText: "Set Current View as Home View",
      setHomeButtonTitle: "Set the current map view as Home View",
      className: 'leaflet-control-defaultextent',
    },
    onAdd: function (map) {
      this._map = map;
      return this._initLayout();
    },
    setCenter: function (center) {
      this._center = center;
      return this;
    },
    setZoom: function (zoom) {
      this._zoom = zoom;
      return this;
    },
    _initLayout: function () {
      var container = L.DomUtil.create('div', 'leaflet-bar ' +
        this.options.className);
      this._container = container;
      this._contents = this._createContents();
      this._toggleButton = $(this._createToggleButton(container));
      this._container.appendChild(this._contents.get(0));

      L.DomEvent.disableClickPropagation(container);

      this._map.whenReady(this._whenReady, this);

      L.DomEvent
        .on(this._container, 'mousedown dblclick', L.DomEvent.stopPropagation)
        .on(this._container, 'mouseover', this._showContents, this)
        .on(this._container, 'mouseout', this._hideContents, this);

      return this._container;
    },
    _createContents: function() {
      return $("<div></div>")
        .addClass("leaflet-control-defaultextent-contents")
        .append([
          this._createZoomToHomeViewButton(),
          "<br>",
          this._createSetHomeViewButton(),
        ])
        .hide(0);
    },
    _createZoomToHomeViewButton: function() {
      return $("<button type='button'></button>")
        .text(this.options.zoomToHomeViewButtonText)
        .attr("title", this.options.zoomToHomeViewButtonTitle)
        .on("click", () => this._zoomToDefault());
    },
    _createSetHomeViewButton: function() {
      return $("<button type='button'></button>")
        .text(this.options.setHomeViewButtonText)
        .attr("title", this.options.setHomeViewButtonTitle)
        .on("click", () => {
          this.setCenter(this._map.getCenter());
          this.setZoom(this._map.getZoom());
        });
    },
    _createToggleButton: function () {
      var link = L.DomUtil.create('a', this.options.className + '-toggle',
        this._container);
      link.href = '#';
      link.innerHTML = this.options.toggleText;
      link.toggleTitle = this.options.toggleTitle;
      return link;
    },
    _showContents: function() {
      this._toggleButton.hide();
      this._contents.show();
    },
    _hideContents: function() {
      this._toggleButton.show();
      this._contents.hide();
    },
    _whenReady: function () {
      if (!this._center) {
        this._center = this._map.getCenter();
      }
      if (!this._zoom) {
        this._zoom = this._map.getZoom();
      }
      return this;
    },
    _zoomToDefault: function () {
      this._map.setView(this._center, this._zoom);
    },
  });

  L.Map.addInitHook(function () {
    if (this.options.defaultExtentControl) {
      this.addControl(new L.Control.DefaultExtent());
    }
  });

  L.control.defaultExtent = function (options) {
    return new L.Control.DefaultExtent(options);
  };

  return L.Control.DefaultExtent;

}());
;

}));
