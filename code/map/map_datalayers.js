/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

const wardHighlightSelect = new HighlightSelect(
  "Choose a ward to highlight in yellow: ",
  "Select the ward that should be highlighted in yellow on the map",
  (props, comparand) => { return ("ward" in props && ("Ward " + props.ward) === comparand) ? "0.4" : "0" },
);
for (let i = 1; i < 51; i++) { wardHighlightSelect.addOption("Ward " + i); }

const neighborhoodHighlightSelect = new HighlightSelect(
  "Choose a neighborhood to highlight in yellow: ",
  "Select the neighborhood that should be highlighted in yellow on the map",
  (props, comparand) => { return ("pri_neigh" in props && props.pri_neigh === comparand) ? "0.4" : "0" },
);

const zoneClassHighlightSelect = new HighlightSelect(
  "Choose a zone class to highlight in yellow: ",
  "Select the zone class that should be highlighted in yellow on the map",
  (props, comparand) => { return ("zone_class" in props && props.zone_class.startsWith(comparand)) ? "0.4" : "0" },
);

const redliningToggleFill = new ToggleFill(
  (props, toggleFill) => toggleFill ? "0.3" : "0",
  false,
);

const geoBoundaries = new ChildLayerGroup("Geographic Boundaries");
geoBoundaries.addChildLayer(new BoundaryLayerInfo(
  "Ward Boundaries (2015–2023)",
  ward_boundaries_2015_to_2023.data,
  ward_boundaries_2015_to_2023.metadata.attribution,
  {
    getTooltipText: (props) => { return `Ward ${props.ward} (2015–2023)`; },
    getFillOpacity: wardHighlightSelect.getFillOpacity,
  },
));
geoBoundaries.addChildLayer(new BoundaryLayerInfo(
  "Ward Boundaries (2023+)",
  ward_boundaries_2023.data,
  ward_boundaries_2023.metadata.attribution,
  {
    getTooltipText: (props) => { return `Ward ${props.ward} (2023+)`; },
    getFillOpacity: wardHighlightSelect.getFillOpacity,
  },
));
geoBoundaries.addChildLayer(new BoundaryLayerInfo(
  "Neighborhood Boundaries",
  neighborhood_boundaries.data,
  neighborhood_boundaries.metadata.attribution,
  {
    getTooltipText: (props) => { return props.pri_neigh; },
    getFillOpacity: neighborhoodHighlightSelect.getFillOpacity,
    onEachFeature: (feature) => { neighborhoodHighlightSelect.addOption(feature.properties.pri_neigh); },
  },
));
const zoneClassRegex = new RegExp("^[A-Z]+");  // regex to extract alphabetic zone class prefix
geoBoundaries.addChildLayer(new BoundaryLayerInfo(
  "Zoning Districts",
  zoning_districts.data,
  zoning_districts.metadata.attribution ? zoning_districts.metadata.attribution : "City of Chicago",
  {
    getTooltipText: (props) => { return props.zone_class; },
    getFillOpacity: zoneClassHighlightSelect.getFillOpacity,
    onEachFeature: (feature) => { zoneClassHighlightSelect.addOption(zoneClassRegex.exec(feature.properties.zone_class)[0]); },
  }
));
// source: https://dsl.richmond.edu/panorama/redlining/ and https://github.com/americanpanorama/panorama-holc/blob/master/src/components/CityStats.jsx (CC BY-NC-SA license)
const holcGrades = {
  "A" : { label: "HOLC Grade A",  meaning: "Best", color: "#418e41" },
  "B" : { label: "HOLC Grade B", meaning: "Still Desirable", color: "#4a4ae4" },
  "C" : { label: "HOLC Grade C", meaning: "Definitely Declining", color: "#ffdf00", },
  "D" : { label: "HOLC Grade D", meaning: "Hazardous", color: "#eb3f3f", }
};
geoBoundaries.addChildLayer(new BoundaryLayerInfo(
  "HOLC Redlining in Chicago",
  redlining.data,
  redlining.metadata.attribution,
  {
    getTooltipText: (props) => {
      const grade = holcGrades[props.holc_grade];
      return `${grade.label} ("${grade.meaning}")`
    },
    getFillColor: (props) => holcGrades[props.holc_grade].color,
    getFillOpacity: redliningToggleFill.getFillOpacity,
  },
));
geoBoundaries.addChildLayer(new LayerInfo("No Boundaries", null, L.layerGroup(), false));
map.addLayer(geoBoundaries.getChildLayer("Ward Boundaries (2015–2023)").layer);

const colorGenerator = new ColorGenerator();
const getDefaultAutomaticClassificationOptions = (getListOfDataToDisplay) => {
  return {
    getLayerInfo: (name, attribution) => new LayerInfo(
      name,
      colorGenerator.getNextColor(),
      getCheckedInLayer(markerClusterSupportGroup, { attribution: attribution }),
      true,
    ),
    getMarkerPopupContent: getMarkerPopupContent,
    markerPopupContentOptions: {
      getDataToDisplay: (markerData) => getDataToDisplay(getListOfDataToDisplay(markerData)),
      getFormElementsToDisplay: (markerData) => getToggleFavoritedButton(markerData, favoritedMarkers),
    },
  };
};

const sunshineGospel = new MarkerAndCircleDatagroup(
  "Sunshine Gospel Ministries",
  new Dataset(sunshine_gospel, property_locations_metadata.attribution, "pin"),
  {
    markerColor: "#ff66ff",
    circleColor: "#ff80ff",
    getMarkerPopupContent: getMarkerPopupContent,
    markerPopupContentOptions: {
      getDataToDisplay: (markerData) => {
        const data = markerData.data;
        return getDataToDisplay([
          { label: "Address", data: data.property_address },
          { label: "Website", data: getOpenInNewTabLink("https://www.sunshinegospel.org/") },
        ]);
      },
      getFormElementsToDisplay: (markerData) => getToggleFavoritedButton(markerData, favoritedMarkers),
    },
  },
);

const ward20Office = new MarkerAndCircleDatagroup(
  "Ward 20 Office",
  new Dataset(ward_20_office, ward_offices_metadata.attribution, "ward"),
  {
    markerColor: "#0099ff",
    circleColor: "#00ace6",
    getMarkerPopupContent: getMarkerPopupContent,
    markerPopupContentOptions: {
      getDataToDisplay: (markerData) => {
        const data = markerData.data;
        return getDataToDisplay([
          { label: "Address", data: data.address },
          { label: "Website", data: getOpenInNewTabLink("https://www.chicago.gov/city/en/about/wards/20.html") },
        ]);
      },
      getFormElementsToDisplay: (markerData) => getToggleFavoritedButton(markerData, favoritedMarkers),
    },
  },
);

const cityOwned = new AutomaticClassificationDatagroup(
  "City-Owned PINs (Possibly for Sale)",
  new Dataset(city_owned_data, city_owned_metadata.attribution + " & " + property_locations_metadata.attribution, "pin"),
  (data) => { return data.ward ? getWard(data.ward) : "Unknown Ward" },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "PIN", data: data.pin },
        { label: "Address", data: data.property_address },
        { label: "Ward", data: data.ward },
        { label: "Zip Code", data: data.property_zip },
        { label: "Date of Acquisition", data: data.date_of_acquisition },
        { label: "Record Last Updated", data: data.last_update },
        { label: "Property Details", data: getPropertyDetailsLink(data.pin) },
      ];
    }
  ),
);

const taxSale2019 = new AutomaticClassificationDatagroup(
  "Tax Sale for Tax Year 2019 in Ward 20",
  new Dataset(taxsale_2019_data, taxsale_2019_metadata.attribution + " & " + property_locations_metadata.attribution, "pin"),
  (data) => { return data.classification ? data.classification : "Unclassified" },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "PIN", data: data.pin },
        { label: "Address", data: data.property_address },
        { label: "Classification", data: data.classification },
        { label: "2019 Tax Due (Including Interest)", data: `$${data.total_due_including_interest}` },
        { label: "2019 Tax Due (Excluding Interest)", data: `$${data.total_tax_due}` },
        { label: "Property Details", data: getPropertyDetailsLink(data.pin) },
      ];
    }
  ),
);

const taxSale2020 = new AutomaticClassificationDatagroup(
  "Tax Sale for Tax Year 2020 in Ward 20",
  new Dataset(taxsale_2020_data, taxsale_2020_metadata.attribution + " & " + property_locations_metadata.attribution, "pin"),
  (data) => { return data.classification ? data.classification : "Unclassified" },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "PIN", data: data.pin },
        { label: "Address", data: data.property_address },
        { label: "Classification", data: data.classification },
        { label: "2020 Tax Due (Including Interest)", data: data.total_due_including_interest },
        { label: "2020 Tax Due (Excluding Interest)", data: data.total_tax_due },
        { label: "Property Details", data: getPropertyDetailsLink(data.pin) },
      ];
    }
  ),
);

const scavengerSale = new AutomaticClassificationDatagroup(
  "Scavenger Sale 2022 in Ward 20",
  new Dataset(scavenger_sale_data, scavenger_sale_metadata.attribution + " & " + property_locations_metadata.attribution, "pin"),
  (data) => { return data.property_code_class ? data.property_code_class : "Unclassified" },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "PIN", data: data.pin },
        { label: "Address", data: data.property_address },
        { label: "Zip Code", data: data.property_zip },
        { label: "Classification", data: data.property_code_meaning },
        { label: "Delinquent Tax Year Range", data: data.delinquent_tax_year_range },
        { label: "Delinquent Tax", data: `$${data.delinquent_tax}` },
        { label: "Delinquent Interest", data: `$${data.delinquent_interest}` },
        { label: "Property Details", data: getPropertyDetailsLink(data.pin) },
      ];
    }
  ),
);

const expandSchoolAbbreviation = function(abbrev) {
  abbreviations = { ES: "Elementary School", HS : "High School" };
  return abbrev in abbreviations ? abbreviations[abbrev] : abbrev;
}
const schoolLocations = new AutomaticClassificationDatagroup(
  "Chicago Public Schools (2021-2022)",
  new Dataset(
    school_locations.data.features,
    school_locations.metadata.attribution,
    (data) => data.properties.school_id,
    (data) => L.GeoJSON.coordsToLatLng(data.geometry.coordinates),
  ),
  (data) => {
    return data.properties.grade_cat
      ? expandSchoolAbbreviation(data.properties.grade_cat)
      : "Unknown Category";
  },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data.properties;
      return [
        { label: "Name", data: data.short_name },
        { label: "Address", data: data.address },
        { label: "Type", data: expandSchoolAbbreviation(data.grade_cat) },
      ];
    }
  ),
);

const businessLicenses = new AutomaticClassificationDatagroup(
  "Business Licenses in Ward 20",
  new Dataset(business_license_data, business_licenses_metadata.attribution, "license_id"),
  (data) => {
    return data.license_description
      ? Array.isArray(data.license_description)
        ? "Multiple Licenses"
        : data.license_description.toString()
      : "Unknown License"
  },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "Business", data: data.doing_business_as_name },
        { label: "Address", data: data.address },
        { label: "Zip Code", data: data.zip_code },
        { label: "License Description(s)", data: joinArray(data.license_description, "; "), },
        { label: "Business Activities", data: joinArray(data.business_activity, "; "), },
      ];
    }
  ),
);

const crimes = new AutomaticClassificationDatagroup(
  "Crimes Within the Past Year in Ward 20",
  new Dataset(crime_data, crimes_metadata.attribution, "case_number"),
  (data) => {
    return data.primary_description ? data.primary_description: "Unknown Category"
  },
  getDefaultAutomaticClassificationOptions(
    (markerData) => {
      const data = markerData.data;
      return [
        { label: "Block Address", data: data.block },
        { label: "Date of Occurrence", data: data.date_of_occurrence },
        { label: "Primary Description", data: data.primary_description },
        { label: "Secondary Description", data: data.secondary_description, },
        { label: "Location Description", data: data.location_description, },
      ];
    }
  ),
);

const userAddedMarkers = new SearchResultsDatagroup(
  "User-Added Markers",
  new Dataset({}, property_locations_metadata.attribution, "pin"),
  "hei-map-user-search-results",
  {
    getLayerInfo: (name, attribution) => new LayerInfo(
      name,
      "red",
      getCheckedInLayer(markerClusterSupportGroup, { attribution: attribution }),
      false,
    ),
    getMarkerPopupContent: getMarkerPopupContent,
    markerPopupContentOptions: {
      getDataToDisplay: (markerData) => {
        const data = markerData.data;
        return getDataToDisplay([
          { label: "PIN", data: data.pin },
          { label: "Address", data: data.property_address },
          { label: "Zip Code", data: data.property_zip },
          { label: "City", data: data.property_city },
          { label: "Ward", data: data.ward },
          { label: "Property Details", data: getPropertyDetailsLink(data.pin) },
        ]);
      },
      getFormElementsToDisplay: (markerData) => [
        getToggleFavoritedButton(markerData, favoritedMarkers),
        $("<button type='button'>Remove from Map</button>").addClass("removeSearchResultButton")
          .data("markerData", markerData),
      ],
    },
  },
);

const allDatagroups = [
  ward20Office,
  sunshineGospel,
  cityOwned,
  taxSale2019,
  taxSale2020,
  scavengerSale,
  schoolLocations,
  businessLicenses,
  crimes,
  userAddedMarkers,
];
const favoritableDatagroups = allDatagroups;
const pinSearchableDatagroups = [
  sunshineGospel,
  cityOwned,
  taxSale2019,
  taxSale2020,
  scavengerSale,
  userAddedMarkers
];
const heatmapDatagroups = [
  cityOwned,
  taxSale2019,
  taxSale2020,
  scavengerSale,
  schoolLocations,
  businessLicenses,
  crimes,
  userAddedMarkers,
];
const allMetadata = [
  property_locations_metadata,
  ward_offices_metadata,
  city_owned_metadata,
  taxsale_2019_metadata,
  taxsale_2020_metadata,
  scavenger_sale_metadata,
  property_classification_codes_metadata,
  business_licenses_metadata,
  crimes_metadata,
  school_locations.metadata,
  ward_boundaries_2015_to_2023.metadata,
  ward_boundaries_2023.metadata,
  neighborhood_boundaries.metadata,
  zoning_districts.metadata,
  redlining.metadata,
];
const changeableRadiusDatagroups = [
  ward20Office,
  sunshineGospel,
];
const highlightSelects = [
  { highlightSelect: wardHighlightSelect, sort: false, layerNames: ["Ward Boundaries (2015–2023)", "Ward Boundaries (2023+)"] },
  { highlightSelect: neighborhoodHighlightSelect, sort: true, layerNames: ["Neighborhood Boundaries"] },
  { highlightSelect: zoneClassHighlightSelect, sort: true, layerNames: ["Zoning Districts"] },
];

const toggleFills = [
  { toggleFill: redliningToggleFill, checkboxId: "redliningToggleFillCheckbox", label: "Show colors for \"HOLC Redlining in Chicago\"", title: "Show or hide colors for the \"HOLC Redlining in Chicago\" map layer", legendData: Object.values(holcGrades).sort(), layerNames: ["HOLC Redlining in Chicago"] },
]