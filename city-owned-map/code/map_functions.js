/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

function generateIcon(color) {
  // based on an icon created by Naomi Wagner based on https://www.onlinewebfonts.com/icon/467018 (CC BY license)
  const divisor = 25;
  const width = 1920 / divisor;
  const height = 1080 / divisor;
  return L.divIcon({
    className: "custom_divicon",
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [0,-(height/5)*4],
    html:
      `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px" y="0px" viewBox="0 0 1920 1080" style="enable-background:new 0 0 1920 1080;"
        xml:space="preserve"
      >
        <style type="text/css">
          .svgIconStyle{stroke:#000000;stroke-width:30;stroke-miterlimit:10;}
        </style>
        <g>
          <path class="svgIconStyle" fill="${color}"" d="M939,50.7c9.8-0.7,19.6-1.2,29.7-0.9c17.9,0.5,35.8,1.8,53.4,5.2c104.3,20.6,185.6,75.2,242.1,165.4
            c32.8,52.4,49.8,110,51.9,171.9c1.2,36.3-5.6,71.1-17.6,105.2c-19.1,54.4-44.9,105.6-73.3,155.5c-53,93.3-114.1,181.1-178.6,266.6
            c-3.7,4.9-7.4,9.8-11.1,14.6c-12.4,16.2-24.8,32.3-37.4,48.3c-6.3,8-12.6,16-19,24c-3.2,4-6.3,8-9.5,12c-3.1,3.8-6,8.4-9.5,11.8
            c-1.4-0.8-2.8-2.6-3.8-3.8c-36.7-46.6-73.3-93.2-108.2-141.1c-54-74.1-105.6-149.9-151.5-229.4c-26.5-45.9-50.7-92.8-69.2-142.6
            c-10.7-28.9-19.2-58.5-22.3-89.3c-3.4-34.2-0.2-67.9,8.6-101C646.8,199.2,723,114.2,843.5,69.5c24.5-9.1,50-14.9,76.2-17.1
            C926.2,51.8,932.6,51.2,939,50.7z"/>
          <path class="svgIconStyle" fill="#f4f4f4" fill-opacity="0.9" d="M810.6,407.3c-3,65.9,53.7,149,150.2,148.9c76.8-0.1,149.4-61.6,149.7-149.2c0.3-86.1-70.6-150.5-150.7-150.8
            C881.2,255.7,808.2,323.6,810.6,407.3z"/>
        </g>
      </svg>`
  });
};

function generateFavoritedIcon(color) {
  // based on an icon created by Naomi Wagner based on https://www.onlinewebfonts.com/icon/467018 (CC BY license)
  const divisor = 25;
  const width = 1920 / divisor;
  const height = 1080 / divisor;
  const outlineColor = "#262626";
  return L.divIcon({
    className: "custom_divicon",
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [0,-(height/5)*4],
    html:
      `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px" y="0px" width="${width}" height="${height}" viewBox="0 0 1920 1080"
        style="enable-background:new 0 0 1920 1080;" xml:space="preserve"
      >
        <style type="text/css">
          .svgIconStyle{stroke:${outlineColor};stroke-width:50;stroke-miterlimit:10;}
        </style>
        <g>
          <path class="svgIconStyle" fill=${color} d="M938.9,50.4c28.4-1.7,56.9-0.1,83.2,5c104.3,20.6,185.6,75.2,242.1,165.4c32.8,52.4,49.8,110,51.9,171.9
            c1.2,36.3-5.6,71.1-17.6,105.2c-19.1,54.4-44.9,105.6-73.3,155.5c-53,93.3-114.1,181.1-178.6,266.6c-6.3,8.3-12.6,16.6-19,24.9
            c-11.8,15.3-23.6,30.6-35.6,45.7c-6,7.6-12,15.1-18,22.7c-3,3.8-6,7.5-9,11.3c-0.8,1-1.6,2-2.4,2.9c-0.6,0.7-1.3,2.2-2.1,2.6
            c-1.3,0.7-3.3-2.2-4.2-3.3c-36.7-46.6-73.3-93.2-108.2-141.1c-54-73.9-105.6-149.7-151.6-229.3c-26.5-45.9-50.7-92.8-69.2-142.6
            c-10.7-28.9-19.2-58.5-22.3-89.3c-3.4-34.2-0.2-67.9,8.6-101c33.1-123.9,109.3-208.9,229.8-253.6C872.7,59,905.8,52.4,938.9,50.4z"
          />
          <path class="svgIconStyle" fill="${outlineColor}" fill-opacity="0.9" d="M723.2,408.3c-4.8,104.3,85,235.9,237.8,235.7c121.5-0.2,236.6-97.5,237-236.2
            c0.4-136.3-111.7-238.2-238.6-238.8C834.9,168.4,719.2,275.9,723.2,408.3z"
          />
          <path class="svgIconStyle" fill="gold" d="M959,192.6c0.1-0.1,0.1-0.2,0.2-0.3c1.7,1.8,3.1,4.7,4.3,7c19,37.7,38.1,75.3,56.7,113.2c3,6.1,7.1,8,13,8.9
            c41.9,6.6,83.9,13.1,126.4,18.8c-0.9,4.6-4.4,7.4-7.2,10.5c-17.2,19.6-35.8,37.9-54.1,56.4c-10.2,10.3-20.2,20.7-30.7,30.7
            c-3.6,3.4-4.6,6.6-3.7,11.5c6.9,39.7,13.6,79.4,20.3,119c0.6,3.6,1.1,7.3,1.8,11.8c-6-0.8-10.6-3.6-15.2-6
            c-35.2-18.5-70.5-37-105.6-55.8c-3.7-2-6.4-2-10.2,0c-36.7,19.5-73.6,38.7-110.4,58c-2.9,1.5-5.9,2.8-10.1,4.7
            c1.7-11.4,3.1-21.7,4.8-31.9c5.6-33.7,11.2-67.3,17.1-100.9c0.8-4.3-0.4-6.8-3.2-9.7c-25.7-25.7-51.8-51-76.6-77.7
            c-5.9-6.3-12-12.5-17.1-20.3c27.1-3.8,53.3-7.4,79.4-11.2c15.4-2.2,30.7-4.9,46.1-7c6.5-0.9,10.8-4.2,14.1-9.4
            c5.9-9.2,11-18.9,15.8-28.8c13.7-28.3,27.3-56.8,41-85.1C956.9,197,957.9,194.8,959,192.6z"
          />
        </g>
      </svg>`
  });
};

function getParentOverlayLabel(name) {
  return (
    `<span class='parentLayer'>${name}</span>`
  );
}

function getLayerInfoOverlayChild(layerInfo, options) {
  let label = "";
  if (layerInfo.color != null) {
    label += `<span style='color: ${layerInfo.color};'>&#9724;</span> `;
  }
  label += `<span class=${options && "labelClassName" in options ? options.labelClassName : "leafLayer"}>${layerInfo.name}`;
  if ("markerCount" in layerInfo && layerInfo.markerCount > 0) {
    label += ` (${layerInfo.markerCount}  marker${layerInfo.markerCount > 1 ? "s" : ""})`;
  }
  label += "</span>";
  return {
    label: label,
    layer: layerInfo.layer,
    radioGroup: options && "radioGroupName" in options ? options.radioGroupName : "",
  };
}

function getChildLayerGroupOverlaySubtree(group, options) {
  const children = [];
  // sort child layers if sortFunction is provided in options
  const childLayerKeys = options && (options.sort)
    ? "sortFunction" in options
      ? [...group.childLayers.keys()].sort(options.sortFunction)
      : [...group.childLayers.keys()].sort()
    : group.childLayers.keys();
  // generate a leaf overlay object for each child
  for (const key of childLayerKeys) {
    const layerInfo = group.getChildLayer(key);
    children.push(getLayerInfoOverlayChild(layerInfo, options));
  }
  return {
    label: getParentOverlayLabel(group.name),
    selectAllCheckbox: "selectAllCheckbox" in options ? options.selectAllCheckbox : false,
    collapsed: "collapsed" in options ? options.collapsed : true,
    children: children,
  };
}

function getCheckedInLayer(markerClusterSupportGroup, layerOptions) {
  const layer = L.layerGroup([], layerOptions);
  markerClusterSupportGroup.checkIn(layer);
  return layer;
}

function getPropertyDetailsLink(pin) {
  return `<a href="https://www.cookcountyassessor.com/pin/${pin}" target="_blank" rel="noopener">Assessor's Office</a>`;
}

function getMarkerPopupContent(markerData, options) {
  const popupContentDiv = $("<div></div>")
    .append($(`<div>${markerData.datagroup.name}</div>`).addClass("center underlined")); // header with datagroup name
  options && "getDataToDisplay" in options && popupContentDiv.append(
    $("<p></p>").append(options.getDataToDisplay(markerData))
  );
  options && "getFormElementsToDisplay" in options && popupContentDiv.append(
    $("<div></div>").addClass("center").append(options.getFormElementsToDisplay(markerData))
  );
  return popupContentDiv.get(0); // unwrap to return DOM node
}

// if includeConfirmationButton is true, then a button will be included as a child of the returned element
// and onSelect will be called when that button is clicked rather than when an option is chosen
function getSelect(selectLabel, optionList, onSelect, includeConfirmationButton, buttonText) {
  const form = $(`<span><label>${selectLabel}</label></span>`);
  const select = $("<select></select>")
    .html(optionList.map((option) => { return `<option value="${option}">${option}</option>` }));
  form.append(select);
  if (includeConfirmationButton) {
    form.append(
      $(`<button type="button">${buttonText}</button>`)
        .on("click", () => onSelect(select.val()))
    );
  } else {
    select.on("change", (event) => onSelect(event.target.value));
  }
  return form;
}

function getToggleVisibilityButton(element, showButtonText, hideButtonText, callback) {
  const getButtonText = () => { return element.is(":visible") ? hideButtonText : showButtonText; };
  const button = $(`<button type='button'>${getButtonText()}</button>`);
  return button.on("click", (event) => element.toggle(() => {
      button.text(getButtonText());
      callback && callback();
  }))
}

/* based on https://www.digitalocean.com/community/tutorials/react-tabs-component (joshtronic and christinagorton, CC BY-NC-SA 4.0 license) */
function getTabs(tabs) {
  let initiallyActiveTab = null;
  const setActiveTab = (activeTabLabel) => {
    for (const tab of tabs) {
      if (tab.label === activeTabLabel) {
        tab.tabElement.addClass("activeTab");
        "callback" in tab ? tab.tabContent.show(0, tab.callback) : tab.tabContent.show(0);
      } else {
        tab.tabElement.removeClass("activeTab");
        "callback" in tab ? tab.tabContent.hide(0, tab.callback) : tab.tabContent.hide(0);
      }
    };
  }
  const tabElements = tabs.map((tab) => {
    tab.tabElement = $(`<li>${tab.label}</li>`).attr("id", tab.id)
      .addClass("tabListItem")
      .on("click", (event) => { setActiveTab(tab.label); });
    if (!initiallyActiveTab && tab.initiallyActive) {
      initiallyActiveTab = tab.label;
    }
    return tab.tabElement;
  });
  initiallyActiveTab && setActiveTab(initiallyActiveTab); // set initial active tab
  return $('<ol></ol>').addClass("tabList")
    .append(tabElements);
}

function getOpenInNewTabLink(url, displayText) {
  return `<a href=${url} target='_blank' rel='noopener'>${displayText ? displayText : url}</a>`;
};

function compare(a, b, tiebreakerFunction) {
  return a < b ? -1 : a > b ? 1 : (tiebreakerFunction != null) ? tiebreakerFunction() : 0;
}

function generateTable(caption, data, columns) {
  const headerCells = $("<tr></tr>").append(columns.map((col) => `<th>${col.label}</th>`));
  const bodyRows = data.map((datum) => {
    return $("<tr></tr>").append(
      columns.map((col) => $("<td></td>").append(col.function(datum)))
    );
  });
  return $("<table></table>").append([
    `<caption>${caption}</caption>`,
    $("<thead></thead>").append(headerCells),
    $("<tbody></tbody>").append(bodyRows),
  ]);
}

function generateMetadataTable(caption, metadataList) {
  const datefields = [
    { accessor: "createdAt", label: "Created on" },
    { accessor: "dataUpdatedAt", label: "Data updated on" },
    { accessor: "metadataUpdatedAt", label: "Metadata updated on" },
  ];
  return generateTable(
    caption,
    metadataList.sort((a, b) => compare(a.name, b.name, null)),
    [
      { label: "Dataset", function: (datum) => getOpenInNewTabLink(datum.dataUri, datum.name) },
      { label: "Provided By", function : (datum) => getOpenInNewTabLink(datum.attributionLink, datum.attribution), },
      { label: "Last Modified<br>(as of Access Date)", function: (datum) => {
          const dateItems = [];
          datefields.forEach((field) => {
            datum[field.accessor] && dateItems.push(`<li>${field.label} ${datum[field.accessor]}</li>`);
          });
          return dateItems.length > 0 ? $("<ul></ul>").append(dateItems) : null;
        }
      },
      { label: "Access Date", function: (datum) => datum.accessedOn },
      { label: "Description", function: (datum) => datum.description },
      { label: "Map Usage Notes", function: (datum) => datum.dataUseNotes },
    ]
  );
}

function generateFavoritedMarkersTable(favoritedMarkers) {
  return generateTable(
    "Favorited Markers",
    favoritedMarkers,
    [
      { label: "Category", function: (markerData) => markerData.datagroup.name },
      { label: "Subcategory", function: (markerData) => markerData.layerInfo.name },
      { label: "Data", function: (markerData) => {
        const markerPopupContentOptions = markerData.datagroup.markerPopupContentOptions;
        return markerPopupContentOptions && "getDataToDisplay" in markerPopupContentOptions
          ? markerPopupContentOptions.getDataToDisplay(markerData)
          : null;
      }},
      { label: "Additional Info", function: (markerData) => {
        return $("<div></div>").addClass("center")
          .append(
            $("<button type='button'>Show on Map</button>").addClass("showOnMapButton")
              .data("markerData", markerData)
          )
          .get(0);
      }},
    ]
  );
}

function getMarkerClusterTooltipContent(childMarkers) {
  const childDatagroups = {};
  for (const marker of childMarkers) {
    const datagroupName = marker instanceof DatagroupAwareMarker ? marker.getDatagroupName() : "Unknown Category";
    if (datagroupName in childDatagroups) {
      childDatagroups[datagroupName]++;
    } else {
      childDatagroups[datagroupName] = 1;
    }
  }
  return $("<div></div>")
    .addClass("markerClusterPopupContent")
    .append($(`<span>This marker cluster contains ${childMarkers.length} markers:</span>`).addClass("bolded"))
    .append($("<ul></ul>").append(
        [...Object.keys(childDatagroups)].sort().map((datagroupName) => {
          return `<li>${childDatagroups[datagroupName]} marker${childDatagroups[datagroupName] == 1 ? "" : "s"} from "${datagroupName}"</li>`;
        })
      )
    )
    .get(0);
}

function searchDatagroupsForIdentifier(identifier, datagroups) {
  const searchResults = {};
  for (const datagroup of datagroups) {
    if ("getMarkerData" in datagroup) {
      const searchResult = datagroup.getMarkerData(identifier);
      if (searchResult) {
        searchResults[datagroup.name] = searchResult;
      }
    }
  }
  return searchResults;
}

function getDataByPinViaAjax(pin, done, fail, always) {
  const jqxhr = $.ajax({
    url: "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json",
    type: "GET",
    data: {
      "$query" : `SELECT pin, property_address, property_zip, property_city, ward, latitude, longitude WHERE (pin = '${pin}') AND (latitude IS NOT NULL) AND (longitude IS NOT NULL) LIMIT 1`,
    },
    datatype: "json",
  });
  done && jqxhr.done(done);
  fail && jqxhr.fail(fail);
  always && jqxhr.always(always);
}

function showMarkerOnMap(map, markerData, callback) {
  const marker = markerData.marker;
  const layer = markerData.layerInfo.layer;
  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
  map.flyTo(marker.getLatLng(), map.getMaxZoom(), { duration: 0.2, });
  markerClusterSupportGroup.zoomToShowLayer(
    marker,
    () => { 
      marker.openPopup();
      callback && callback();
    },
  );
}

function getPinSearchBar(map, datasetsToSearch, addSearchResultToMap) {
  const searchInput = $("<input type='search' inputmode='numeric' pattern='([\s-]*\\d[\\s-]*){14}'></input").get(0);
  const searchResultsSpan = $("<span></span>");
  const showSearchResult = (map, searchResultMarkerData, userFeedbackText, userFeedbackColor) => {
    showMarkerOnMap(map, searchResultMarkerData, () => { searchResultsSpan.css("color", userFeedbackColor).html(userFeedbackText); });
  }
  const searchButton = $("<button type='button'>Search</button>")
    .on("click", () => {
      searchResultsSpan.html("");
      if (searchInput.validity.patternMismatch || searchInput.value === "") {
        searchInput.setCustomValidity("Please enter a valid 14-digit PIN.");
        searchInput.reportValidity();
      } else {
        searchInput.setCustomValidity("");
        const pin = searchInput.value.replace(/[-\s]/g,"");
        const searchResults = searchDatagroupsForIdentifier(pin, datasetsToSearch);
        const numberOfResults = Object.keys(searchResults).length;
        if (numberOfResults < 1) {
          if (window.confirm("This PIN is not on the map. Add a new marker to the map for this PIN?")) {
            getDataByPinViaAjax(
              pin,
              (data) => {
                if (data.length < 1) {
                  searchResultsSpan.css("color", "red").text("No data could be found for this PIN.");
                } else {
                  const finalSearchResult = addSearchResultToMap(data[0]);
                  showSearchResult(map, finalSearchResult, "A new marker for this PIN has been added to the map.", "green");
                }
              },
              (jqxhr, textStatus) => { 
                searchResultsSpan.css("color", "red").text("An error occurred while trying to fetch data for this PIN.");
                console.log(`Failed to retrieve data for PIN ${pin}: ${textStatus}`);
              },
            );
          }
        } else if (numberOfResults === 1) {
          const finalSearchResult = Object.values(searchResults)[0];
          showSearchResult(map, finalSearchResult, "The results of your search have been displayed on the map.", "green");
        } else {
          searchResultsSpan.css("color", "black").html(getSelect(
            "Choose a dataset: ",
            [...Object.keys(searchResults)].sort(),
            (selection) => {
              searchResultsSpan.html("");
              const finalSearchResult = searchResults[selection];
              showSearchResult(map, finalSearchResult, "The results of your search have been displayed on the map.", "green");
            },
            true,
            "Confirm",
          ));
        }
      }
    });
  
  return $("<div></div>").addClass("formContainer")
    .append([
      $(`<label>Search for a ${getOpenInNewTabLink("https://www.cookcountyclerkil.gov/property-taxes/about-property-index-number-pin", "PIN")} on the map: </label>`).append(searchInput),
      searchButton,
      searchResultsSpan,
    ]);
}

/**
 * Helper function to download data as file.
 * Based on https://stackoverflow.com/a/30832210 (CC BY-SA 3.0 license).
 * @param data The data to include in the file.
 * @param filename The name of the file to download.
 * @param type The MIME type of the data.
 */
 function downloadDataAsFile(data, filename, type) {
  const file = new Blob([data], {type: type});
  const downloadLink = document.createElement("a");
  const url = URL.createObjectURL(file);
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
  setTimeout(function() {
    URL.revokeObjectURL(url);  
  }, 0);
}
