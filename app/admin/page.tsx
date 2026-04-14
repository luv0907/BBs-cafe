'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { subscribeToCollection } from '@/lib/firebase-utils'
import { formatDistanceToNow } from 'date-fns'

export default function AdminDashboard() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [bookings, setBookings] = React.useState<any[]>([])
  const [menuItems, setMenuItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Subscribe to recursive updates
    const unsubOrders = subscribeToCollection('orders', setOrders)
    const unsubBookings = subscribeToCollection('bookings', setBookings)
    const unsubMenu = subscribeToCollection('menu', setMenuItems)

    setLoading(false)

    return () => {
      unsubOrders()
      unsubBookings()
      unsubMenu()
    }
  }, [])

  // Dynamic Statistics
  const totalRevenue = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => {
      // Handle price strings like "$13.25"
      const price = typeof o.total === 'string' 
        ? parseFloat(o.total.replace('$', '')) 
        : o.total
      return sum + (price || 0)
    }, 0)

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: '+12.5%', 
      isUp: true, 
      icon: TrendingUp 
    },
    { 
      label: 'Total Orders', 
      value: orders.length.toString(), 
      change: '+5.2%', 
      isUp: true, 
      icon: ShoppingCart 
    },
    { 
      label: 'Table Bookings', 
      value: bookings.length.toString(), 
      change: '-2.4%', 
      isUp: false, 
      icon: Calendar 
    },
    { 
      label: 'Menu Items', 
      value: menuItems.length.toString(), 
      change: '+18.7%', 
      isUp: true, 
      icon: Users 
    },
  ]

  const recentOrders = orders.slice(0, 5)
  const upcomingBookings = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
    .slice(0, 3)
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Dashboard Overview</p>
           <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">Good Morning, <span className="text-secondary">Admin</span></h1>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-muted-foreground/20">Download Report</Button>
           <Button className="rounded-xl h-12 px-6 font-bold shadow-lg">Refresh Data</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <s.icon size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${s.isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {s.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {s.change}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">{s.label}</span>
                  <span className="text-3xl font-bold font-playfair">{s.value}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold font-playfair">Recent <span className="text-secondary">Orders</span></h2>
            <Button variant="ghost" className="text-secondary font-bold" asChild><Link href="/admin/orders">View All</Link></Button>
          </div>
          <Card className="border-none shadow-xl overflow-hidden bg-card/40 backdrop-blur-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Total</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Time</th>
                      <th className="px-8 py-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-8 py-5 font-bold text-primary">{o.id}</td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold">{o.shipping?.fullname || 'Guest'}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : o.items}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-bold">${typeof o.total === 'number' ? o.total.toFixed(2) : o.total}</td>
                        <td className="px-8 py-5">
                          <Badge className={cn(
                            "rounded-full px-3 py-1 font-bold text-[10px] uppercase border-none",
                            o.status === 'Completed' ? "bg-green-100 text-green-700" :
                            o.status === 'Preparing' ? "bg-blue-100 text-blue-700" :
                            o.status === 'Pending' ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-sm text-muted-foreground">
                          {o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : 'Just now'}
                        </td>
                        <td className="px-8 py-5">
                          <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16} /></Button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold font-playfair">Upcoming <span className="text-secondary">Bookings</span></h2>
            <Button variant="ghost" className="text-secondary font-bold" asChild><Link href="/admin/bookings">Manage</Link></Button>
          </div>
          <div className="flex flex-col gap-4">
            {upcomingBookings.map((b, i) => (
              <Card key={i} className="border-none shadow-md bg-card/40 backdrop-blur-sm hover:shadow-lg transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex flex-col items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                      <Clock size={20} className="mb-0.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{b.time}</span>
                   </div>
                   <div className="flex-grow flex flex-col gap-1">
                      <h4 className="font-bold">{b.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Users size={12} /> {b.guests}</span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className={b.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'}>{b.status}</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-green-600 hover:bg-green-100"><CheckCircle2 size={16} /></Button>
                      <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-red-600 hover:bg-red-100"><XCircle size={16} /></Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-none shadow-inner bg-muted/30 p-8 rounded-3xl mt-4 text-center flex flex-col gap-2">
             <h4 className="font-bold text-muted-foreground uppercase text-xs tracking-[0.2em]">Next Opening</h4>
             <p className="font-playfair text-xl font-bold">Tomorrow at 08:00 AM</p>
             <Separator className="my-2 bg-muted-foreground/10" />
             <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold">14</span>
                   <span className="text-[8px] font-bold uppercase opacity-50">Hours</span>
                </div>
                <span className="text-muted-foreground opacity-20">:</span>
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold">42</span>
                   <span className="text-[8px] font-bold uppercase opacity-50">Minutes</span>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
