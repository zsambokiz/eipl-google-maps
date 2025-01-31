(function () {
  window.addEventListener('load', function () {
    const mapOptions = {
      zoom: 3,
      center: { lat: 20.0, lng: -100.0 }, // Default center of the map
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      scrollwheel: true,
      draggable: true,
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    const bounds = new google.maps.LatLngBounds();
    const markers: { marker: unknown; listItem: HTMLDivElement }[] = []; // Array to store all markers
    const infoWindows: unknown[] = [];
    //const infowindow = new google.maps.InfoWindow();
    let currentInfoWindow: { close: () => void } | null = null; // Reference to the currently open InfoWindow

    // Initialize an empty array to store locations
    const locations: {
      title: unknown;
      lat: number;
      lng: number;
      country: unknown;
      type: unknown;
      sort: unknown;
      state: unknown;
      infowindow: string;
      markerIcon: unknown;
    }[] = [];

    // Select all dynamic location items from Webflow CMS
    const dynPlaces = document.querySelectorAll('.w-dyn-item.location-item');

    // Loop through each dynamic item and extract data
    dynPlaces.forEach(function (elem) {
      const title = elem.querySelector('.data-title').innerText.trim();
      const lat = parseFloat(elem.querySelector('.data-latitude').innerText.trim());
      const lng = parseFloat(elem.querySelector('.data-longitude').innerText.trim());
      const country = elem.querySelector('.data-country').innerText.trim();
      const state = elem.querySelector('.data-state').innerText.trim();
      const type = elem.querySelector('.data-type').innerText.trim();
      const sort = elem.querySelector('.data-sort').innerText.trim();
      const infoWindowContent = elem.querySelector('.data---info-window').innerHTML;
      const markerIcon = elem.querySelector('.data-marker-icon')
        ? elem.querySelector('.data-marker-icon').innerText.trim()
        : 'default-marker-url.png';

      // Add the location to the locations array
      locations.push({
        title: title,
        lat: lat,
        lng: lng,
        country: country,
        type: type,
        sort: sort,
        state: state,
        infowindow: infoWindowContent,
        markerIcon: markerIcon,
      });
    });

    window.locations = locations;

    // Create markers and list items dynamically
    function createMarkerAndListItem(location) {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.title,
        //icon: 'https://cdn.prod.website-files.com/677c22979b6f9f0a51491c76/6798b543eafd095b5ffd4ed6_pointer.svg',
        icon: {
          url: location.markerIcon,
        },
      });

      marker.metadata = { country: location.country, type: location.type, state: location.state };

      // If an info window is open, close it before opening a new one
      marker.addListener('click', function () {
        if (currentInfoWindow) {
          currentInfoWindow.close(); // Close the previously opened info window
        }
        infowindow.open(map, marker);
        currentInfoWindow = infowindow; // Update the currentInfoWindow reference
        map.setCenter(marker.getPosition());
        map.setZoom(5);
      });

      // Create list item for the location
      const listItem = document.createElement('div');
      const orderParagraph = document.createElement('p');
      orderParagraph.textContent = location.sort;
      listItem.appendChild(orderParagraph);
      listItem.textContent += ` ${location.title}`;
      listItem.dataset.country = location.country;
      listItem.dataset.type = location.type;
      listItem.dataset.state = location.state;
      listItem.setAttribute('fs-mirrorclick-element', `target-${location.sort}`);
      // Create an info window for the marker
      const infowindow = new google.maps.InfoWindow({
        content: `${location.infowindow}`,
      });

      listItem.addEventListener('click', function () {
        // Trigger the info window on map when clicking the list item
        if (currentInfoWindow) {
          currentInfoWindow.close(); // Close the previously opened info window
        }
        infowindow.open(map, marker);
        currentInfoWindow = infowindow;
        map.setCenter(marker.getPosition());
        map.setZoom(10);
      });

      infoWindows.push(infowindow);

      /// Function to close all InfoWindows
      function closeAllInfoWindows() {
        infoWindows.forEach((infoWindow) => {
          infoWindow.close();
        });
      }

      // Select all buttons with the same data-action attribute
      const actionElements = document.querySelectorAll('[data-action="close-info-windows"]');

      // Add an event listener to each element
      actionElements.forEach((element) => {
        element.addEventListener('click', function (event) {
          event.preventDefault(); // Prevent default action for <a> elements
          closeAllInfoWindows();
        });
      });

      // Append the list item to the list container (ensure this exists in your HTML)
      const distributorList = document.getElementById('distributor-list');
      distributorList.appendChild(listItem);

      return { marker, listItem };
    }

    // Initialize map with CMS data
    function initMap() {
      // Loop through locations and create markers and list items
      locations.forEach((location) => {
        const { marker, listItem } = createMarkerAndListItem(location);
        markers.push({ marker, listItem });
        bounds.extend(marker.getPosition());
      });

      // Fit map to show all markers
      map.fitBounds(bounds);
    }

    // Filter function to show only markers and list items matching the filters
    function filterMarkersAndList() {
      const selectedCountry = document.getElementById('country-filter').value;
      const selectedType = document.getElementById('type-filter').value;
      const selectedState = document.getElementById('state-filter').value;

      const filteredBounds = new google.maps.LatLngBounds();
      let hasVisibleMarkers = false;

      markers.forEach(({ marker, listItem }) => {
        const matchesCountry =
          selectedCountry === '' || marker.metadata.country === selectedCountry;
        const matchesType = selectedType === '' || marker.metadata.type === selectedType;
        const matchesState = selectedState === '' || marker.metadata.state === selectedState;

        if (matchesCountry && matchesType && matchesState) {
          marker.setMap(map);
          listItem.style.display = 'block';
          filteredBounds.extend(marker.getPosition());
          hasVisibleMarkers = true;
        } else {
          marker.setMap(null);
          listItem.style.display = 'none';
        }
      });

      // Adjust map to show filtered markers or reset to default view
      if (hasVisibleMarkers) {
        map.fitBounds(filteredBounds);
        if (map.getZoom() > 7) {
          map.setZoom(7); // Set the zoom to 10 or your desired minimum zoom
        }
      } else {
        map.setZoom(3);
      }
    }

    // Add event listeners for filters
    document.getElementById('country-filter').addEventListener('change', filterMarkersAndList);
    document.getElementById('type-filter').addEventListener('change', filterMarkersAndList);
    document.getElementById('state-filter').addEventListener('change', filterMarkersAndList);

    // Initialize the map and locations
    initMap();
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  const countrySelect = document.getElementById('country-filter');
  const stateDisplayDiv = document.querySelector('.fs-select-2[state-display="true"]');

  countrySelect.addEventListener('change', function () {
    if (countrySelect.value === 'United States') {
      stateDisplayDiv.style.display = 'block';
    } else {
      stateDisplayDiv.style.display = 'none';
    }
  });
});

/*document.getElementById('country-filter').addEventListener('change', function () {
  const selectedCountry = this.value;
  const stateFilter = document.getElementById('state-filter');

  // Reset the state filter if the selected country is not "United States"
  if (selectedCountry !== 'United States') {
    stateFilter.value = ''; // Reset the state select
    stateFilter.dispatchEvent(new Event('change')); // Trigger the change event
  }
});
*/

document.getElementById('country-filter').addEventListener('change', function () {
  const selectedCountry = this.value;

  // Check if the selected country is not "United States"
  if (selectedCountry !== 'United States') {
    // Find the sibling of the state select with the attribute `fs-selectcustom-element="option-reset"`
    const stateFilter = document.getElementById('state-filter');
    const optionResetButton = stateFilter?.parentElement.querySelector(
      '[fs-selectcustom-element="option-reset"]'
    );

    // Trigger a click event on the option-reset button if it exists
    if (optionResetButton) {
      optionResetButton.click();
    }
  }
});
