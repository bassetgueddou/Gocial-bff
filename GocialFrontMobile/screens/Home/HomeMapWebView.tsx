import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../ThemeContext';
import { useActivities } from '../../src/hooks/useActivities';
import { useFilters } from '../../src/contexts/FilterContext';
import FilterBar from './FilterBar';
import type { Activity } from '../../src/types';

const HomeMapWebView: React.FC = () => {
    // ════════════════════════════════════════════════════════════
    // BLOC 1 — TOUS les hooks ici, SANS EXCEPTION
    // ⚠️ RÈGLE HOOKS : ne JAMAIS ajouter de return conditionnel avant la fin de ce bloc
    // ════════════════════════════════════════════════════════════
    const { isDarkMode } = useTheme();
    const { filters } = useFilters();
    const { activities, loading } = useActivities({ filters });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const webViewRef = useRef<WebView>(null);

    const recenter = useCallback(() => {
        Geolocation.getCurrentPosition(
            pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                webViewRef.current?.injectJavaScript(
                    `map.setView([${loc.lat}, ${loc.lng}], 14); true;`
                );
            },
            error => {
                if (__DEV__) console.log('[HomeMapWebView] Géoloc error:', error.message);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
        );
    }, []);

    const mapActivities = useMemo(
        () => activities.filter((a: Activity) => a.latitude != null && a.longitude != null),
        [activities]
    );

    const markersJson = useMemo(
        () => JSON.stringify(
            mapActivities.map((a: Activity) => ({
                id: a.id,
                lat: a.latitude,
                lng: a.longitude,
                title: a.title ?? '',
                category: a.category ?? '',
            }))
        ),
        [mapActivities]
    );

    const center = useMemo(() => {
        if (userLocation) return userLocation;
        if (mapActivities.length > 0) {
            return { lat: mapActivities[0].latitude!, lng: mapActivities[0].longitude! };
        }
        return { lat: 48.8566, lng: 2.3522 };
    }, [userLocation, mapActivities]);

    const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = isDarkMode
        ? '&copy; CartoDB &copy; OpenStreetMap'
        : '&copy; OpenStreetMap';

    const mapHtml = useMemo(() => `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${isDarkMode ? '#000' : '#fff'}; }
        #map { width: 100vw; height: 100vh; }
        .leaflet-popup-content-wrapper {
            background: ${isDarkMode ? '#1D1E20' : '#fff'};
            color: ${isDarkMode ? '#fff' : '#000'};
            border-radius: 8px;
        }
        .leaflet-popup-tip { background: ${isDarkMode ? '#1D1E20' : '#fff'}; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', { zoomControl: true }).setView([${center.lat}, ${center.lng}], 12);

        L.tileLayer('${tileUrl}', {
            attribution: '${attribution}',
            maxZoom: 19
        }).addTo(map);

        var activities = ${markersJson};

        function getCatColor(cat) {
            switch ((cat || '').toLowerCase()) {
                case 'sport': return '#3B82F6';
                case 'jeu': return '#EF4444';
                case 'sortie': return '#8B5CF6';
                case 'culture': return '#F97316';
                default: return '#6B7280';
            }
        }

        function makeIcon(color) {
            return L.divIcon({
                className: '',
                html: '<div style="width:14px;height:14px;border-radius:50%;background:'+color+';border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7],
                popupAnchor: [0, -10]
            });
        }

        activities.forEach(function(a) {
            if (a.lat && a.lng) {
                L.marker([a.lat, a.lng], { icon: makeIcon(getCatColor(a.category)) })
                    .addTo(map)
                    .bindPopup('<b>' + a.title + '</b><br/>' + (a.category || ''));
            }
        });

        ${userLocation ? `
        L.circleMarker([${userLocation.lat}, ${userLocation.lng}], {
            radius: 8,
            fillColor: '#1A73E8',
            color: 'white',
            weight: 3,
            fillOpacity: 1
        }).addTo(map).bindPopup('Vous \\u00eates ici');
        ` : ''}
    <\/script>
</body>
</html>`, [isDarkMode, center, tileUrl, attribution, markersJson, userLocation]);

    // ════════════════════════════════════════════════════════════
    // BLOC 2 — Early returns conditionnels (APRÈS tous les hooks)
    // ════════════════════════════════════════════════════════════
    if (loading && mapActivities.length === 0) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
                <ActivityIndicator size="large" color={isDarkMode ? '#1A6EDE' : '#065C98'} />
                <Text className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Chargement de la carte...
                </Text>
            </View>
        );
    }

    // ════════════════════════════════════════════════════════════
    // BLOC 3 — Render principal
    // ════════════════════════════════════════════════════════════
    return (
        <View className="flex-1">
            <FilterBar />
            <WebView
                ref={webViewRef}
                source={{ html: mapHtml }}
                style={{ flex: 1 }}
                javaScriptEnabled
                originWhitelist={['*']}
                scrollEnabled={false}
                onError={(e) => {
                    if (__DEV__) console.log('[HomeMapWebView] error:', e.nativeEvent.description);
                }}
            />

            <TouchableOpacity
                onPress={recenter}
                className={`absolute bottom-6 right-4 w-12 h-12 rounded-full items-center justify-center shadow-lg ${isDarkMode ? 'bg-[#1D1E20]' : 'bg-white'}`}
                style={{ elevation: 4 }}
            >
                <MaterialIcons name="my-location" size={24} color={isDarkMode ? '#1A6EDE' : '#065C98'} />
            </TouchableOpacity>

            {mapActivities.length === 0 && !loading && (
                <View className={`absolute bottom-20 self-center px-4 py-2 rounded-xl shadow ${isDarkMode ? 'bg-[#1D1E20]' : 'bg-white'}`}>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aucune activité avec localisation
                    </Text>
                </View>
            )}
        </View>
    );
};

export default React.memo(HomeMapWebView);
