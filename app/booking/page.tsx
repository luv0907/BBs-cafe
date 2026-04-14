'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Users, Coffee, CheckCircle2, ArrowRight, Star, Info, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM'
]

export default function BookingPage() {
  const [date, setDate] = React.useState<Date>()
  const [isBooked, setIsBooked] = React.useState(false)
  const [bookingDetails, setBookingDetails] = React.useState({
    guests: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    request: ''
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return;
    
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'bookings'), {
        ...bookingDetails,
        date: date.toISOString(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      })
      setIsBooked(true)
    } catch (error) {
      console.error("Error saving booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isBooked) {
    return (
      <div className="pt-40 pb-24 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto flex flex-col items-center gap-8"
        >
          <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center text-secondary shadow-lg">
            <CheckCircle2 size={64} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-bold font-playfair uppercase tracking-tighter">Booking <span className="text-secondary">Confirmed</span>!</h1>
            <p className="text-muted-foreground text-lg">
              We've reserved a perfect spot for you at BBS Café. 
              A confirmation email has been sent to {bookingDetails.email}.
            </p>
          </div>
          
          <Card className="w-full border-none shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden">
             <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center px-8">
               <span className="text-xs font-bold uppercase tracking-widest opacity-70">Reservation Details</span>
               <span className="font-bold font-playfair">#RES-2024-BBS</span>
             </div>
             <CardContent className="p-8 grid grid-cols-2 gap-8 text-left">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Date</span>
                 <span className="font-bold flex items-center gap-2"><CalendarIcon size={16} /> {date ? format(date, 'PPP') : 'N/A'}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Time</span>
                 <span className="font-bold flex items-center gap-2"><Clock size={16} /> {bookingDetails.time}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Guests</span>
                 <span className="font-bold flex items-center gap-2"><Users size={16} /> {bookingDetails.guests} People</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Name</span>
                 <span className="font-bold uppercase tracking-tighter">{bookingDetails.name}</span>
               </div>
             </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button size="lg" className="rounded-full flex-grow h-14 text-lg font-bold" asChild>
              <a href="/">Done</a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full flex-grow h-14 text-lg font-bold border-primary text-primary" onClick={() => setIsBooked(false)}>
              Make Another Booking
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-40 pb-24 container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Reservation Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">Reserve Your Spot</Badge>
            <h1 className="text-5xl md:text-6xl font-bold font-playfair tracking-tight">Table <span className="text-secondary">Booking</span></h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Experience the perfect blend of coffee and ambiance. 
              Book your table today for a memorable café experience.
            </p>
          </div>

          <form onSubmit={handleBooking} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Preferred Time</Label>
                <Select onValueChange={(v) => setBookingDetails({...bookingDetails, time: v})}>
                  <SelectTrigger className="h-14 rounded-2xl border-muted-foreground/20 focus:ring-secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 opacity-70" />
                      <SelectValue placeholder="Session Time" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-[300px]">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="rounded-xl my-1">{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Number of Guests</Label>
                <Select onValueChange={(v) => setBookingDetails({...bookingDetails, guests: v})}>
                  <SelectTrigger className="h-14 rounded-2xl border-muted-foreground/20 focus:ring-secondary">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 opacity-70" />
                      <SelectValue placeholder="How many people?" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {['1 Person', '2 People', '3 People', '4 People', '5 People', '6+ People'].map(opt => (
                      <SelectItem key={opt} value={opt} className="rounded-xl my-1">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Full Name</Label>
                <Input 
                  placeholder="Your name" 
                  className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary"
                  onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="hello@example.com" 
                  className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary"
                  onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Phone Number</Label>
                <Input 
                  placeholder="+1 (555) 000-0000" 
                  className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary"
                  onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Special Requests (Optional)</Label>
              <Input 
                placeholder="Birthdays, window seat, allergies..." 
                className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary"
                onChange={(e) => setBookingDetails({...bookingDetails, request: e.target.value})}
              />
            </div>

            <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="h-16 rounded-full text-xl font-bold mt-4 shadow-xl hover:scale-[1.02] transition-transform flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Brewing Your Reservation... <Loader2 size={24} className="animate-spin" /></>
              ) : (
                <>Confirm Reservation <Coffee size={24} /></>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Info Sidebar */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex flex-col gap-8 lg:mt-32"
        >
          <Card className="border-none shadow-2xl bg-secondary text-secondary-foreground overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <CardContent className="p-10 flex flex-col gap-6 relative z-10">
              <h2 className="text-3xl font-bold font-playfair tracking-tight">The BBS <span className="italic">Experience</span></h2>
              <p className="text-secondary-foreground/80 leading-relaxed font-medium">
                When you book a table with us, you're not just getting a seat. 
                You're getting our commitment to the finest coffee journey in the city.
              </p>
              <div className="flex flex-col gap-6 mt-4">
                {[
                  { icon: Coffee, title: "Premium Tasting", desc: "Access to our rare single-origin menu." },
                  { icon: Star, title: "VIP Service", desc: "Dedicated server for your entire session." },
                  { icon: Info, title: "Quiet Zones", desc: "Perfect spots for meetings or reading." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl h-fit">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm opacity-60 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-muted/40 border border-muted-foreground/10 flex flex-col gap-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary p-1">
                 <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">JD</div>
               </div>
               <div>
                  <div className="flex items-center gap-1 text-secondary mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">James Dalton, Regular</p>
               </div>
             </div>
             <p className="italic font-medium text-muted-foreground leading-relaxed">
               "The booking process is so smooth. I always reserve my window seat for morning reads. The atmosphere at BBS Café is unmatched!"
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
