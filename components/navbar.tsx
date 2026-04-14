'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, X, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'Booking', href: '/booking' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const isMobile = useIsMobile()
  const { cartCount } = useCart()
  const { user, login, logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-border py-3 shadow-md' 
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <Coffee size={24} />
          </div>
          <span className="text-2xl font-bold font-playfair tracking-tight">BBS Café</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-secondary transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        {/* Icons & Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search size={20} />
          </Button>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-secondary text-secondary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 overflow-hidden ml-2 p-0">
                      {user.photoURL ? (
                         <img src={user.photoURL} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                         <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.displayName?.charAt(0) || 'U'}
                         </div>
                      )}
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 border-border/50 shadow-xl">
                   <div className="px-2 py-3 border-b border-border/50 mb-2">
                       <p className="font-bold text-sm truncate">{user.displayName}</p>
                       <p className="text-xs text-muted-foreground opacity-70 truncate">{user.email}</p>
                   </div>
                   <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-bold">
                       <Link href="/orders">Track Orders</Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl cursor-pointer font-bold" onClick={logout}>
                      Sign Out
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          ) : (
             <Button variant="default" className="font-bold rounded-full ml-2 hidden sm:flex" onClick={() => login().catch(console.error)}>
                Sign In
             </Button>
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium hover:text-secondary"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="h-[1px] w-full bg-border" />
            
            {!user ? (
               <Button variant="default" className="w-full font-bold rounded-xl h-14 text-lg" onClick={() => { login(); setIsOpen(false); }}>
                  Sign In with Google
               </Button>
            ) : (
               <Button variant="outline" className="w-full font-bold rounded-xl h-14 text-lg border-destructive text-destructive hover:bg-destructive/10" onClick={() => { logout(); setIsOpen(false); }}>
                  Sign Out
               </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
