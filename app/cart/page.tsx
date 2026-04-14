'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()

  const tax = cartTotal * 0.08
  const total = cartTotal + tax

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-24 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-4xl font-bold font-playfair">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            It looks like you haven't added anything to your cart yet. 
            Explore our menu and find something delicious!
          </p>
          <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold" asChild>
            <Link href="/menu">Go to Menu</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-40 pb-24 container mx-auto px-4">
      <div className="flex flex-col gap-12">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair">Shopping <span className="text-secondary">Cart</span></h1>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/menu" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Back to Menu
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-none shadow-md bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0 shadow-inner">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow flex flex-col gap-2 text-center sm:text-left">
                        <h3 className="text-xl font-bold font-playfair">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Premium selection</p>
                        <span className="text-lg font-bold text-secondary">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-end gap-6">
                        <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full w-8 h-8 hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full w-8 h-8 hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-8">
            <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <CardContent className="p-8 flex flex-col gap-8 relative z-10">
                <h2 className="text-2xl font-bold font-playfair">Order Summary</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-primary-foreground/70">
                    <span>Subtotal</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary-foreground/70">
                    <span>Tax (8%)</span>
                    <span className="font-bold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary-foreground/70">
                    <span>Shipping</span>
                    <span className="text-secondary font-bold font-mono tracking-tighter">FREE</span>
                  </div>
                </div>
                <Separator className="bg-primary-foreground/20" />
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-secondary text-2xl">${total.toFixed(2)}</span>
                </div>
                <Button size="lg" variant="secondary" className="w-full h-14 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-dashed border-muted-foreground/30 text-center">
              <p className="text-sm text-muted-foreground">
                Apply a promo code to get discounts on your favorite brews!
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  className="bg-transparent border-b border-muted-foreground/30 focus:border-secondary outline-none py-2 px-1 flex-grow text-sm uppercase tracking-wider" 
                />
                <Button variant="ghost" className="text-secondary font-bold">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
