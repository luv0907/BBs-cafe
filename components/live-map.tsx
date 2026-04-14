'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// We use generic public CDN icons to avoid needing local assets
const cafeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2884/2884813.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/10473/10473212.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

const bikeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30] // center mounted
})

interface LiveMapProps {
  customerLocation: { lat: number, lng: number }
  status: string
  riderLocation?: { lat: number, lng: number }
}

// BBS Cafe Location (Hardcoded to a location somewhere in a generic city, New York defaults)
const CAFE_LOC = {
  lat: 40.718010,
  lng: -73.992242 // Somewhere in Lower Manhattan
}

export default function LiveMap({ customerLocation, status, riderLocation }: LiveMapProps) {
  const [activeRiderLoc, setActiveRiderLoc] = useState({ lat: CAFE_LOC.lat, lng: CAFE_LOC.lng })

  // Geocoded location or perfectly random spot a bit north if not resolving
  const dest = customerLocation?.lat ? customerLocation : { lat: 40.750610, lng: -73.985242 }

  // Sync rider's actual live GPS location from the Database
  useEffect(() => {
    if (riderLocation?.lat && riderLocation?.lng) {
       setActiveRiderLoc(riderLocation)
    }
  }, [riderLocation])

  // Center map bounding box
  const bounds = L.latLngBounds([CAFE_LOC, dest])

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl relative z-0 border-[8px] border-card">
      <MapContainer 
        bounds={bounds.pad(0.3)}
        zoomControl={false}
        className="w-full h-full !z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* The Animated Delivery Route */}
        <Polyline 
          positions={[CAFE_LOC, dest]} 
          pathOptions={{ color: '#eab308', weight: 4, dashArray: '12, 12', opacity: 0.8 }} 
        />

        {/* Marker for Cafe */}
        <Marker position={CAFE_LOC} icon={cafeIcon}>
          <Popup className="font-playfair font-bold text-lg p-0 m-0"><div className="p-2">BBS Cafe Base</div></Popup>
        </Marker>

        {/* Marker for Customer */}
        <Marker position={dest} icon={homeIcon}>
          <Popup className="font-bold"><div className="p-2 text-primary">Your Location</div></Popup>
        </Marker>

        {/* Moving Motorcycle Rider (Real-Time GPS) */}
        {status === 'Out for Delivery' && (
           <Marker position={activeRiderLoc} icon={bikeIcon} />
        )}
      </MapContainer>
      
      {/* Pulse effect wrapper overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      {status === 'Out for Delivery' && (
        <div className="absolute top-6 left-6 z-20 bg-background/80 backdrop-blur-md px-6 py-3 rounded-full border border-primary/20 shadow-xl flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="font-bold uppercase tracking-widest text-xs">Live Tracking</span>
        </div>
      )}
    </div>
  )
}
