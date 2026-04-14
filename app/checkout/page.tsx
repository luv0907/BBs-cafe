'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, CreditCard, Truck, User, MapPin, Phone, ArrowRight, ShoppingCart, Loader2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const [step, setStep] = React.useState(1)
  const [isOrdered, setIsOrdered] = React.useState(false)
  const [orderId, setOrderId] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [preciseGPS, setPreciseGPS] = React.useState<{lat: number, lng: number} | null>(null)
  const [gpsLoading, setGpsLoading] = React.useState(false)

  const [shippingDetails, setShippingDetails] = React.useState({
    fullname: '', phone: '', address: '', city: '', postal: ''
  })
  
  // Frictionless Checkout: The Swiggy Factor
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('bbs_saved_shipping')
      if (saved) {
        setShippingDetails(JSON.parse(saved))
      }
    } catch (e) {
      console.warn("Could not load cached address")
    }
  }, [])

  React.useEffect(() => {
    // Only save if they actually started typing a real address to avoid caching blanks
    if (shippingDetails.fullname.length > 2) {
      localStorage.setItem('bbs_saved_shipping', JSON.stringify(shippingDetails))
    }
  }, [shippingDetails])
  const [paymentDetails, setPaymentDetails] = React.useState({
    cardname: '', cardnumber: '', expiry: '', cvv: ''
  })

  const tax = cartTotal * 0.08
  const total = cartTotal + tax

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)

    // Geocode to map coordinates for tracing
    let customerLocation = { lat: 40.718010, lng: -73.992242 } // Default to Cafe Base
    
    if (preciseGPS) {
       // Super accurate device-level coordinates!
       customerLocation = preciseGPS
    } else {
       // Fallback geocoding
       try {
         const addressQuery = `${shippingDetails.address || ''}, ${shippingDetails.city || ''}, ${shippingDetails.postal || ''}`.trim()
         if (addressQuery.length > 5) {
           const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&limit=1`)
           const geoData = await geoRes.json()
           if (geoData && geoData.length > 0) {
             customerLocation = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) }
           }
         }
       } catch (err) {
         console.warn("Geocoding failed, using generic location", err)
       }
    }

    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        items: cart,
        total: total,
        shipping: shippingDetails,
        customerLocation: customerLocation,
        payment: { method: 'Credit Card', cardName: paymentDetails.cardname },
        status: 'Pending',
        createdAt: new Date().toISOString()
      })
      setOrderId(docRef.id)
      setIsOrdered(true)
      clearCart()
    } catch (e) {
      console.error("Order failed", e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isOrdered) {
    return (
      <div className="pt-40 pb-24 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8 max-w-2xl mx-auto"
        >
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
            <CheckCircle2 size={64} strokeWidth={3} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-bold font-playfair">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for choosing BBS Café. Your delicious brew is being prepared 
              and will be headed your way shortly.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-muted/30 border border-border w-full flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-bold font-mono tracking-widest">{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-bold">15 - 20 Minutes</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button size="lg" className="rounded-full flex-grow h-14 text-lg font-bold" asChild>
              <Link href="/menu">Back to Menu</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full flex-grow h-14 text-lg font-bold border-primary text-primary hover:bg-primary/5" asChild>
              <Link href={`/orders?id=${orderId}`}>Track Order</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-40 pb-24 container mx-auto px-4">
      <div className="flex flex-col gap-12">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair">Secure <span className="text-secondary">Checkout</span></h1>
          <p className="text-muted-foreground mt-2">Complete your purchase to enjoy our premium coffee.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between px-8 py-6 rounded-3xl bg-secondary/10 border border-secondary/20 shadow-sm overflow-hidden relative">
              {[
                { n: 1, label: 'Shipping', icon: Truck },
                { n: 2, label: 'Payment', icon: CreditCard },
                { n: 3, label: 'Review', icon: ShoppingCart },
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className={`flex flex-col items-center gap-2 relative z-10 ${step >= s.n ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${step === s.n ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : step > s.n ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <s.icon size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{s.label}</span>
                  </div>
                  {i < 2 && <div className={`flex-grow h-0.5 mx-4 rounded-full ${step > s.n ? 'bg-secondary' : 'bg-muted'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-8 flex flex-col gap-8">
                    <div className="flex items-center gap-4 text-primary">
                      <div className="p-3 bg-primary/10 rounded-2xl"><User size={24} /></div>
                      <h2 className="text-2xl font-bold font-playfair">Delivery Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input id="fullname" placeholder="John Doe" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setShippingDetails({...shippingDetails, fullname: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+1 (555) 123-4567" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-end mb-1">
                          <Label htmlFor="address">Full Address</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            disabled={gpsLoading}
                            onClick={() => {
                               setGpsLoading(true)
                               navigator.geolocation.getCurrentPosition((pos) => {
                                  setPreciseGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                                  setGpsLoading(false)
                               }, () => setGpsLoading(false))
                            }}
                            className={`h-8 rounded-full text-xs font-bold transition-all ${preciseGPS ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'text-primary border-primary/20 hover:bg-primary/10'}`}
                          >
                             {gpsLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : (preciseGPS ? <CheckCircle2 size={12} className="mr-1" /> : <Navigation size={12} className="mr-1" />)}
                             {preciseGPS ? 'GPS Locked' : 'Locate Me'}
                          </Button>
                        </div>
                        <Input id="address" placeholder="123 Coffee St, Bean City, 90210" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Coffee City" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="postal">Postal Code</Label>
                        <Input id="postal" placeholder="90210" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setShippingDetails({...shippingDetails, postal: e.target.value})} />
                      </div>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto ml-auto rounded-full px-10 h-14 text-lg font-bold hover:translate-x-1 transition-all" 
                      onClick={() => setStep(2)}
                    >
                      Continue to Payment <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-8 flex flex-col gap-8">
                    <div className="flex items-center gap-4 text-primary">
                      <div className="p-3 bg-primary/10 rounded-2xl"><CreditCard size={24} /></div>
                      <h2 className="text-2xl font-bold font-playfair">Payment Method</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="outline" className="h-20 rounded-2xl justify-start px-8 border-2 border-primary bg-primary/5 relative">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4 text-primary">
                          <CreditCard size={24} />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold">Credit / Debit Card</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">VISA, MASTERCARD, AMEX</span>
                        </div>
                        <div className="absolute top-2 right-2 p-1 bg-primary rounded-full text-primary-foreground">
                          <CheckCircle2 size={16} />
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20 rounded-2xl justify-start px-8 border-2 border-muted hover:border-primary/30 transition-all opacity-60">
                         <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mr-4">
                          <Image src="/icon.svg" alt="PayPal" width={24} height={24} />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold">PayPal</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Fast and Secure</span>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-6 mt-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="cardname">Name on Card</Label>
                        <Input id="cardname" placeholder="John Doe" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setPaymentDetails({...paymentDetails, cardname: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="cardnumber">Card Number</Label>
                        <Input id="cardnumber" placeholder=".... .... .... ...." className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setPaymentDetails({...paymentDetails, cardnumber: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM / YY" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="***" className="h-12 rounded-xl focus-visible:ring-secondary" onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Button variant="ghost" className="rounded-full px-6 font-bold" onClick={() => setStep(1)}>Go Back</Button>
                      <Button 
                        size="lg" 
                        className="rounded-full px-10 h-14 text-lg font-bold hover:translate-x-1 transition-all" 
                        onClick={() => setStep(3)}
                      >
                        Review Order <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-8 flex flex-col gap-8">
                    <div className="flex items-center gap-4 text-primary">
                      <div className="p-3 bg-primary/10 rounded-2xl"><ShoppingCart size={24} /></div>
                      <h2 className="text-2xl font-bold font-playfair">Order Review</h2>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-xs text-muted-foreground uppercase tracking-tighter">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-secondary">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2 opacity-70">
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Truck size={14} /> Shipping to</span>
                        <p className="text-sm font-medium">{shippingDetails.address || '123 Coffee St'}, {shippingDetails.city || 'Bean City'}, {shippingDetails.postal || '90210'}</p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-70">
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Paying with</span>
                        <p className="text-sm font-medium">Card ending in .... {paymentDetails.cardnumber ? paymentDetails.cardnumber.slice(-4) : '4242'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Button variant="ghost" className="rounded-full px-6 font-bold" onClick={() => setStep(2)}>Go Back</Button>
                      <Button 
                        size="lg" 
                        disabled={isSubmitting}
                        className="rounded-full px-12 h-14 text-lg font-bold bg-secondary text-secondary-foreground hover:scale-105 transition-all shadow-xl" 
                        onClick={handlePlaceOrder}
                      >
                        {isSubmitting ? <><Loader2 size={24} className="animate-spin mr-2" /> Placing Order...</> : "Place Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar Area (Empty or Promo) */}
          <div className="hidden lg:flex flex-col gap-8">
             <Card className="border-none shadow-2xl bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <CardContent className="p-8 flex flex-col gap-6 relative z-10">
                <h2 className="text-xl font-bold font-playfair">Summary</h2>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-primary-foreground/60">
                    <span>Items Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary-foreground/60">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="bg-primary-foreground/20" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-secondary text-xl">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="p-8 rounded-3xl bg-secondary/5 border border-secondary/20 flex flex-col gap-4 text-center">
               <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mx-auto">
                 <Truck size={24} />
               </div>
               <h4 className="font-bold font-playfair">Fast Delivery</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 Our riders are ready to bring your coffee fresh and hot within 20 minutes!
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
