import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import api from '../api/axios';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});
// Add CSS to fix popup styling conflicts
const popupStyles = `
  .leaflet-popup-pane {
    z-index: 1000 !important;
  }
  .leaflet-popup {
    z-index: 1000 !important;
    background-color: rgba(255, 255, 255, 0.95) !important;
    border-radius: 10px !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
  }
  .leaflet-popup-content-wrapper {
    padding: 8px !important;
    border-radius: 10px !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
  }
  .leaflet-popup-content {
    margin: 8px 12px !important;
    font-family: system-ui, -apple-system, sans-serif !important;
    font-size: 14px !important;
    color: #374151 !important;
  }
  .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  }
  .leaflet-container a.leaflet-popup-close-button {
    color: #64748b !important;
    font-size: 16px !important;
    padding: 4px 8px !important;
    text-decoration: none !important;
    font-weight: bold !important;
  }
  .leaflet-container a.leaflet-popup-close-button:hover {
    color: #374151 !important;
    background: rgba(0, 0, 0, 0.1) !important;
    border-radius: 4px !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = popupStyles;
    if (!document.head.querySelector('style[data-leaflet-popup-fix]')) {
        styleSheet.setAttribute('data-leaflet-popup-fix', 'true');
        document.head.appendChild(styleSheet);
    }
}
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const EmergencyMap = ({ emergency }) => {
    const [nearestHospital, setNearestHospital] = useState(null);
    const [allHospitals, setAllHospitals] = useState([]);

    useEffect(() => {
        fetchAllHospitals();
        if (emergency) {
            fetchNearestHospital();
        }
    }, [emergency]);

    const fetchAllHospitals = async () => {
        try {
            const response = await api.get('/hospitals');
            setAllHospitals(response.data.data);
        } catch (error) {
            console.error('Failed to load all hospitals');
        }
    };

    const fetchNearestHospital = async () => {
        try {
            const response = await api.get(`/emergency/${emergency._id}/nearest-hospital`);
            setNearestHospital(response.data.nearestHospital);
        } catch (error) {
            console.error('Failed to load nearest hospital');
        }
    };

    if (!emergency || typeof emergency.latitude !== 'number' || typeof emergency.longitude !== 'number') {
        return <div className="h-[400px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 italic">Location data unavailable</div>;
    }

    const center = [emergency.latitude, emergency.longitude];

    return (
        <div className="h-full w-full overflow-hidden relative group">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                className="rounded-2xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} zoom={13} />

                <Marker position={center} icon={redIcon}>
                    <Popup closeButton={false} closeOnClick={false} autoClose={false} keepInView={true}>
                        <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '200px' }}>
                            <p style={{ fontWeight: 'bold', color: '#dc2626', margin: '0 0 4px 0', fontSize: '14px' }}>🚨 EMERGENCY LOCATION</p>
                            <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                Patient: {emergency.patient?.fullName || 'Anonymous Patient'}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                Contact: {emergency.patient?.contact || 'N/A'}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                Address: {emergency.patient?.address || 'N/A'}
                            </p>
                            <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                {emergency.description ? `"${emergency.description}"` : 'Emergency situation'}
                            </p>
                            <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                Reported at: {new Date(emergency.timestamp).toLocaleString() || 'N/A'}
                            </p>
                        </div>
                    </Popup>
                </Marker>

                {allHospitals.map(h => (
                    <Marker key={h._id} position={[h.lat, h.lng]} icon={blueIcon}>
                        <Popup>
                            <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                                <p style={{ fontWeight: 'bold', color: '#2563eb', margin: '0 0 4px 0', fontSize: '12px' }}>🏥 {h.name}</p>
                                <p style={{ fontSize: '10px', margin: '0', color: '#374151' }}>{h.address}</p>
                                <p style={{ fontSize: '10px', margin: '0', color: '#374151' }}>{h.contact}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {nearestHospital && (
                    <Marker position={[nearestHospital.lat, nearestHospital.lng]} icon={greenIcon}>
                        <Popup closeButton={false} closeOnClick={false} autoClose={false} keepInView={true}>
                            <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '200px' }}>
                                <p style={{ fontWeight: 'bold', color: '#059669', margin: '0 0 4px 0', fontSize: '14px' }}>🏥 NEAREST HOSPITAL</p>
                                <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                    Name: {nearestHospital.name}
                                </p>
                                <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                    Address: {nearestHospital.address || 'N/A'}
                                </p>
                                <p style={{ fontSize: '12px', fontWeight: '500', margin: '0', color: '#374151' }}>
                                    Contact: {nearestHospital.contact || 'N/A'}
                                </p>
                                <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                    📍 {nearestHospital.distance} km away
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {nearestHospital && (
                <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg z-[1000] border border-emerald-100 flex items-center justify-between pointer-events-none">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Fastest Route Suggested</p>
                        <p className="font-bold text-slate-800">{nearestHospital.name}</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">
                        {nearestHospital.distance} km
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyMap;
