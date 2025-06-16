maplibregl.accessToken = mapToken;

const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
  center: listing.geometry.coordinates, 
  zoom: 9,
});


map.addControl(new maplibregl.NavigationControl());


const popup = new maplibregl.Popup({ offset: 25 })
  .setHTML(`<h6>${listing.location}</h6><p>Exact location provided after booking</p>`);

new maplibregl.Marker({ color: 'red' })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(popup) 
  .addTo(map);