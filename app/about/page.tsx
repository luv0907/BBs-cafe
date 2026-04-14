'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Coffee, Heart, Users, Award, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const team = [
  {
    name: 'Marco Rossi',
    role: 'Master Barista',
    image: '/marco_rossi.png',
    bio: '15 years of experience in artisanal coffee roasting and brewing.'
  },
  {
    name: 'Elena Vance',
    role: 'Pastry Chef',
    image: '/pastry_chef.png',
    bio: 'Award-winning pastry chef specialized in French-Italian fusion.'
  },
  {
    name: 'David Chen',
    role: 'Operation Manager',
    image: '/david_chen.png',
    bio: 'Ensuring every guest leaves with a smile and a perfect cup.'
  }
]

const values = [
  { icon: Heart, title: 'Made with Love', desc: 'Every bean is roasted and every pastry baked with genuine passion.' },
  { icon: ShieldCheck, title: 'Quality First', desc: 'We source only the finest 100% Arabica beans from sustainable farms.' },
  { icon: ShieldCheck, title: 'Community', desc: 'A hub for creators, thinkers, and coffee lovers since 2015.' },
]

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:w-1/2 flex flex-col gap-6"
          >
            <Badge variant="secondary" className="w-fit px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-secondary text-xs">Since 2015</Badge>
            <h1 className="text-5xl md:text-7xl font-bold font-playfair leading-tight">Our Story: A Passion for <span className="text-secondary">Perfection</span></h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              BBS Café started with a simple idea: that coffee should be an experience, not just a drink. 
              Founded by coffee enthusiasts who traveled the world to find the most unique beans, 
              we brought back more than just flavors—we brought back the art of the perfect brew.
            </p>
            <div className="flex items-center gap-8 mt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-playfair text-primary">10+</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Years Experience</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-playfair text-primary">25k+</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Happy Guests</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-playfair text-primary">15</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Awards</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative aspect-square w-full rounded-[60px] overflow-hidden shadow-2xl border-8 border-background">
              <Image src="/about_story.png" alt="Our Story" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary rounded-[40px] p-8 flex flex-col justify-center gap-2 transform -rotate-12 shadow-xl">
               <Coffee size={32} className="text-secondary-foreground" />
               <span className="text-secondary-foreground font-bold font-playfair text-xl">Best Roast 2023</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-24 mb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair uppercase">What We <span className="text-secondary">Believe</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our values are the heartbeat of BBS Café. They guide every decision we make, 
              from the farms we partner with to the way we greet you every morning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <Card key={i} className="border-none shadow-md bg-card/40 backdrop-blur-sm p-8 flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <v.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold font-playfair">{v.title}</h3>
                <p className="text-muted-foreground">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 mb-24">
         <div className="flex flex-col gap-16">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">
               <div className="flex flex-col gap-4 max-w-xl">
                 <h2 className="text-4xl md:text-6xl font-bold font-playfair">Meet Our <span className="text-secondary">Artists</span></h2>
                 <p className="text-muted-foreground">The talented hands and creative minds behind every cup and plate at BBS Café.</p>
               </div>
               <Badge className="px-6 py-2 rounded-full font-bold uppercase tracking-widest h-fit">Join Our Team</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {team.map((m, i) => (
                <div key={i} className="flex flex-col gap-6 group">
                   <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-xl">
                      <Image src={m.image} alt={m.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-6 left-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                         <h4 className="text-2xl font-bold font-playfair">{m.name}</h4>
                         <p className="text-sm uppercase tracking-widest font-bold opacity-70">{m.role}</p>
                      </div>
                   </div>
                   <p className="text-muted-foreground leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
         <Card className="bg-primary text-primary-foreground p-12 md:p-24 rounded-[60px] overflow-hidden relative border-none shadow-2xl text-center group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/placeholder.jpg')] bg-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col items-center gap-8">
               <Sparkles size={48} className="text-secondary" />
               <h2 className="text-4xl md:text-6xl font-bold font-playfair max-w-3xl">Come Visit Us and Experience the Magic <span className="italic">Firsthand</span></h2>
               <p className="text-primary-foreground/70 max-w-xl text-lg">
                 Whether you're looking for a quiet morning or a vibrant afternoon with friends, 
                 BBS Café is your home away from home.
               </p>
               <div className="flex flex-col sm:flex-row gap-6 mt-4">
                  <a href="/menu" className="h-16 px-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-lg font-bold hover:scale-105 transition-all shadow-xl">Explore Menu</a>
                  <a href="/booking" className="h-16 px-10 rounded-full border-2 border-primary-foreground flex items-center justify-center text-lg font-bold hover:bg-primary-foreground hover:text-primary transition-all">Book a Table</a>
               </div>
            </div>
         </Card>
      </section>
    </div>
  )
}
