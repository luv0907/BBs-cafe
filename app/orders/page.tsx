'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  Clock, 
  Package, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Loader2, 
  Receipt,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import dynamic from 'next/dynamic'

// Dynamically import the map component so it doesn't crash Next.js SSR
const DynamicLiveMap = dynamic(() => import('@/components/live-map'), { ssr: false })

const STATUS_STEPS = [
  { id: 'Pending', label: 'Order Received', icon: Receipt },
  { id: 'Preparing', label: 'Preparing', icon: ChefHat },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Bike },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
]

function OrderTrackerContent() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get('id') || ''
  
  const [searchId, setSearchId] = React.useState(initialOrderId)
  const [activeId, setActiveId] = React.useState(initialOrderId)
  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!activeId.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const docRef = doc(db, 'orders', activeId.trim())
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
         if (docSnap.exists()) {
           setOrder({ id: docSnap.id, ...docSnap.data() })
           setError('')
         } else {
           setOrder(null)
           setError('Order not found. Please check your Secret ID and try again.')
         }
         setLoading(false)
      }, (err) => {
         console.error("Live Tracker Error:", err)
         if (err.message.includes("permission")) {
            setError('Permission Denied. Ensure your Firebase Rules are updated.')
         } else {
            setError('Failed connection. Please check your internet.')
         }
         setLoading(false)
      })

      return () => unsubscribe()
    } catch (e) {
      setError('System Error. Could not connect to radar.')
      setLoading(false)
    }
  }, [activeId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveId(searchId.trim())
  }

  const currentStepIndex = order ? STATUS_STEPS.findIndex(s => s.id === order.status) : -1

  return (
    <div className="pt-40 pb-24 container mx-auto px-4 min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        
        <div className="text-center flex flex-col gap-4">
          <Badge className="mx-auto bg-primary/10 text-primary border-none rounded-full px-4 py-1 font-bold tracking-widest uppercase text-xs">
            Live Radar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">
            Track <span className="text-secondary italic">Your Order</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your secret Order ID to see real-time updates on your delicious coffee and snacks.
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <form onSubmit={handleSearch} className="flex p-2 items-center">
            <div className="flex-grow flex items-center pl-4 gap-3 text-muted-foreground focus-within:text-primary transition-colors">
              <Search size={24} />
              <Input 
                placeholder="Enter your Document ID (e.g. 8xV9aB...)" 
                className="border-none shadow-none focus-visible:ring-0 text-lg h-16 bg-transparent"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading || !searchId.trim()}
              className="h-14 px-8 font-bold rounded-[1.5rem] shadow-lg hover:scale-105 transition-transform"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Track Package'}
            </Button>
          </form>
        </Card>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-3xl flex items-start gap-4"
            >
              <AlertCircle className="shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1">Tracking Failed</h3>
                <p className="opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {order && !loading && !error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex flex-col gap-8"
            >
              {/* Timeline Card */}
              <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <CardHeader className="pb-4 pt-10 px-8 lg:px-12 border-b border-border/40 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Order Timeline</CardTitle>
                      <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-wider">{activeId}</h2>
                    </div>
                    <Badge variant="secondary" className="px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-xl text-secondary-foreground">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-10 pb-12 px-8 lg:px-12 relative z-10">
                  <div className="relative flex justify-between items-center mb-6 max-w-3xl mx-auto hidden sm:flex">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${Math.max(0, currentStepIndex) * (100 / (STATUS_STEPS.length - 1))}%` }}
                    />
                    
                    {STATUS_STEPS.map((step, index) => {
                      const isComplete = index <= currentStepIndex
                      const isActive = index === currentStepIndex
                      return (
                        <div key={step.id} className="relative flex flex-col items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 
                            ${isActive ? 'bg-primary text-primary-foreground scale-125 shadow-xl shadow-primary/30' : 
                              isComplete ? 'bg-primary text-primary-foreground' : 'bg-background border-2 border-muted text-muted-foreground'}
                          `}>
                            <step.icon size={24} className={isActive ? 'animate-pulse' : ''} />
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-widest text-center max-w-[80px] transition-colors
                            ${isActive ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground opacity-50'}
                          `}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Mobile Timeline Stack */}
                  <div className="flex flex-col gap-6 sm:hidden relative border-l-2 border-muted ml-6 pl-8">
                     <div 
                      className="absolute left-[-2px] inset-y-0 w-[2px] bg-primary transition-all duration-700 ease-out" 
                      style={{ height: `${Math.max(0, currentStepIndex) * (100 / (STATUS_STEPS.length - 1))}%` }}
                    />
                    {STATUS_STEPS.map((step, index) => {
                       const isComplete = index <= currentStepIndex
                       const isActive = index === currentStepIndex
                       return (
                         <div key={step.id} className="relative flex items-center gap-4">
                            <div className={`absolute -left-[54px] w-10 h-10 rounded-xl flex items-center justify-center transition-all z-10 
                              ${isActive ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 
                                isComplete ? 'bg-primary text-primary-foreground' : 'bg-background border-2 border-muted text-muted-foreground'}
                            `}>
                               <step.icon size={18} />
                            </div>
                            <span className={`font-bold ${isActive ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                               {step.label}
                            </span>
                         </div>
                       )
                    })}
                  </div>

                </CardContent>
              </Card>

              {/* LIVE MAP TRACKER */}
              <AnimatePresence>
                {order.status === 'Out for Delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full"
                  >
                    <DynamicLiveMap customerLocation={order.customerLocation} status={order.status} riderLocation={order.riderLocation} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold font-playfair mb-6 flex items-center gap-3">
                    <Receipt className="text-primary" /> Receipt Details
                  </h3>
                  <div className="flex flex-col gap-4">
                    {order.items?.map((item: any, i: number) => (
                      <Card key={i} className="border-none shadow-md bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden hover:scale-[1.01] transition-transform">
                        <div className="flex items-center gap-4 p-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
                            <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">Qty: {item.quantity}</p>
                          </div>
                          <div className="pr-4 font-bold text-xl text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold font-playfair mb-0 flex items-center gap-3">
                    <Package className="text-primary" /> Logistics
                  </h3>
                  <Card className="border-none shadow-lg bg-card/80 backdrop-blur-md rounded-3xl p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-70 flex items-center gap-2">
                        <MapPin size={14} /> Delivering To
                      </span>
                      <p className="font-medium text-lg leading-snug">
                        {order.shipping?.fullname}<br/>
                        <span className="text-muted-foreground text-sm">
                          {order.shipping?.address}, {order.shipping?.city} {order.shipping?.postal}
                        </span>
                      </p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-70 flex items-center gap-2">
                        <Clock size={14} /> Ordered At
                      </span>
                      <p className="font-bold flex items-center gap-2">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                        <span className="text-xs text-muted-foreground font-normal">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                        </span>
                      </p>
                    </div>
                    <Separator />
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-sm mb-2 text-muted-foreground font-bold">
                        <span>Subtotal</span>
                        <span>${(order.total / 1.08).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-4 text-muted-foreground font-bold">
                        <span>Taxes & Fees</span>
                        <span>${(order.total - (order.total / 1.08)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-2xl font-bold text-primary">
                        <span>Total</span>
                        <span>${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <OrderTrackerContent />
    </React.Suspense>
  )
}
