import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Clock,
  AlertCircle,
  Menu,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Sidebar from '../components/layout/Sidebar'
import AnimatedButton from '../components/animations/AnimatedButton'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../lib/constants'

// Fix default leaflet marker icons (broken with Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const doctorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface Doctor {
  id: string
  name: string
  specialty: string
  address: string
  lat: number
  lng: number
  distance?: number
  phone?: string
  hours?: string
}

interface MapRecenterProps {
  lat: number
  lng: number
}

function MapRecenter({ lat, lng }: MapRecenterProps) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], MAP_DEFAULT_ZOOM, { animate: true })
  }, [lat, lng, map])
  return null
}

// Query Overpass API for nearby doctors/hospitals
async function fetchNearbyDoctors(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<Doctor[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })

  if (!response.ok) throw new Error('Failed to fetch nearby doctors')

  const data = await response.json()

  return data.elements
    .filter((el: any) => el.lat && el.lon)
    .map((el: any) => {
      const tags = el.tags || {}
      const dlat = el.lat - lat
      const dlng = el.lon - lng
      const distKm = Math.sqrt(dlat * dlat + dlng * dlng) * 111

      return {
        id: String(el.id),
        name: tags.name || tags['name:en'] || 'Medical Facility',
        specialty: tags.healthcare || tags.amenity || 'General',
        address: [tags['addr:street'], tags['addr:city']]
          .filter(Boolean)
          .join(', ') || 'Address not available',
        lat: el.lat,
        lng: el.lon,
        distance: Math.round(distKm * 10) / 10,
        phone: tags.phone || tags['contact:phone'] || undefined,
        hours: tags.opening_hours || undefined,
      } as Doctor
    })
    .sort((a: Doctor, b: Doctor) => (a.distance ?? 99) - (b.distance ?? 99))
    .slice(0, 20)
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
}

export default function DoctorFinder() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [doctorError, setDoctorError] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState(5)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLoadingLocation(true)
    setLocationError(null)
    setDoctorError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setLoadingLocation(false)
        loadDoctors(coords[0], coords[1])
      },
      (err) => {
        setLoadingLocation(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location access denied. Please allow location in your browser settings.')
            break
          case err.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Try again.')
            break
          default:
            setLocationError('Could not get your location. Please try again.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [radiusKm])

  const loadDoctors = async (lat: number, lng: number) => {
    setLoadingDoctors(true)
    setDoctorError(null)
    try {
      const results = await fetchNearbyDoctors(lat, lng, radiusKm * 1000)
      setDoctors(results)
      if (results.length === 0) {
        setDoctorError('No medical facilities found nearby. Try increasing the search radius.')
      }
    } catch {
      setDoctorError('Failed to load nearby doctors. Please check your internet connection.')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleRefresh = () => {
    if (userLocation) {
      loadDoctors(userLocation[0], userLocation[1])
    } else {
      getLocation()
    }
  }

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const mapCenter: [number, number] = userLocation ?? MAP_DEFAULT_CENTER

  return (
    <div className="flex h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800 dark:border-gray-800 light:border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white dark:text-white light:text-gray-900">
                Find Doctors
              </h1>
              <p className="text-gray-500 text-xs">Nearby medical facilities on map</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Radius selector */}
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-gray-800 dark:bg-gray-800 light:bg-white border border-gray-700 dark:border-gray-700 light:border-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 5, 10, 20].map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>

            {userLocation && (
              <AnimatedButton variant="secondary" onClick={handleRefresh} className="text-sm">
                <RefreshCw size={14} />
                Refresh
              </AnimatedButton>
            )}

            <AnimatedButton
              variant="primary"
              onClick={getLocation}
              loading={loadingLocation}
              className="text-sm"
            >
              <Navigation size={14} />
              {userLocation ? 'Relocate' : 'Find Me'}
            </AnimatedButton>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left panel — doctor list */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col border-r border-gray-800 dark:border-gray-800 light:border-gray-200 overflow-hidden shrink-0">

            {/* Search */}
            <div className="p-3 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search doctors, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 dark:bg-gray-800 light:bg-gray-50 border border-gray-700 dark:border-gray-700 light:border-gray-200 text-white dark:text-white light:text-gray-900 text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {/* Errors */}
              {locationError && (
                <div className="m-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {locationError}
                </div>
              )}

              {doctorError && !loadingDoctors && (
                <div className="m-3 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {doctorError}
                </div>
              )}

              {loadingLocation || loadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <LoadingSpinner size={28} className="text-blue-500" />
                  <p className="text-gray-500 text-sm">
                    {loadingLocation ? 'Getting your location...' : 'Finding nearby doctors...'}
                  </p>
                </div>
              ) : !userLocation ? (
                <EmptyState
                  icon={MapPin}
                  title="Find nearby doctors"
                  description="Click 'Find Me' to use your location and discover medical facilities near you."
                  action={
                    <AnimatedButton variant="primary" onClick={getLocation}>
                      <Navigation size={16} />
                      Find Me
                    </AnimatedButton>
                  }
                />
              ) : filteredDoctors.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No results found"
                  description={searchQuery ? 'Try a different search term.' : 'No doctors found in this area.'}
                />
              ) : (
                <div className="p-2 space-y-1.5">
                  <p className="text-gray-600 text-xs px-2 py-1">
                    {filteredDoctors.length} facilities found
                  </p>
                  {filteredDoctors.map((doctor, i) => (
                    <motion.div
                      key={doctor.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setSelectedDoctor(
                        selectedDoctor?.id === doctor.id ? null : doctor
                      )}
                      className={`p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                        selectedDoctor?.id === doctor.id
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-gray-900 dark:bg-gray-900 light:bg-white border-gray-800 dark:border-gray-800 light:border-gray-100 hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white dark:text-white light:text-gray-900 font-medium text-sm truncate">
                            {doctor.name}
                          </p>
                          <p className="text-blue-400 text-xs capitalize mt-0.5">
                            {doctor.specialty}
                          </p>
                        </div>
                        {doctor.distance !== undefined && (
                          <span className="text-xs text-gray-500 shrink-0 mt-0.5">
                            {doctor.distance} km
                          </span>
                        )}
                      </div>

                      <p className="text-gray-500 text-xs mt-1.5 truncate flex items-center gap-1">
                        <MapPin size={10} className="shrink-0" />
                        {doctor.address}
                      </p>

                      {selectedDoctor?.id === doctor.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 pt-2 border-t border-blue-500/20 space-y-1"
                        >
                          {doctor.phone && (
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                              <Phone size={11} className="text-blue-400" />
                              {doctor.phone}
                            </p>
                          )}
                          {doctor.hours && (
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                              <Clock size={11} className="text-blue-400" />
                              {doctor.hours}
                            </p>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                          >
                            <Navigation size={11} />
                            Get Directions
                          </a>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="hidden lg:flex flex-1 relative">
            {!userLocation && !loadingLocation && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A0F1E]/70 backdrop-blur-sm">
                <div className="text-center">
                  <MapPin size={40} className="text-blue-400 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">Map ready</p>
                  <p className="text-gray-400 text-sm mb-4">Click "Find Me" to load your location</p>
                  <AnimatedButton variant="primary" onClick={getLocation}>
                    <Navigation size={16} />
                    Find Me
                  </AnimatedButton>
                </div>
              </div>
            )}

            {loadingDoctors && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-gray-900/90 border border-gray-700 rounded-full text-sm text-gray-300 shadow-xl">
                <Loader2 size={14} className="animate-spin text-blue-400" />
                Finding nearby doctors...
              </div>
            )}

            <MapContainer
              center={mapCenter}
              zoom={MAP_DEFAULT_ZOOM}
              className="w-full h-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && (
                <>
                  <MapRecenter lat={userLocation[0]} lng={userLocation[1]} />
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                      <div className="text-sm font-semibold">📍 Your Location</div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={userLocation}
                    radius={radiusKm * 1000}
                    pathOptions={{
                      color: '#3B82F6',
                      fillColor: '#3B82F6',
                      fillOpacity: 0.05,
                      weight: 1.5,
                    }}
                  />
                </>
              )}

              {filteredDoctors.map((doctor) => (
                <Marker
                  key={doctor.id}
                  position={[doctor.lat, doctor.lng]}
                  icon={doctorIcon}
                  eventHandlers={{
                    click: () => setSelectedDoctor(
                      selectedDoctor?.id === doctor.id ? null : doctor
                    ),
                  }}
                >
                  <Popup>
                    <div className="min-w-[160px]">
                      <p className="font-semibold text-sm">{doctor.name}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{doctor.specialty}</p>
                      {doctor.distance !== undefined && (
                        <p className="text-xs text-blue-600 mt-1">{doctor.distance} km away</p>
                      )}
                      {doctor.phone && (
                        <p className="text-xs mt-1">📞 {doctor.phone}</p>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 block"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
