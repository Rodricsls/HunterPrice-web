import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9kcmljazE0IiwiYSI6ImNtMGFja295bzIwazQybnB3bXN2bzVka20ifQ.Hof7PLzBR1heGtearK6Jrg";

const API_BASE_URL = "https://api.hunterprice.online/api";

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const tienda = params.tienda;
  const Lat = url.searchParams.get("latitud");
  const Lng = url.searchParams.get("longitud");
  const destLat = url.searchParams.get("destLat");
  const destLng = url.searchParams.get("destLng");

  const response = await fetch(
    `${API_BASE_URL}/locations/?tienda=${tienda}&userLat=${Lat}&userLng=${Lng}&destLat=${destLat}&destLng=${destLng}`
  );

  if (!response.ok) {
    throw new Response("Failed to load location data", { status: 500 });
  }

  const data = await response.json();
  return json({ locations: data.locations || [], route: data.route || null });
};

export default function MapScreen() {
  const { locations, route } = useLoaderData<{
    locations: any[];
    route: any;
  }>();

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapInstance = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [0, 0],
          zoom: 10,
        });
  
        // Add user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation([longitude, latitude]);
  
              new mapboxgl.Marker({ color: "blue" })
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`<p>Current Location</p>`))
                .addTo(mapInstance);
  
              mapInstance.flyTo({ center: [longitude, latitude], zoom: 10 });
            },
            (error) => console.error("Error fetching user location:", error)
          );
        }
  
        // Add markers for locations
        if (Array.isArray(locations)) {
          locations.forEach((location) => {
            if (location.latitud && location.longitud) {
              new mapboxgl.Marker({ color: "red" })
                .setLngLat([location.latitud, location.longitud])
                .setPopup(
                  new mapboxgl.Popup().setHTML(
                    `<h3>${location.nombre_tienda}</h3><p>${location.direccion}</p>`
                  )
                )
                .addTo(mapInstance);
            } else {
              console.warn("Invalid location coordinates:", location);
            }
          });
        } else {
          console.error("Invalid locations data:", locations);
        }
  
        // Add route if available
        if (route.route && route.route.type === "LineString") {
          mapInstance.on("load", () => {
            mapInstance.addSource("route", {
              type: "geojson",
              data: route.route,
            });
  
            mapInstance.addLayer({
              id: "route",
              type: "line",
              source: "route",
              paint: {
                "line-color": "#FFA500",
                "line-width": 5,
                "line-dasharray": [1, 1],
              },
            });
          });
        } else {
          console.error("Invalid route data:", route);
        }
  
        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
  
    initializeMap();
  
    return () => map?.remove();
  }, [locations, route]);
  

  return (
    <div className="w-full h-screen relative">
      {!userLocation && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/75 z-50">
          <p>Loading user location...</p>
        </div>
      )}
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}
