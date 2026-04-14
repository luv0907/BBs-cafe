'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Coffee, ArrowRight, Star, Users, Award, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import { subscribeToCollection } from '@/lib/firebase-utils'

const initialFeaturedMenu = [
  {
    id: 1,
    name: 'Signature Espresso',
    description: 'Our house blend, roasted to perfection with notes of dark chocolate and caramel.',
    price: 4.50,
    image: '/placeholder.jpg',
    rating: 4.9,
    category: 'coffee'
  },
  {
    id: 2,
    name: 'Caramel Macchiato',
    description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel.',
    price: 5.25,
    image: '/placeholder.jpg',
    rating: 4.8,
    category: 'coffee'
  },
  {
    id: 3,
    name: 'Avocado Toast',
    description: 'Sourdough bread topped with mashed avocado, cherry tomatoes, and chili flakes.',
    price: 12.00,
    image: '/placeholder.jpg',
    rating: 4.7,
    category: 'snacks'
  },
  {
    id: 4,
    name: 'Blueberry Muffin',
    description: 'Freshly baked daily with organic blueberries and a hint of lemon zest.',
    price: 3.75,
    image: '/placeholder.jpg',
    rating: 4.6,
    category: 'desserts'
  },
]

const stats = [
  { label: 'Happy Customers', value: '50k+', icon: Users },
  { label: 'Best Coffee Awards', value: '12', icon: Award },
  { label: 'Coffee Varieties', value: '25+', icon: Coffee },
  { label: 'Years of Brewing', value: '15', icon: Utensils },
]

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Coffee Enthusiast',
    content: 'The best coffee I\'ve ever had! The ambiance is so cozy and the staff is incredibly friendly.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Food Blogger',
    content: 'BBS Café is my go-to spot for breakfast. Their avocado toast is to die for!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Digital Nomad',
    content: 'Perfect place to work from. Great Wi-Fi, even better coffee, and a very inspiring atmosphere.',
    rating: 4,
  },
]

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = React.useState<any[]>(initialFeaturedMenu)
  const { addToCart } = useCart()

  React.useEffect(() => {
    const unsubscribe = subscribeToCollection('menu', (data) => {
      if (data.length > 0) {
        // Only override if there is actual data in Firestore
        const featured = data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8)
        setFeaturedItems(featured)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleAddToCart = (item: any) => {
    addToCart(item)
    toast.success(`${item.name} added to cart!`, {
      description: "You can view your cart by clicking the icon above.",
    })
  }

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background z-10" />
          <Image
            src="/placeholder.jpg"
            alt="Cafe Background"
            fill
            className="object-cover opacity-30 scale-105 animate-pulse-slow"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary border border-secondary/20 text-sm font-semibold tracking-wide uppercase">
              <Coffee size={16} />
              <span>Welcome to BBS Café</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-playfair leading-tight">
              Brewed to <span className="text-secondary">Perfection</span> ☕
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              Experience the finest artisanal coffee and gourmet snacks in the heart of the city. 
              Our beans are ethically sourced and roasted with passion.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full hover:scale-105 transition-transform" asChild>
                <Link href="/menu">Order Now <ArrowRight size={20} className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-full border-primary text-primary hover:bg-primary/5 hover:scale-105 transition-transform" asChild>
                <Link href="/booking">Book a Table</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Coffee Beans (Decorative) */}
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[15%] hidden lg:block opacity-40"
        >
          <Coffee size={64} className="text-secondary rotate-12" />
        </motion.div>
      </section>

      {/* Featured Menu Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair">Featured <span className="text-secondary">Menu</span> Items</h2>
          <p className="max-w-xl text-muted-foreground">
            Our chef's highly recommended selections, crafted with the freshest ingredients daily.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featuredItems.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm group">
                    <CardContent className="p-0">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                          <Star size={14} fill="currentColor" />
                          {item.rating}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold font-playfair">{item.name}</h3>
                          <span className="text-lg font-bold text-secondary">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <Button 
                          className="w-full mt-2 font-semibold"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-12">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner">
                <stat.icon size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold font-playfair">{stat.value}</span>
                <span className="text-sm text-primary-foreground/60 font-medium tracking-wide uppercase">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair">What Our <span className="text-secondary">Guests</span> Say</h2>
          <p className="max-w-xl text-muted-foreground">
            Don't just take our word for it. Here's what our beloved customers have to experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-xl bg-card/30 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="flex gap-1 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-lg italic leading-relaxed text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                      <Image
                        src="/placeholder-user.jpg"
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-primary p-12 md:p-24 text-primary-foreground text-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/placeholder.jpg"
              alt="Background"
              fill
              className="object-cover opacity-10"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-playfair max-w-3xl leading-tight">
              Ready to Experience the Best Coffee in Town?
            </h2>
            <p className="max-w-xl text-primary-foreground/70 text-lg">
              Visit us today or order online for a perfect brew delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold rounded-full hover:scale-105 transition-all shadow-xl" asChild>
                <Link href="/menu">Browse Menu</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:scale-105 transition-all" asChild>
                <Link href="/booking">Reserve Table</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
