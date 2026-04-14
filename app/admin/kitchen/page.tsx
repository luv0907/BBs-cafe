'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  VolumeX, 
  Volume2, 
  BellRing,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Base64 generic bell chime for Kitchen Alarm (helps avoid needing local MP3 file)
const BELL_SOUND = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqw==" // Short stub to avoid massive base-64 string size, we'll try to use a real beep via browser oscillators to be safe!

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(false)
  const [recentCount, setRecentCount] = React.useState(0)
  const audioCtxRef = React.useRef<AudioContext | null>(null)

  // Browser-native Beep System (so we don't need MP3 files)
  const playAlarm = () => {
    if (!isAudioEnabled) return
    try {
      if (!audioCtxRef.current) {
         const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
         audioCtxRef.current = new AudioContextClass()
      }
      
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // High pitch (A5)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1) // Drop to A4
      
      gainNode.gain.setValueAtTime(1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.error("Audio generation failed", e)
    }
  }

  const connectAudio = () => {
    setIsAudioEnabled(true)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass()
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  React.useEffect(() => {
    // Only grab active orders
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['Pending', 'Preparing', 'Ready for Pickup'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Oldest first (FIFO)
      
      // Check if new "Pending" order arrived to play alarm
      const pendingCount = liveOrders.filter(o => o.status === 'Pending').length
      
      setRecentCount((prev) => {
        if (pendingCount > prev && prev !== 0) {
           playAlarm() // DING!
        }
        return pendingCount
      })
      
      setOrders(liveOrders)
    })

    return () => unsubscribe()
  }, [isAudioEnabled])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const calculateWaitTimeInMinutes = (isoString: string) => {
     const ms = new Date().getTime() - new Date(isoString).getTime()
     return Math.floor(ms / 60000)
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending')
  const preparingOrders = orders.filter(o => o.status === 'Preparing')
  const readyOrders = orders.filter(o => o.status === 'Ready for Pickup')

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-black text-white p-6 rounded-3xl shadow-xl flex-shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
               <ChefHat size={28} />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-widest uppercase">KDS / Kitchen Display</h1>
               <p className="text-white/60 font-medium text-sm">Real-time Ticket Synchronization</p>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Pending</span>
                  <span className="text-2xl font-black text-destructive">{pendingOrders.length}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Preparing</span>
                  <span className="text-2xl font-black text-amber-500">{preparingOrders.length}</span>
               </div>
            </div>

            <div className="w-[1px] h-10 bg-white/20" />

            {!isAudioEnabled ? (
               <Button 
                 onClick={connectAudio} 
                 className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-12 gap-2 animate-pulse"
               >
                 <VolumeX size={18} /> Connect Audio Alarm
               </Button>
            ) : (
               <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl h-12 gap-2 pointer-events-none">
                 <Volume2 size={18} className="text-green-400" /> System Active
               </Button>
            )}
         </div>
      </div>

      {/* Lanes */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
         
         {/* Lame 1: Incoming */}
         <div className="flex flex-col bg-muted/40 rounded-3xl border-2 border-border/50 overflow-hidden">
            <div className="bg-destructive/10 border-b-2 border-destructive/20 p-4 shrink-0">
               <h3 className="font-black text-destructive uppercase tracking-widest flex items-center gap-2">
                  <BellRing size={18} /> INCOMING TICKETS
               </h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
               <AnimatePresence>
                  {pendingOrders.map(order => (
                     <TicketCard 
                        key={order.id} 
                        order={order} 
                        actionLabel="Start Preparing"
                        actionIcon={<Flame />}
                        actionColor="bg-amber-500 hover:bg-amber-600"
                        onAction={() => updateStatus(order.id, 'Preparing')}
                        isUrgent={calculateWaitTimeInMinutes(order.createdAt) > 5}
                     />
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Lame 2: Preparing */}
         <div className="flex flex-col bg-amber-500/5 rounded-3xl border-2 border-amber-500/20 overflow-hidden">
            <div className="bg-amber-500/10 border-b-2 border-amber-500/20 p-4 shrink-0">
               <h3 className="font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <Flame size={18} /> ON THE GRILL
               </h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
               <AnimatePresence>
                  {preparingOrders.map(order => (
                     <TicketCard 
                        key={order.id} 
                        order={order} 
                        actionLabel="Ready for Pickup"
                        actionIcon={<CheckCircle2 />}
                        actionColor="bg-green-500 hover:bg-green-600"
                        onAction={() => updateStatus(order.id, 'Ready for Pickup')}
                     />
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Lame 3: Ready */}
         <div className="flex flex-col bg-green-500/5 rounded-3xl border-2 border-green-500/20 overflow-hidden">
            <div className="bg-green-500/10 border-b-2 border-green-500/20 p-4 shrink-0">
               <h3 className="font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={18} /> READY BAGS
               </h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
               <AnimatePresence>
                  {readyOrders.map(order => (
                     <TicketCard 
                        key={order.id} 
                        order={order} 
                        actionLabel="Waiting for Rider"
                        actionIcon={<Clock />}
                        actionColor="bg-muted text-foreground opacity-50 cursor-not-allowed"
                        onAction={() => {}}
                        disabled={true}
                     />
                  ))}
               </AnimatePresence>
            </div>
         </div>

      </div>
    </div>
  )
}

function TicketCard({ order, actionLabel, actionIcon, actionColor, onAction, isUrgent, disabled }: any) {
  const waitTime = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)

  return (
     <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        className={`bg-card border-l-[6px] shadow-sm rounded-2xl flex flex-col overflow-hidden ${isUrgent ? 'border-destructive' : 'border-primary'}`}
     >
        <div className="p-4 flex flex-col gap-3">
           <div className="flex justify-between items-start">
              <div className="flex flex-col">
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Order ID</span>
                 <span className="font-mono font-bold text-lg">{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold bg-muted/50 px-3 py-1 rounded-lg">
                 <Clock size={14} className={isUrgent ? 'text-destructive animate-pulse' : ''} />
                 <span className={isUrgent ? 'text-destructive' : ''}>{waitTime} min</span>
              </div>
           </div>

           <div className="w-full h-[1px] bg-border/50" />

           <ul className="flex flex-col gap-2">
              {order.items.map((item: any, i: number) => (
                 <li key={i} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 bg-primary/10 text-primary font-black rounded-md flex items-center justify-center text-xs">
                          {item.quantity}x
                       </div>
                       <span className="font-bold">{item.name}</span>
                    </div>
                 </li>
              ))}
           </ul>
        </div>
        <button 
           onClick={onAction}
           disabled={disabled}
           className={`w-full py-4 px-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-white transition-opacity ${actionColor}`}
        >
           {actionIcon} {actionLabel}
        </button>
     </motion.div>
  )
}
