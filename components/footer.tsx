'use client'

import * as React from 'react'
import Link from 'next/link'
import { Coffee, Facebook, Instagram, Twitter, MapPin, Phone, Mail, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand & Story */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
              <Coffee size={24} />
            </div>
            <span className="text-2xl font-bold font-playfair tracking-tight">BBS Café</span>
          </Link>
          <p className="text-primary-foreground/70 leading-relaxed text-sm">
            Crafting the perfect cup of coffee since 2010. We source the finest beans and roast them to perfection for your delight.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              <Facebook size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              <Instagram size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              <Twitter size={18} />
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold font-playfair tracking-tight">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {[
              { name: 'Menu', href: '/menu' },
              { name: 'Book Table', href: '/booking' },
              { name: 'My Cart', href: '/cart' },
              { name: 'Our Story', href: '/about' },
              { name: 'Contact Us', href: '/contact' },
              { name: 'Admin', href: '/admin' },
            ].map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className="group flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors duration-200 text-sm"
                >
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold font-playfair tracking-tight">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-secondary shrink-0 pt-0.5" />
              <span>123 Espresso Lane, <br />Coffee City, CA 90210</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-secondary shrink-0" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-secondary shrink-0" />
              <span>hello@bbscafe.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-bold font-playfair tracking-tight">Newsletter</h4>
          <p className="text-primary-foreground/70 text-sm">
            Subscribe to get special offers and coffee tips.
          </p>
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Your email" 
              className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground focus-visible:ring-secondary placeholder:text-primary-foreground/40"
            />
            <Button variant="secondary" className="px-5 font-medium hover:scale-105 transition-transform duration-200">
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-primary-foreground/40 font-medium tracking-wider uppercase">
        <p>© 2024 BBS CAFÉ. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-secondary transition-colors duration-200">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-secondary transition-colors duration-200">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
