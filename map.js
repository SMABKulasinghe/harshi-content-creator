let map;
let markers = [];
let userLocationMarker = null;
let isNearMeFilterActive = false;

// Initialize map once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Kurunegala coordinates as the center
    const kurunegala = [7.4818, 80.3609];

    // Initialize the Leaflet map
    map = L.map('google-map', {
        scrollWheelZoom: false
    }).setView(kurunegala, 14);

    // Use CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Load initial data
    if (typeof placesData !== 'undefined' && placesData.length > 0) {
        populateMapAndList(placesData);
    } else {
        document.getElementById('places-list').innerHTML = `<div class="place-loading">Failed to load locations. Check data.js</div>`;
    }

    // Set up 'Near Me' button
    const nearMeBtn = document.getElementById('near-me-btn');
    if (nearMeBtn) {
        nearMeBtn.addEventListener('click', handleNearMeClick);
    }
});

function handleNearMeClick() {
    const nearMeBtn = document.getElementById('near-me-btn');
    
    if (isNearMeFilterActive) {
        // Reset filter
        isNearMeFilterActive = false;
        nearMeBtn.classList.remove('active');
        nearMeBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Near Me (&lt; 1km)';
        
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
            userLocationMarker = null;
        }
        
        // Remove distance property from places to clean up UI
        placesData.forEach(p => delete p.distance);
        populateMapAndList(placesData);
        
    } else {
        // Activate filter
        if ("geolocation" in navigator) {
            nearMeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    isNearMeFilterActive = true;
                    nearMeBtn.classList.add('active');
                    nearMeBtn.innerHTML = '<i class="fa-solid fa-times"></i> Reset Filter';
                    
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    
                    // Add user location marker
                    const userIcon = L.divIcon({
                        className: 'user-map-marker',
                        html: `<div style="background-color: #2196F3; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                        popupAnchor: [0, -10]
                    });
                    
                    if (userLocationMarker) map.removeLayer(userLocationMarker);
                    userLocationMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
                    userLocationMarker.bindPopup('<b>You are here</b>');

                    // Filter places within 1km
                    const nearPlaces = placesData.filter(place => {
                        const dist = getDistanceFromLatLonInKm(userLat, userLng, place.lat, place.lng);
                        place.distance = dist; // Store for UI
                        return dist <= 1.0;
                    });
                    
                    // Sort by distance
                    nearPlaces.sort((a, b) => a.distance - b.distance);
                    populateMapAndList(nearPlaces, [userLat, userLng]);
                },
                (error) => {
                    alert("Could not get your location. Please ensure location services are enabled.");
                    nearMeBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Near Me (&lt; 1km)';
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }
}

function populateMapAndList(places, userCoords = null) {
    const listContainer = document.getElementById('places-list');
    listContainer.innerHTML = '';
    
    // Clear old markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    const bounds = L.latLngBounds();
    if (userCoords) {
        bounds.extend(userCoords);
    }

    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: var(--pink); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });

    places.forEach((place, index) => {
        const position = [place.lat, place.lng];
        const marker = L.marker(position, { icon: customIcon }).addTo(map);

        markers.push(marker);
        bounds.extend(position);

        const distHtml = place.distance !== undefined ? `<div class="views" style="color:#666; margin-bottom: 4px;"><i class="fa-solid fa-person-walking"></i> ${(place.distance * 1000).toFixed(0)}m away</div>` : '';

        const contentString = `
            <div class="map-info-window">
                <h4>${place.name}</h4>
                <p class="cat">${place.category}</p>
                <p>${place.description}</p>
                ${distHtml}
                <div class="views"><i class="fa-solid fa-fire"></i> ${place.views} views</div>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="directions-btn"><i class="fa-solid fa-location-arrow"></i> Get Directions</a>
            </div>
        `;

        marker.bindPopup(contentString);

        marker.on('click', () => {
            document.querySelectorAll('.place-item').forEach(el => el.classList.remove('active'));
            const listItem = document.getElementById(`place-${index}`);
            if (listItem) {
                listItem.classList.add('active');
                listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        const listItem = document.createElement('div');
        listItem.className = 'place-item';
        listItem.id = `place-${index}`;
        
        const listDistHtml = place.distance !== undefined ? `<div class="place-views" style="color:#666; font-size: 0.75rem;"><i class="fa-solid fa-person-walking"></i> ${(place.distance * 1000).toFixed(0)}m away</div>` : '';

        listItem.innerHTML = `
            <div class="place-name">${place.name}</div>
            <div class="place-cat">${place.category}</div>
            <div class="place-views"><i class="fa-solid fa-fire"></i> ${place.views} views</div>
            ${listDistHtml}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="list-directions-btn" onclick="event.stopPropagation();"><i class="fa-solid fa-location-arrow"></i> Directions</a>
        `;
        
        listItem.addEventListener('click', () => {
            marker.openPopup();
            map.flyTo(position, 16);
            document.querySelectorAll('.place-item').forEach(el => el.classList.remove('active'));
            listItem.classList.add('active');
        });

        listContainer.appendChild(listItem);
    });

    if (places.length > 0 || userCoords) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
        listContainer.innerHTML = `<div class="place-loading">No locations found within 1km.</div>`;
    }
}

// Distance Calculation (Haversine Formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
