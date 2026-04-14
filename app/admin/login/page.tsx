'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Coffee, Lock, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      router.push('/admin')
    }
  }, [user, router])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      await login()
      toast.success('Successfully logged in!')
      router.push('/admin')
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-muted/10">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 z-10"
      >
        <div className="flex flex-col items-center gap-6 mb-10">
           <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent group-hover:scale-110 transition-transform" />
              <Coffee size={40} className="relative z-10 group-hover:rotate-12 transition-transform" />
           </div>
           <div className="text-center flex flex-col gap-2">
              <h1 className="text-4xl font-bold font-playfair tracking-tight">Admin <span className="text-secondary italic">Access</span></h1>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-50">Authorized Personnel Only</p>
           </div>
        </div>

        <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-background/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center p-10 pb-2">
            <CardTitle className="text-2xl font-bold font-playfair">BBS Café Manager</CardTitle>
            <CardDescription className="text-balance font-medium">
              Securely manage your shop, orders, and items in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-muted/50 border border-border/50 flex flex-col gap-4 text-center">
               <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                     <Lock size={20} />
                  </div>
               </div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Authentication is handled securely via <br/> <span className="text-primary">Google Identity Services</span>
               </p>
            </div>

            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-16 rounded-2xl text-lg font-bold flex items-center gap-3 shadow-xl hover:scale-[1.02] transition-all bg-primary hover:bg-primary/90"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 invert" />
                  Continue with Google
                  <ArrowRight size={20} className="ml-auto opacity-50" />
                </>
              )}
            </Button>

            <Separator className="bg-border/50" />
            
            <p className="text-[10px] text-center font-bold uppercase tracking-widest text-muted-foreground opacity-30">
               Protected by BBS Security Systems
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
           <Button variant="link" className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest" asChild>
              <Link href="/">Back to Website</Link>
           </Button>
        </div>
      </motion.div>
    </div>
  )
}

import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
