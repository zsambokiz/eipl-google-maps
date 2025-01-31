// Wait for the page to load
window.addEventListener('load', function () {
  const locations: unknown[][] = [];
  const dynPlaces = document.querySelectorAll('.w-dyn-item.contact_item');

  dynPlaces.forEach(function (elem) {
    const dataTitle = elem.querySelector('.data---slug').innerText;
    const dataLat = Number(elem.querySelector('.data---latitude').innerText);
    const dataLong = Number(elem.querySelector('.data---longitude').innerText);
    const infoWindowContent = elem.querySelector('.data---info-window').innerHTML;
    const markerIcon = elem.querySelector('.data-marker-icon')
      ? elem.querySelector('.data-marker-icon').innerText.trim()
      : 'default-marker-url.png';

    locations.push([dataTitle, infoWindowContent, dataLat, dataLong, markerIcon]);
  });

  const mapOptions = {
    zoom: 3.5,
    center: { lat: 38.0, lng: -30.0 },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    scrollwheel: false,
    draggable: true,
  };

  const map = new google.maps.Map(document.getElementById('map'), mapOptions);

  const infowindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds(); // Create bounds object

  // Function to create markers
  function createMarker(latlng, html, markerIcon) {
    const marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: markerIcon ? { url: markerIcon } : null,
    });

    marker.addListener('click', () => {
      map.setZoom(5);
      map.setCenter(marker.getPosition());
    });

    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(html);
      infowindow.open(map, marker);
    });

    // Extend bounds to include this marker's position
    bounds.extend(latlng);

    return marker;
  }

  // Initialize map and markers
  function initMap() {
    locations.forEach((location) => {
      const [dataTitle, infoWindowContent, dataLat, dataLong, markerIcon] = location;
      const latLng = new google.maps.LatLng(dataLat, dataLong);
      createMarker(latLng, infoWindowContent, markerIcon);
    });

    // Fit the map to the bounds of all markers
    map.fitBounds(bounds);

    // Add the reset button functionality
    document.getElementById('reset-map').addEventListener('click', () => {
      map.fitBounds(bounds); // Reset to fit all markers
      infowindow.close();
    });

    window.googleMap = map; // Expose map to the global scope
  }

  // Call the initMap function
  initMap();
});
