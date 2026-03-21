import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { X, Navigation } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

// Fixed color palette matching the rest of the application
const colors = {
  background: "#0F1C23",
  card: "#1E293B",
  text: "#ffffff",
  textSecondary: "#94A3B8",
  border: "#334155",
};

// Haversine formula to calculate direct distance as a fallback
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ShopNavigation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState({
    distance: 0, // in km
    duration: 0, // in seconds
  });
  const [loading, setLoading] = useState(true);

  // Parse params
  const stationLat = parseFloat(params.lat as string || "0");
  const stationLng = parseFloat(params.lng as string || "0");
  const stationName = params.name as string || "";
  const stationAddress = params.address as string || "";

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setLocation(newCoords);
          
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({
                type: "UPDATE_USER_LOCATION",
                lat: newCoords.latitude,
                lng: newCoords.longitude,
              })
            );
          }
        }
      );
    })();

    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (location && stationLat && stationLng) {
      fetchRoute();
    }
  }, [location?.latitude, location?.longitude]);

  const fetchRoute = async () => {
    if (!location) return;

    try {
      // Use OSRM for routing (free public API)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${stationLng},${stationLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: route.distance / 1000, // meters to km
          duration: route.duration, // seconds
        });

        // Pass route geometry to WebView
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "DRAW_ROUTE",
              geometry: route.geometry,
              start: [location.latitude, location.longitude],
              end: [stationLat, stationLng],
            })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback: Calculate direct distance
      const dist = calculateDistance(
        location?.latitude || 0,
        location?.longitude || 0,
        stationLat,
        stationLng
      );
      setRouteInfo((prev) => ({ ...prev, distance: dist }));
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "--";
    if (seconds < 60) return "< 1 min";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  const handleStartNavigation = () => {
    if (location && webViewRef.current) {
      // Zoom in and center on user
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "START_NAVIGATION",
          lat: location.latitude,
          lng: location.longitude,
        })
      );
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; overflow: hidden; background-color: #0F1C23; }
      #map { width: 100%; height: 100vh; }
      .leaflet-control-zoom { display: none; } 
    </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([${
        location?.latitude || stationLat
      }, ${location?.longitude || stationLng}], 15);
      
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
      const fallbackLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
      });
      let fallbackEnabled = false;

      osmLayer.on('tileerror', () => {
        if (fallbackEnabled) return;
        fallbackEnabled = true;
        map.removeLayer(osmLayer);
        fallbackLayer.addTo(map);
      });

      osmLayer.addTo(map);

      // Icons
      const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
      });

      const stationIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      let userMarker = null;
      let routeLayer = null;
      let stationMarker = L.marker([${stationLat}, ${stationLng}], { icon: stationIcon }).addTo(map);

      function updateUserLocation(lat, lng) {
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }
      }

      function drawRoute(geometry, start, end) {
        if (routeLayer) map.removeLayer(routeLayer);
        
        // geometry is GeoJSON
        routeLayer = L.geoJSON(geometry, {
          style: { color: '#3b82f6', weight: 5, opacity: 0.7 }
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      }

      document.addEventListener('message', e => handleData(e.data));
      window.addEventListener('message', e => handleData(e.data));

      function handleData(dataString) {
        try {
          const data = JSON.parse(dataString);
          if (data.type === 'UPDATE_USER_LOCATION') {
            updateUserLocation(data.lat, data.lng);
          }
          if (data.type === 'DRAW_ROUTE') {
            drawRoute(data.geometry, data.start, data.end);
          }
          if (data.type === 'START_NAVIGATION') {
            map.setView([data.lat, data.lng], 18, { animate: true });
          }
        } catch(e) {}
      }
    </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        {location ? (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml, baseUrl: "https://localhost" }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            onLoadEnd={() => {
              if (location && webViewRef.current) {
                webViewRef.current.postMessage(
                  JSON.stringify({
                    type: "UPDATE_USER_LOCATION",
                    lat: location.latitude,
                    lng: location.longitude,
                  })
                );
                // Trigger route fetch again if needed/late load
                fetchRoute();
              }
            }}
          />
        ) : (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <ActivityIndicator size="large" color="#22D3EE" />
            <Text style={{ marginTop: 10, color: colors.text }}>
              Locating your position...
            </Text>
          </View>
        )}

        <View
          style={[
            styles.routeCard,
            { top: 16 + insets.top, backgroundColor: colors.card },
          ]}
        >
          <View style={styles.routeHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.routeInfo}>
              <Text
                style={[styles.stationName, { color: colors.text }]}
                numberOfLines={1}
              >
                {stationName || "Shop Location"}
              </Text>
              <Text
                style={[styles.stationAddress, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {stationAddress || "Navigating to destination"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.routeStats,
              { backgroundColor: "#0F1C23" },
            ]}
          >
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>
                {routeInfo.distance.toFixed(1)} km
              </Text>
              <Text
                style={[styles.routeStatLabel, { color: colors.textSecondary }]}
              >
                Distance
              </Text>
            </View>
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>
                {formatDuration(routeInfo.duration)}
              </Text>
              <Text
                style={[styles.routeStatLabel, { color: colors.textSecondary }]}
              >
                ETA
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.actions,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNavigation}
        >
          <Navigation size={24} color="#0F1C23" strokeWidth={2} fill="#0F1C23" />
          <Text style={styles.startButtonText}>Start Tracking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  routeCard: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 14,
  },
  routeStats: {
    flexDirection: "row",
    gap: 16,
    padding: 12,
    borderRadius: 12,
  },
  routeStat: {
    flex: 1,
  },
  routeStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22D3EE", // App theme cyan
    marginBottom: 2,
  },
  routeStatLabel: {
    fontSize: 14,
  },
  actions: {
    borderTopWidth: 1,
    padding: 24,
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#22D3EE",
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F1C23",
  },
});
