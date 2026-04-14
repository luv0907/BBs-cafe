'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Twitter, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Message sent!", {
        description: "We'll get back to you within 24 hours. Coffee's on us!",
      })
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-16">
          {/* Header */}
          <div className="flex flex-col gap-6 text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-secondary text-xs">Get In Touch</Badge>
            <h1 className="text-5xl md:text-7xl font-bold font-playfair tracking-tighter">Let's <span className="text-secondary text-italic italic">Connect</span> over Coffee</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Have a question, a suggestion, or just want to say hi? 
              We're always here to listen and brew something special for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <Card className="h-full border-none shadow-2xl bg-card/40 backdrop-blur-sm p-8 md:p-12 rounded-[40px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-0 flex flex-col gap-8 relative z-10">
                  <h2 className="text-3xl font-bold font-playfair">Send us a <span className="text-secondary">Message</span></h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest opacity-60">Full Name</Label>
                        <Input id="name" placeholder="John Doe" className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary text-base lg:text-lg" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</Label>
                        <Input id="email" type="email" placeholder="hello@example.com" className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary text-base lg:text-lg" required />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest opacity-60">Subject</Label>
                      <Input id="subject" placeholder="What's this about?" className="h-14 rounded-2xl border-muted-foreground/20 focus-visible:ring-secondary text-base lg:text-lg" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest opacity-60">Message</Label>
                      <Textarea id="message" placeholder="Write your message here..." className="min-h-[160px] rounded-3xl border-muted-foreground/20 focus-visible:ring-secondary text-base lg:text-lg p-5" required />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="h-16 rounded-full text-lg font-bold shadow-xl hover:scale-[1.02] transition-transform mt-4 flex items-center gap-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Brewing your message..." : "Send Message"}
                      <Send size={20} className={isSubmitting ? "animate-pulse" : ""} />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-8"
            >
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-muted/40 p-6 flex items-center gap-5 rounded-3xl hover:bg-secondary/10 transition-colors group">
                   <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                     <Phone size={24} />
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-primary">Call Us</span>
                     <span className="font-bold text-lg">+1 (555) 000-0000</span>
                   </div>
                </Card>
                <Card className="border-none shadow-md bg-muted/40 p-6 flex items-center gap-5 rounded-3xl hover:bg-secondary/10 transition-colors group">
                   <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                     <Mail size={24} />
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-primary">Email Us</span>
                     <span className="font-bold text-lg">hello@bbscafe.com</span>
                   </div>
                </Card>
              </div>

              {/* Hours & Location */}
              <Card className="border-none shadow-lg bg-primary text-primary-foreground p-8 rounded-[40px] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <MapPin size={24} className="text-secondary" />
                        <h3 className="text-xl font-bold font-playfair uppercase tracking-wide">Visit Us</h3>
                      </div>
                      <p className="text-primary-foreground/70 text-lg leading-relaxed">
                        123 Coffee Street, <br />
                        Bean Avenue, <br />
                        New York, NY 10001
                      </p>
                      <div className="flex gap-4 mt-2">
                        <Button variant="outline" size="icon" className="rounded-xl border-primary-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-all"><Instagram size={20} /></Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-primary-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-all"><Facebook size={20} /></Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-primary-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-all"><Twitter size={20} /></Button>
                      </div>
                   </div>
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <Clock size={24} className="text-secondary" />
                        <h3 className="text-xl font-bold font-playfair uppercase tracking-wide">Opening Hours</h3>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-primary-foreground/70">
                           <span className="font-bold uppercase tracking-widest text-[10px]">Mon - Fri</span>
                           <span className="font-bold">08:00 AM - 09:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center text-primary-foreground/70">
                           <span className="font-bold uppercase tracking-widest text-[10px]">Saturday</span>
                           <span className="font-bold">09:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center text-secondary">
                           <span className="font-bold uppercase tracking-widest text-[10px]">Sunday</span>
                           <span className="font-bold text-italic italic font-playfair">Closed for Roasting</span>
                        </div>
                      </div>
                   </div>
                </CardContent>
              </Card>

              {/* Simple Map Placeholder */}
              <div className="relative aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer">
                 <Image src="/placeholder.jpg" alt="Map Location" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center gap-4 group-hover:bg-black/20 transition-all duration-300">
                    <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl mb-2 group-hover:scale-110 transition-transform">
                      <MapPin size={32} />
                    </div>
                    <span className="text-white font-bold font-playfair text-2xl">Find Us on the Map</span>
                    <Button variant="secondary" className="rounded-full px-6 font-bold shadow-xl">Open in Google Maps</Button>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
