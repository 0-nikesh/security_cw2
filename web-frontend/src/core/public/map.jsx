import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';

const containerStyle = {
    width: '400px',
    height: '400px'
};

const center = {
    lat: -3.745,
    lng: -38.523
};

function MyMapComponent() {
    const [location, setLocation] = useState(center);

    const onMarkerDragEnd = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        // Here you can implement the geocoding to fetch the address
        setLocation({ lat, lng });
    };

    return (
        <LoadScript
            googleMapsApiKey="YOUR_API_KEY">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={10}
            >
                <Marker
                    position={location}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                />
            </GoogleMap>
        </LoadScript>
    );
}

export default MyMapComponent;
