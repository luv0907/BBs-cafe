'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Utensils, ShoppingCart, Calendar, Users, Settings, LogOut, Coffee, Loader2, RefreshCw, AlertCircle, Flame, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Utensils, label: 'Menu', href: '/admin/menu' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Flame, label: 'Kitchen KDS', href: '/admin/kitchen' },
  { icon: Bike, label: 'Rider App', href: '/admin/rider' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [timedOut, setTimedOut] = React.useState(false)

  React.useEffect(() => {
    // Show "Try Again" if it takes more than 7 seconds
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => setTimedOut(true), 7000);
    } else {
      setTimedOut(false);
    }

    if (!loading) {
      if (!user) {
        // If not logged in, force to login. (Unless they are already on login, which is fine)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } else if (user.email !== 'akshaybouroju@gmail.com') {
        // If logged in but NOT the true admin, forcefully eject them to the public cafeteria!
        router.push('/')
      }
    }

    return () => clearTimeout(timeout);
  }, [user, loading, router, pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-muted/30 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className={cn("animate-spin text-primary", timedOut && "hidden")} size={48} />
          <AlertCircle className={cn("text-destructive", !timedOut && "hidden")} size={48} />
          
          <div className="flex flex-col gap-2">
            <p className="font-bold uppercase tracking-[0.2em] text-xs text-muted-foreground animate-pulse">
              {timedOut ? "Authentication is taking too long" : "Authenticating Admin..."}
            </p>
            {timedOut && (
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                This might be due to a slow connection or server update.
              </p>
            )}
          </div>
        </div>

        {timedOut && (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button 
              onClick={() => window.location.reload()} 
              variant="default" 
              className="rounded-xl h-12 font-bold flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              className="rounded-xl font-bold"
              asChild
            >
              <Link href="/admin/login">Back to Login</Link>
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen w-full">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-80 bg-background border-r border-border sticky top-0 h-screen hidden lg:flex flex-col p-8 gap-12 z-40">
        <Link href="/" className="flex items-center gap-3 group px-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
            <Coffee size={24} />
          </div>
          <span className="text-2xl font-bold font-playfair tracking-tighter">BBS Admin</span>
        </Link>

        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group hover:bg-secondary/10",
                pathname === item.href ? "bg-secondary text-secondary-foreground shadow-lg" : "text-muted-foreground"
              )}>
                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", pathname === item.href ? "text-secondary-foreground" : "text-primary/70")} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 px-4 pb-4">
           <Separator className="bg-muted opacity-50" />
           <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden border border-secondary/30">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <Users size={20} className="text-secondary" />
                 )}
              </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold truncate max-w-[120px]">{user.displayName || 'Admin'}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      user.email === 'akshaybouroju@gmail.com' ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground opacity-50 tracking-widest">
                      {user.email === 'akshaybouroju@gmail.com' ? 'Verified Admin' : 'Standard User'}
                    </span>
                  </div>
                  <span className="text-[8px] text-muted-foreground opacity-40 font-mono mt-0.5">{user.email}</span>
               </div>
           </div>
           <Button 
             onClick={handleLogout}
             variant="ghost" 
             className="justify-start gap-4 px-4 h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
           >
              <LogOut size={20} />
              Logout
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow min-h-screen relative">
         <div className="container mx-auto px-4 md:px-12 py-12 pb-24">
            {children}
         </div>
         {/* Simple footer for Mobile */}
         <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border border-border px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 z-50">
           {sidebarItems.slice(0, 4).map((item) => (
             <Link key={item.href} href={item.href}>
               <Button variant={pathname === item.href ? "secondary" : "ghost"} size="icon" className="rounded-full w-12 h-12">
                 <item.icon size={20} />
               </Button>
             </Link>
           ))}
         </div>
      </main>
    </div>
  )
}
