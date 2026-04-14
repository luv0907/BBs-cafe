'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Navigation,
  Package,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RiderDispatchApp() {
  const [orders, setOrders] = React.useState<any[]>([])

  React.useEffect(() => {
    // Riders only care about ready orders and active deliveries
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['Ready for Pickup', 'Out for Delivery'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      
      setOrders(liveOrders)
    })

    return () => unsubscribe()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const activeDeliveries = orders.filter(o => o.status === 'Out for Delivery')
  const availablePickups = orders.filter(o => o.status === 'Ready for Pickup')

  // Safely hold active deliveries to prevent infinite render loops when GPS updates trigger Firestore snapshots
  const activeRef = React.useRef(activeDeliveries)
  activeRef.current = activeDeliveries

  // The Master GPS Broadcaster
  React.useEffect(() => {
    if (activeRef.current.length === 0) return
    if (!('geolocation' in navigator)) {
       console.warn('Geolocation not supported on this browser.')
       return
    }

    // This aggressively tracks the phone's physical location and pushes it to the Cloud
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        activeRef.current.forEach((order) => {
           updateDoc(doc(db, 'orders', order.id), {
             riderLocation: { lat: latitude, lng: longitude }
           }).catch(err => console.error("GPS push failed", err))
        })
      },
      (error) => {
        console.error("GPS Stream Error", error)
      },
      {
        enableHighAccuracy: true, // Force GPS chip usage
        maximumAge: 10000, // Allow 10 second caching
        timeout: 10000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [activeDeliveries.length > 0]) // Boolean toggle turns it on/off without leaking

  return (
    <div className="max-w-lg mx-auto bg-muted/10 min-h-[calc(100vh-2rem)] flex flex-col pt-4">
      {/* Rider Header */}
      <div className="px-6 pb-6">
         <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-8 opacity-20"><Bike size={120} /></div>
            <h1 className="text-3xl font-black font-playfair relative z-10">Rider App</h1>
            <p className="opacity-90 font-medium relative z-10">You have {activeDeliveries.length} active delivery.</p>
            {activeDeliveries.length > 0 && (
               <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full z-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-100">GPS Live</span>
               </div>
            )}
         </div>
      </div>

      <div className="flex-grow flex flex-col gap-8 px-6 pb-20">
         
         {/* Active Run */}
         {activeDeliveries.length > 0 && (
            <div className="flex flex-col gap-4">
               <h2 className="font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Navigation size={18} /> Active Run
               </h2>
               <AnimatePresence>
                  {activeDeliveries.map(order => (
                     <DispatchCard 
                        key={order.id}
                        order={order}
                        actionLabel="Swipe to Deliver"
                        actionIcon={<CheckCircle2 />}
                        actionColor="bg-green-500 hover:bg-green-600"
                        onAction={() => updateStatus(order.id, 'Delivered')}
                        isActive={true}
                     />
                  ))}
               </AnimatePresence>
            </div>
         )}

         {/* Available Pickups */}
         <div className="flex flex-col gap-4">
            <h2 className="font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Package size={18} /> Ready at Cafe
            </h2>
            {availablePickups.length === 0 ? (
               <div className="text-center py-10 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                  <p className="text-muted-foreground font-bold">No orders waiting.</p>
               </div>
            ) : (
               <AnimatePresence>
                  {availablePickups.map(order => (
                     <DispatchCard 
                        key={order.id}
                        order={order}
                        actionLabel="Accept Delivery"
                        actionIcon={<ArrowRight />}
                        actionColor="bg-primary hover:bg-primary/90"
                        onAction={() => updateStatus(order.id, 'Out for Delivery')}
                        isActive={false}
                     />
                  ))}
               </AnimatePresence>
            )}
         </div>

      </div>
    </div>
  )
}

function DispatchCard({ order, actionLabel, actionIcon, actionColor, onAction, isActive }: any) {
   const totalItems = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

   return (
      <motion.div
         layout
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9 }}
         className={`bg-card rounded-[2rem] overflow-hidden shadow-lg border-2 ${isActive ? 'border-primary' : 'border-border'}`}
      >
         <div className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-black text-xl mb-1">{order.shipping?.fullname}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                     Order #{order.id.slice(-6).toUpperCase()}
                  </p>
               </div>
               <div className="bg-muted px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Package size={14} /> {totalItems} items
               </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-2xl">
               <MapPin className="text-primary shrink-0 mt-1" />
               <div className="flex flex-col">
                  <span className="font-medium text-lg leading-tight">{order.shipping?.address}</span>
                  <span className="text-muted-foreground">{order.shipping?.city} {order.shipping?.postal}</span>
               </div>
            </div>

            {isActive && (
               <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 border-primary/20 text-primary hover:bg-primary/10">
                     <Phone size={18} className="mr-2" /> Call Customer
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl h-12 border-primary/20 text-primary hover:bg-primary/10">
                     <Navigation size={18} className="mr-2" /> Open Maps
                  </Button>
               </div>
            )}
         </div>

         <button 
            onClick={onAction}
            className={`w-full py-5 px-6 flex items-center justify-between font-black uppercase tracking-widest text-white transition-all ${actionColor}`}
         >
            {actionLabel} {actionIcon}
         </button>
      </motion.div>
   )
}
