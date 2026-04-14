'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

import { subscribeToCollection, updateDocument } from '@/lib/firebase-utils'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = subscribeToCollection('bookings', (data) => {
      setBookings(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredBookings = bookings.filter(b => 
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDocument('bookings', id, { status: newStatus })
    } catch (error) {
      console.error("Failed to update booking status:", error)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Booking Management</p>
           <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">Table <span className="text-secondary text-italic italic">Reservations</span></h1>
        </div>
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-border">
           <Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft size={20} /></Button>
           <span className="font-bold text-sm px-4">{format(new Date(), 'MMMM yyyy')}</span>
           <Button variant="ghost" size="icon" className="rounded-xl"><ChevronRight size={20} /></Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
         <div className="flex gap-4 overflow-x-auto pb-2 w-full lg:w-auto">
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map(s => (
              <Button key={s} variant="outline" className="rounded-full px-6 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/10 hover:bg-primary hover:text-primary-foreground transition-all">
                {s}
              </Button>
            ))}
         </div>

         <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder="Search by ID or name..." 
              className="pl-12 h-14 rounded-2xl border-muted-foreground/10 focus-visible:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
         <AnimatePresence mode="popLayout">
            {filteredBookings.map((b) => (
              <motion.div
                layout
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-[32px] overflow-hidden group hover:shadow-2xl transition-all duration-500">
                   <CardContent className="p-0 flex flex-col md:flex-row">
                      <div className={cn(
                        "w-full md:w-48 p-8 flex flex-col items-center justify-center text-center gap-1 border-b md:border-b-0 md:border-r border-border/30",
                        b.status === 'Confirmed' ? "bg-green-500/5" : b.status === 'Pending' ? "bg-yellow-500/5" : "bg-red-500/5"
                      )}>
                         <span className="text-3xl font-bold font-playfair">{b.date ? format(new Date(b.date), 'dd') : '--'}</span>
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{b.date ? format(new Date(b.date), 'MMMM') : 'Unknown'}</span>
                         <div className="flex items-center gap-1 mt-2 font-bold text-primary">
                            <Clock size={14} />
                            <span className="text-sm">{b.time}</span>
                         </div>
                      </div>

                      <div className="flex-grow p-8 flex flex-col md:flex-row items-center gap-8">
                         <div className="flex-grow flex flex-col gap-4 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                               <h3 className="text-2xl font-bold font-playfair">{b.name}</h3>
                               <Badge className={cn(
                                 "w-fit mx-auto md:mx-0 rounded-full px-3 py-1 font-bold text-[10px] uppercase border-none",
                                 b.status === 'Confirmed' ? "bg-green-100 text-green-700" :
                                 b.status === 'Pending' ? "bg-yellow-100 text-yellow-700" :
                                 "bg-red-100 text-red-700"
                               )}>
                                 {b.status}
                               </Badge>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                               <span className="flex items-center gap-2"><Users size={16} className="text-secondary" /> {b.guests} Guests</span>
                               <span className="flex items-center gap-2"><Phone size={16} className="text-secondary" /> {b.phone}</span>
                               <span className="flex items-center gap-2"><Mail size={16} className="text-secondary" /> {b.email}</span>
                            </div>
                            {b.request && (
                              <div className="p-3 bg-muted/50 rounded-2xl text-xs font-medium italic border border-border/10">
                                "{b.request}"
                              </div>
                            )}
                         </div>

                         <div className="flex flex-row md:flex-col gap-3 shrink-0">
                            <Button variant="ghost" size="icon" className="rounded-2xl w-14 h-14 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm" onClick={() => updateStatus(b.id, 'Confirmed')}>
                               <CheckCircle2 size={24} />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-2xl w-14 h-14 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm" onClick={() => updateStatus(b.id, 'Cancelled')}>
                               <XCircle size={24} />
                            </Button>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="outline" size="icon" className="rounded-2xl w-14 h-14 border-muted-foreground/10">
                                   <MoreVertical size={24} />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] border-none shadow-2xl">
                                  <DropdownMenuItem className="rounded-xl font-bold p-3">Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl font-bold p-3">Edit Details</DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl font-bold p-3 text-destructive">Delete Permanently</DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </div>
  )
}
