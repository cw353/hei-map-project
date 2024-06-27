/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

L.Control.CollapsibleLegend = L.Control.extend({
  options: {
    id: "collapsibleLegend",
    className: "collapsibleLegend",
    dividerElement: "hr",
    collapsedTextPrefix: "&#9658; ",
    collapsedTitle: "Click to show legend",
    expandedTextPrefix: "&#9660; ",
    expandedTitle: "Click to hide legend",
  },
  initialize(options) {
    L.Util.setOptions(this, options);
    this._sectionMap = new Map();
  },
  onAdd: function(map) {
    this._$container = $("<div></div>").addClass(this.options.className);
    this._container = this._$container.get(0);
    this._addEventListeners();
    return this._container;
  },
  onRemove: function() {
    this._removeEventListeners();
  },
  addSection(section, label) {
    const div = L.DomUtil.create("div", this._classNames.section);
    this._sectionMap.set(label, $(div));
    if (this._sectionMap.size === 1) {
      div.classList.add(this._classNames.firstSection);
    } else {
      this._container.appendChild(document.createElement(this.options.dividerElement));
    }
    const header = L.DomUtil.create("header", this._classNames.sectionHeader, div);
    $(header).data("label", label);
    header.style.cursor = "pointer";
    header.setAttribute("title", this.options.expandedTitle);
    header.innerHTML = this.options.expandedTextPrefix + label;
    section.classList.add(this._classNames.sectionContents);
    div.appendChild(section);
    this._container.appendChild(div);
  },
  toggleSection(label) {
    if (this._sectionMap.has(label)) {
      const section = this._sectionMap.get(label).toggle();
      section.prev(this.options.dividerElement).toggle(); // toggle above divider if present
      section.hasClass(this._classNames.firstSection) && section.next(this.options.dividerElement).toggle(); // if this is the first section, toggle below divider if present
    };
  },
  _toggleSectionContents(event) {
    const header = $(event.target);
    const toHide = header.siblings("." + this._classNames.sectionContents);
    const headerLabel = header.data("label");
    toHide.toggle();
    header
      .attr("title", toHide.is(":visible") ? this.options.expandedTitle : this.options.collapsedTitle)
      .html((toHide.is(":visible") ? this.options.expandedTextPrefix : this.options.collapsedTextPrefix) + headerLabel);
  },
  _addEventListeners() {
    L.DomEvent.disableClickPropagation(this._container);
    this._$container.on("click", "." + this.options.className + "SectionHeader", (event) => this._toggleSectionContents(event));
  },
  _removeEventListeners() {
    this._$container.off();
  },
});
L.Control.CollapsibleLegend.addInitHook(function() {
  const className = this.options.className;
  this._classNames = {
    section: className + "Section",
    sectionHeader: className + "SectionHeader",
    sectionContents: className + "SectionContents",
    firstSection: "firstSection",
  };
});
L.control.collapsibleLegend = function(options) {
  return new L.Control.CollapsibleLegend(options);
}