'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Star, ShoppingCart, Coffee, Cookie, IceCream, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import { subscribeToCollection } from '@/lib/firebase-utils'

const categories = [
  { id: 'all', name: 'All Items', icon: Utensils },
  { id: 'coffee', name: 'Coffee', icon: Coffee },
  { id: 'snacks', name: 'Snacks', icon: Cookie },
  { id: 'desserts', name: 'Desserts', icon: IceCream },
  { id: 'combos', name: 'Combos', icon: Utensils },
]

import { Loader2 } from 'lucide-react'

export default function MenuPage() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const { addToCart } = useCart()

  // Real-time synchronization in the background
  React.useEffect(() => {
    const unsubscribe = subscribeToCollection('menu', (data) => {
      setItems(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleAddToCart = (item: any) => {
    addToCart(item)
    toast.success(`${item.name} added to cart!`, {
      description: "You can view your cart by clicking the icon above.",
    })
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="pt-32 pb-24 container mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col gap-8 mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold font-playfair"
        >
          Our <span className="text-secondary">Signature</span> Menu
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto text-muted-foreground"
        >
          Explore our diverse selection of artisanal coffees, mouth-watering snacks, and decadent desserts.
        </motion.p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
        <Tabs 
          defaultValue="all" 
          onValueChange={setActiveCategory} 
          className="w-full lg:w-auto overflow-x-auto"
        >
          <TabsList className="bg-muted p-1 rounded-full h-auto">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2 transition-all"
              >
                <cat.icon size={16} />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <Input 
            type="text" 
            placeholder="Search our menu..." 
            className="pl-12 rounded-full h-12 border-muted-foreground/20 focus-visible:ring-secondary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-medium animate-pulse">Loading our delicious menu...</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="h-full border-none shadow-md hover:shadow-2xl transition-all duration-300 group bg-card/40 backdrop-blur-sm relative overflow-hidden">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-secondary text-secondary-foreground border-none font-bold uppercase tracking-wider px-3 py-1 shadow-md">
                      {item.category}
                    </Badge>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddToCart(item)}
                    className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <ShoppingCart size={20} />
                  </motion.button>
                </div>
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold font-playfair">{item.name}</h3>
                    <div className="flex items-center gap-1 text-secondary font-bold">
                      <Star size={16} fill="currentColor" />
                      {item.rating}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted">
                    <span className="text-2xl font-bold text-primary">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                    <Button variant="ghost" size="sm" className="font-semibold text-secondary hover:text-secondary hover:bg-secondary/10">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}

      {filteredItems.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="py-24 text-center"
        >
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <Search size={32} />
          </div>
          <h3 className="text-2xl font-bold font-playfair mb-2">No items found</h3>
          <p className="text-muted-foreground">Try adjusting your category or search terms.</p>
          <Button 
            variant="outline" 
            className="mt-6 rounded-full border-primary text-primary"
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
          >
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  )
}
