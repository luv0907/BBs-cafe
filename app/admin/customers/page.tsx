'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { Users, Mail, Phone, MapPin, Search, Star, Loader2, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        // Group orders by unique phone number or fullname to simulate a 'Customers' database
        const customerMap = new Map()

        snapshot.docs.forEach(doc => {
          const data = doc.data()
          if (!data.shipping) return
          
          const key = data.shipping.phone || data.shipping.fullname
          if (!key) return

          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: key,
              name: data.shipping.fullname || 'Unknown Customer',
              phone: data.shipping.phone || 'N/A',
              address: `${data.shipping.address}, ${data.shipping.city} ${data.shipping.postal}`,
              totalOrders: 1,
              totalSpent: data.total || 0,
              lastOrder: data.createdAt
            })
          } else {
            const existing = customerMap.get(key)
            existing.totalOrders += 1
            existing.totalSpent += (data.total || 0)
            customerMap.set(key, existing)
          }
        })

        setCustomers(Array.from(customerMap.values()))
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary mb-2">
             <div className="p-3 bg-primary/10 rounded-xl"><Users size={24} /></div>
             <h1 className="text-3xl font-black font-playfair">Customer Directory</h1>
          </div>
          <p className="text-muted-foreground font-medium">Manage and understand your most loyal coffee regulars.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search name or phone..." 
            className="pl-10 h-12 bg-muted/50 border-none rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
             <Card className="border-border shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
               <CardContent className="p-0">
                  <div className="p-6 pb-4">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xl uppercase">
                           {customer.name.charAt(0)}
                        </div>
                        {customer.totalOrders > 3 && (
                           <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-none flex items-center gap-1">
                              <Star size={12} className="fill-amber-600" /> VIP
                           </Badge>
                        )}
                     </div>
                     <h3 className="text-xl font-bold font-playfair mb-1">{customer.name}</h3>
                     <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                        <Phone size={14} /> {customer.phone}
                     </p>
                     
                     <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl mb-6">
                        <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2">
                           {customer.address}
                        </span>
                     </div>

                     <div className="flex justify-between items-center text-sm border-t border-border pt-4 mt-auto">
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-70 mb-1">Lifetime Value</span>
                           <span className="font-black text-primary text-lg">${customer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-70 mb-1">Total Orders</span>
                           <span className="font-bold flex items-center gap-1 text-lg">
                              {customer.totalOrders} <ArrowUpRight size={14} className="text-muted-foreground" />
                           </span>
                        </div>
                     </div>
                  </div>
               </CardContent>
             </Card>
          </motion.div>
        ))}

        {filteredCustomers.length === 0 && (
           <div className="col-span-full py-20 text-center bg-card rounded-[2rem] border-2 border-dashed border-border">
              <Users size={32} className="mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-xl font-bold font-playfair">No customers found.</p>
              <p className="text-muted-foreground">Wait for incoming orders to populate this list!</p>
           </div>
        )}
      </div>
    </div>
  )
}
