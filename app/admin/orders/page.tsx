'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck,
  ArrowRight,
  Download,
  ShoppingCart,
  Calendar
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { subscribeToCollection, updateDocument } from '@/lib/firebase-utils'
import { formatDistanceToNow } from 'date-fns'

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [activeTab, setActiveTab] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = subscribeToCollection('orders', (data) => {
      setOrders(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase()
    const matchesSearch = (order.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (order.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDocument('orders', id, { status: newStatus })
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Order Management</p>
           <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">Daily <span className="text-secondary text-italic italic">Orders</span></h1>
        </div>
        <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-muted-foreground/20 flex items-center gap-2">
           <Download size={20} />
           Export CSV
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
         <Tabs defaultValue="all" onValueChange={setActiveTab} className="bg-muted/50 p-1 rounded-2xl w-full lg:w-auto">
            <TabsList className="bg-transparent h-12 gap-1 p-0">
               {['All', 'Pending', 'Preparing', 'Completed', 'Cancelled'].map(t => (
                 <TabsTrigger 
                   key={t} 
                   value={t.toLowerCase()} 
                   className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none"
                 >
                   {t}
                 </TabsTrigger>
               ))}
            </TabsList>
         </Tabs>

         <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder="Search by ID or customer..." 
              className="pl-12 h-14 rounded-2xl border-muted-foreground/10 focus-visible:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* Orders List */}
      <Card className="border-none shadow-xl overflow-hidden bg-white/70 backdrop-blur-md rounded-[40px]">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                     <th className="px-8 py-5">Order ID</th>
                     <th className="px-8 py-5">Customer</th>
                     <th className="px-8 py-5 text-center">Type</th>
                     <th className="px-8 py-5">Value</th>
                     <th className="px-8 py-5">Status</th>
                     <th className="px-8 py-5">Created</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((o) => (
                      <motion.tr 
                        layout
                        key={o.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group hover:bg-muted/20 transition-all"
                      >
                         <td className="px-8 py-6 font-bold text-primary">{o.id}</td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                               <span className="font-bold">{o.shipping?.fullname || 'Guest'}</span>
                               <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight line-clamp-1">
                                 {Array.isArray(o.items) ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : o.items}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1 opacity-60">
                               {o.shipping?.method === 'Delivery' ? <Truck size={16} /> : <ShoppingCart size={16} />}
                               <span className="text-[8px] font-bold uppercase tracking-widest">{o.shipping?.method || 'Pickup'}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="font-bold text-lg">${typeof o.total === 'number' ? o.total.toFixed(2) : o.total}</span>
                         </td>
                         <td className="px-8 py-6">
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
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                               <Clock size={14} />
                               <span className="text-sm">
                                 {o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : 'Just now'}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                               <Button variant="ghost" size="icon" className="rounded-xl w-10 h-10 hover:bg-primary/10 hover:text-primary transition-all">
                                  <Eye size={18} />
                               </Button>
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon" className="rounded-xl w-10 h-10">
                                     <MoreVertical size={18} />
                                   </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl">
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 text-yellow-600" onClick={() => updateStatus(o.id, 'Pending')}>
                                       <Clock size={16} /> Set Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 text-blue-600" onClick={() => updateStatus(o.id, 'Preparing')}>
                                       <CheckCircle2 size={16} /> Start Preparing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 text-green-600" onClick={() => updateStatus(o.id, 'Completed')}>
                                       <CheckCircle2 size={16} /> Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 text-red-600" onClick={() => updateStatus(o.id, 'Cancelled')}>
                                       <XCircle size={16} /> Cancel Order
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                            </div>
                         </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </Card>

      {/* Summary Footer Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-green-50/50 p-6 rounded-[32px] flex items-center justify-between border border-green-100">
             <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-green-700 opacity-60">Completed Orders</span>
                <span className="text-4xl font-bold font-playfair text-green-800">
                  {orders.filter(o => o.status === 'Completed').length}
                </span>
             </div>
             <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={32} />
             </div>
          </Card>
          <Card className="border-none shadow-md bg-blue-50/50 p-6 rounded-[32px] flex items-center justify-between border border-blue-100">
             <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 opacity-60">Preparing</span>
                <span className="text-4xl font-bold font-playfair text-blue-800">
                  {orders.filter(o => o.status === 'Preparing').length}
                </span>
             </div>
             <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Truck size={32} />
             </div>
          </Card>
          <Card className="border-none shadow-md bg-secondary/10 p-6 rounded-[32px] flex items-center justify-between border border-secondary/20">
             <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary opacity-60">Pending</span>
                <span className="text-4xl font-bold font-playfair text-primary">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
             </div>
             <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                <ArrowRight size={32} />
             </div>
          </Card>
      </div>
    </div>
  )
}
