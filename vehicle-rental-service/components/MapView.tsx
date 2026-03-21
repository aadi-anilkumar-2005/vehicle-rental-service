import React, { useRef, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { RentalShop } from "@/types";

interface MapViewProps {
  shops: RentalShop[];
  userLocation?: { latitude: number; longitude: number } | null;
  onShopClick: (shopId: string) => void;
}

export const NativeMapView = ({ shops, userLocation, onShopClick }: MapViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const payload = useMemo(
    () => ({
      type: "MAP_DATA_UPDATE",
      userLocation: userLocation || null,
      shops: shops.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        lat: s.latitude,
        lng: s.longitude,
      })),
    }),
    [shops, userLocation]
  );

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
      
      .custom-popup .leaflet-popup-content-wrapper {
        background: #1E293B;
        color: #fff;
        border-radius: 8px;
        border: 1px solid #334155;
      }
      .custom-popup .leaflet-popup-tip {
        background: #1E293B;
      }
      .popup-title {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 4px;
        color: #22D3EE;
      }
      .popup-address {
        font-size: 12px;
        color: #94A3B8;
        margin-bottom: 8px;
      }
      .popup-btn {
        background: #22D3EE;
        color: #0F1C23;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        width: 100%;
        cursor: pointer;
      }
    </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([23.8103, 90.4125], 12);
      
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

      const shopIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background:#2563EB;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.35);"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      let shopMarkers = [];
      let userMarker = null;

      window.handleShopClick = function(id) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHOP_CLICK', id: id }));
      };

      function clearShops() {
        shopMarkers.forEach((m) => map.removeLayer(m));
        shopMarkers = [];
      }

      function renderMapData(data) {
        const points = [];
        clearShops();

        if (data.userLocation && data.userLocation.latitude && data.userLocation.longitude) {
          const userLatLng = [data.userLocation.latitude, data.userLocation.longitude];
          points.push(userLatLng);
          if (!userMarker) {
            userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          } else {
            userMarker.setLatLng(userLatLng);
          }
        }

        (data.shops || []).forEach((shop) => {
          if (shop.lat == null || shop.lng == null) return;
          const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon }).addTo(map);
          const safeName = (shop.name || '').replace(/"/g, '&quot;');
          const safeAddress = (shop.address || '').replace(/"/g, '&quot;');
          const shopId = String(shop.id || '');

          const popupContent = \`
            <div class="popup-title">\${safeName}</div>
            <div class="popup-address">\${safeAddress}</div>
            <button class="popup-btn" onclick="window.handleShopClick('\${shopId}')">View Details</button>
          \`;
          marker.bindPopup(popupContent, { className: 'custom-popup' });
          shopMarkers.push(marker);
          points.push([shop.lat, shop.lng]);
        });

        if (points.length === 1) {
          map.setView(points[0], 14);
        } else if (points.length > 1) {
          map.fitBounds(points, { padding: [40, 40] });
        }
      }

      function handleData(dataString) {
        try {
          const data = JSON.parse(dataString);
          if (data.type === 'MAP_DATA_UPDATE') {
            renderMapData(data);
          }
        } catch (e) {}
      }

      document.addEventListener('message', (event) => handleData(event.data));
      window.addEventListener('message', (event) => handleData(event.data));
    </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SHOP_CLICK' && data.id) {
        onShopClick(data.id);
      }
    } catch (e) {
      console.error("Failed to parse webview message", e);
    }
  };

  useEffect(() => {
    if (!isMapReady || !webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify(payload));
  }, [payload, isMapReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml, baseUrl: "https://localhost" }}
        style={styles.map}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onMessage={handleMessage}
        onLoadEnd={() => {
          setIsMapReady(true);
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify(payload));
          }
        }}
        scrollEnabled={false}
      />
      <View style={styles.overlay}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {shops.length} rental shops nearby
          </Text>
        </View>
      </View>
    </View>
  );
};

export { NativeMapView as MapView };

const styles = StyleSheet.create({
  container: {
    height: 256, // h-64 equivalent
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0F1C23", // Keep dark theme consistent behind webview
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  pill: {
    backgroundColor: "rgba(30, 41, 59, 0.95)", // #1E293B matching dark theme
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0", // Slate 200
  },
});
