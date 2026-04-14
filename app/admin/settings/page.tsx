'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Database, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Moon, 
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { seedDatabase } from '@/scripts/seed-data'
import { deleteDocument, getCollection } from '@/lib/firebase-utils'

export default function SettingsPage() {
  const [isSeeding, setIsSeeding] = React.useState(false)
  const [isClearing, setIsClearing] = React.useState(false)

  const handleSeed = async () => {
    if (window.confirm('This will add sample menu items to your database. Continue?')) {
      setIsSeeding(true)
      try {
        await seedDatabase()
        toast.success('Database seeded successfully!', {
          description: 'Refresh the menu page to see the new items.'
        })
      } catch (err) {
        toast.error('Failed to seed database.')
      } finally {
        setIsSeeding(false)
      }
    }
  }

  const handleClear = async () => {
    if (window.confirm('WARNING: This will delete ALL menu items. This action cannot be undone. Continue?')) {
      setIsClearing(true)
      try {
        const items = await getCollection('menu')
        for (const item of items) {
          await deleteDocument('menu', item.id)
        }
        toast.success('Database cleared.')
      } catch (err) {
        toast.error('Failed to clear database.')
      } finally {
        setIsClearing(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
         <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">System Settings</p>
         <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">Admin <span className="text-secondary italic">Controls</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Database Controls */}
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Database size={24} />
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-bold font-playfair">Database Management</CardTitle>
                    <CardDescription className="font-medium text-xs font-bold uppercase tracking-widest opacity-60">Control your digital inventory</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 flex flex-col gap-8">
              <div className="flex items-center justify-between gap-6 p-6 rounded-3xl bg-muted/30 border border-border/50">
                 <div className="flex flex-col gap-1">
                    <h4 className="font-bold">Initial Seed Data</h4>
                    <p className="text-sm text-muted-foreground">Populate your menu with high-quality sample items and images.</p>
                 </div>
                 <Button 
                   onClick={handleSeed}
                   disabled={isSeeding || isClearing}
                   className="rounded-xl h-12 px-6 font-bold shadow-lg flex items-center gap-2 shrink-0 bg-primary hover:bg-primary/90"
                 >
                    {isSeeding ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    Seed Data
                 </Button>
              </div>

              <div className="flex items-center justify-between gap-6 p-6 rounded-3xl bg-destructive/5 border border-destructive/10">
                 <div className="flex flex-col gap-1 text-destructive">
                    <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={18} /> Danger Zone</h4>
                    <p className="text-sm opacity-70">Delete all menu items currently in the database. Use with caution.</p>
                 </div>
                 <Button 
                   onClick={handleClear}
                   disabled={isSeeding || isClearing}
                   variant="ghost" 
                   className="rounded-xl h-12 px-6 font-bold text-destructive hover:bg-destructive/10 shrink-0"
                 >
                    {isClearing ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    Clear All
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-4">
               <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                    <Settings size={24} />
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-bold font-playfair">Preferences</CardTitle>
                    <CardDescription className="opacity-60 font-medium">Customize your admin experience</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <Label className="text-lg font-bold">Real-time Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get instant alerts for new orders and bookings.</p>
                 </div>
                 <Switch defaultChecked />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <Label className="text-lg font-bold">Dark Mode Dashboard</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark dashboard themes.</p>
                 </div>
                 <Switch />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <Label className="text-lg font-bold">Email Summaries</Label>
                    <p className="text-sm text-muted-foreground">Receive daily performance reports in your inbox.</p>
                 </div>
                 <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-8">
           <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <CardContent className="p-10 flex flex-col gap-6 relative z-10">
                 <ShieldCheck size={48} className="text-secondary" />
                 <h2 className="text-3xl font-bold font-playfair leading-tight">Your Site is <br/> <span className="text-black bg-white px-2 decoration-secondary decoration-4 underline">Securely</span> Syncing</h2>
                 <p className="text-sm text-white/70 font-medium leading-relaxed">
                    We are currently using Firebase Cloud Firestore for real-time data and Google Storage for your medical-grade item processing.
                 </p>
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary pt-4">
                    <CheckCircle2 size={14} />
                    Everything is nominal
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-[2.5rem] p-10 flex flex-col gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
                 <Globe size={40} />
              </div>
              <div>
                 <h4 className="font-bold text-xl mb-1">Production Ready</h4>
                 <p className="text-xs text-muted-foreground font-medium">Your site is currently optimized for multi-region deployment.</p>
              </div>
              <Separator className="bg-black/5" />
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">System Version</span>
                 <span className="font-bold font-mono text-xs">v4.2.0-ALMA</span>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
