/* Author: Claire Wagner (Summer 2022 Wheaton College Research Team) */

// source: Sasha Trubetskoy, https://sashamaps.net/docs/resources/20-colors/
const colors = [
  "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
  "#469990", "#dcbeff", "#9A6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9",
];
let nextColor = 0;

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

function getDatagroupOverlaySubtree(datagroup, options) {
  const children = [];
  // sort child layers if sortFunction is provided in options
  const childLayerKeys = options && (options.sort)
    ? "sortFunction" in options
      ? [...datagroup.childLayers.keys()].sort(options.sortFunction)
      : [...datagroup.childLayers.keys()].sort()
    : datagroup.childLayers.keys();
  // generate a leaf overlay object for each child
  for (const key of childLayerKeys) {
    const layerInfo = datagroup.getChildLayer(key);
    children.push(getLayerInfoOverlayChild(layerInfo, options));
  }
  return {
    label: getParentOverlayLabel(datagroup.name),
    selectAllCheckbox: "selectAllCheckbox" in options ? options.selectAllCheckbox : false,
    collapsed: "collapsed" in options ? options.collapsed : true,
    children: children,
  };
}

function getNextColor() {
  return colors[nextColor++ % colors.length];
}

function populateDatagroupChildLayers(datagroup, getNewLayer, trackMarkerCount) {
  for (const datum of datagroup.dataIterator()) {
    const classification = datagroup.classify(datum);
    // if the LayerInfo object corresponding to classification doesn't exist yet, create it
    if (!(datagroup.childLayers.has(classification))) {
      datagroup.addChildLayer(new LayerInfo(
          classification,
          colors[nextColor++ % colors.length],
          getNewLayer(),
          trackMarkerCount,
      ));
    }
    // add marker to layer
    const layerInfo = datagroup.getChildLayer(classification);
    const marker = addMarkerToLayer(
      datum,
      datagroup,
      layerInfo,
      datagroup.getPopupContent(datum),
    );
  }
}

function getCheckedInLayer(markerClusterSupportGroup, layerOptions) {
  const layer = L.layerGroup([], layerOptions);
  markerClusterSupportGroup.checkIn(layer);
  return layer;
}

function addMarkerToLayer(data, datagroup, layerInfo, popupContent) {
  const marker = new DatagroupAwareMarker([data.latitude, data.longitude], {
    icon: generateIcon(layerInfo.color),
  });
  layerInfo.addLayer(marker);
  if (popupContent != null) {
    marker.bindPopup(popupContent, { maxHeight: 200, });
  }
  marker.registerDatagroupName(datagroup.name);
  // add marker metadata to data
  data.leafletMarkerReference = marker;
  return marker;
}

function getPropertyDetailsLink(pin) {
  return `<a href="https://www.cookcountyassessor.com/pin/${pin}" target="_blank" rel="noopener">Assessor's Office</a>`;
}

function getMarkerPopupContent(data, datagroup, dataToDisplay) {
  const dataList = dataToDisplay.map((item) => `<b>${item.label}</b>: ${item.data}`);
  return $("<div></div>")
    .append([
      $(`<div>${datagroup.name}</div>`).addClass("center underlined"), // header with datagroup name
      ($("<p></p>").addClass("increasedLineHeight").html(dataList.join("<br>"))), // data to display
    ])
    .get(0); // unwrap to return DOM node
}

function getSelect(selectLabel, optionList, onSelect) {
  const form = $(`<div><label>${selectLabel}</label></div>`).addClass("formContainer");
  const select = $("<select></select>")
    .html(optionList.map((option) => { return `<option value="${option}">${option}</option>` }))
    .on("change", (event) => onSelect(event.target.value));
  return form.append(select).get(0);
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
      $(`<button type="button">${buttonText}</button>`).addClass("smallHorizontalMargin")
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
    tab.tabElement = $(`<li>${tab.label}</li>`).addClass("tabListItem")
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

function getNewTabOpenLink(url, displayText) {
  return `<a href=${url} target='_blank' rel='noopener'>${displayText}</a>`;
};

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
    metadataList.sort((m1, m2) => {
	  // sort datasets by name
	  return m1.name < m2.name ? -1 : m1.name > m2.name ? 1 : 0;
	}),
    [
      { label: "Dataset", function: (datum) => getNewTabOpenLink(datum.dataUri, datum.name) },
      { label: "Provided By", function : (datum) => getNewTabOpenLink(datum.attributionLink, datum.attribution), },
      { label: "Last Modified", function: (datum) => {
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

function getMarkerClusterPopupContent(childMarkers) {
  const childDatagroups = {};
  for (const marker of childMarkers) {
    const datagroupName = "datagroupName" in marker.options ? marker.options.datagroupName : "Unknown Category";
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
    if ("getData" in datagroup) {
      const searchResult = datagroup.getData(identifier);
      if (searchResult) {
        searchResults[datagroup.name] = searchResult;
      }
    }
  }
  return searchResults;
}

function searchDatagroupsForIdentifierNew(identifier, datagroups) {
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

/*function getPinSearchBar(label) {
  const searchBar = $("<input type='text' inputmode='numeric'></input>")
}*/
