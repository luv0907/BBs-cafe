'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw,
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Star, 
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument
} from '@/lib/firebase-utils'
import { uploadToCloudinary } from '@/lib/cloudinary-utils'
import { seedMenuDatabase } from '@/lib/sync-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function AdminMenuPage() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [isSyncing, setIsSyncing] = React.useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const count = await seedMenuDatabase()
      toast.success(`Successfully synced ${count} items from the main website!`)
    } catch (error) {
      toast.error('Sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Real-time subscription
  React.useEffect(() => {
    const unsubscribe = subscribeToCollection('menu', (data) => {
      setItems(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log("Starting menu item submission...")
    
    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const category = formData.get('category') as string
      const price = parseFloat(formData.get('price') as string)
      const stock = parseInt(formData.get('stock') as string)
      const description = formData.get('description') as string
      const rating = editingItem ? editingItem.rating : 5.0

      let imageUrl = editingItem?.image || '/placeholder.jpg'

      if (selectedFile) {
        console.log("Uploading file to Cloudinary:", selectedFile.name)
        
        // Add a safety timeout for the upload to Cloudinary as well
        const uploadPromise = uploadToCloudinary(selectedFile)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Upload timed out after 15s")), 15000)
        )
        
        imageUrl = await Promise.race([uploadPromise, timeoutPromise]) as string
        console.log("File uploaded successfully to Cloudinary:", imageUrl)
      }

      const itemData = {
        name,
        category,
        price,
        stock,
        description,
        image: imageUrl,
        rating,
        status: stock > 30 ? 'Active' : stock > 0 ? 'Low Stock' : 'Out of Stock'
      }

      if (editingItem) {
        console.log("Updating document:", editingItem.id)
        await updateDocument('menu', editingItem.id, itemData)
        toast.success('Item updated successfully')
      } else {
        console.log("Adding new document to 'menu'")
        await addDocument('menu', itemData)
        toast.success('Item added successfully')
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Submission Error:", error)
      toast.error(`Error: ${error.message || 'Something went wrong'}`)
    } finally {
      setIsSubmitting(false)
      console.log("Submission process finished.")
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDocument('menu', id)
        toast.success('Item deleted')
      } catch (error) {
        toast.error('Failed to delete item')
      }
    }
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setImagePreview(item.image)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Menu Management</p>
           <h1 className="text-4xl md:text-5xl font-bold font-playfair tracking-tight">Artisanal <span className="text-secondary text-italic italic">Items</span></h1>
        </div>
        
        <Button 
          onClick={openAddDialog}
          className="rounded-2xl h-14 px-8 font-bold shadow-xl flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus size={20} />
          Add New Item
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-3xl max-w-2xl bg-card border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-3xl font-playfair font-bold">
                {editingItem ? 'Edit' : 'Add'} <span className="text-secondary">Menu Item</span>
              </DialogTitle>
              <DialogDescription>Fill in the details below to manage your delicious items.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Item Name</Label>
                <Input 
                  name="name" 
                  defaultValue={editingItem?.name} 
                  required 
                  placeholder="e.g. Vanilla Latte" 
                  className="h-12 rounded-xl focus-visible:ring-secondary" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Category</Label>
                <Select name="category" defaultValue={editingItem?.category || 'coffee'}>
                  <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 focus:ring-secondary">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="coffee" className="rounded-lg">Coffee</SelectItem>
                    <SelectItem value="snacks" className="rounded-lg">Snacks</SelectItem>
                    <SelectItem value="desserts" className="rounded-lg">Desserts</SelectItem>
                    <SelectItem value="combos" className="rounded-lg">Combos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Price ($)</Label>
                <Input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editingItem?.price} 
                  required 
                  placeholder="4.50" 
                  className="h-12 rounded-xl focus-visible:ring-secondary" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Stock Quantity</Label>
                <Input 
                  name="stock" 
                  type="number" 
                  defaultValue={editingItem?.stock} 
                  required 
                  placeholder="100" 
                  className="h-12 rounded-xl focus-visible:ring-secondary" 
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                 <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Description</Label>
                 <Textarea 
                   name="description" 
                   defaultValue={editingItem?.description} 
                   required
                   placeholder="Describe the flavors and ingredients..." 
                   className="min-h-[100px] rounded-xl focus-visible:ring-secondary" 
                 />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                 <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Upload Image</Label>
                 <div 
                   className="relative h-48 rounded-2xl border-2 border-dashed border-muted-foreground/20 overflow-hidden group cursor-pointer"
                   onClick={() => document.getElementById('image-upload')?.click()}
                 >
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Click to upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest">
                       Change Image
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                 </div>
              </div>
            </div>
            <DialogFooter className="gap-4">
               <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
               <Button 
                 type="submit" 
                 disabled={isSubmitting} 
                 className="rounded-xl h-12 px-8 font-bold shadow-lg min-w-[140px]"
               >
                 {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : editingItem ? 'Save Changes' : 'Create Item'}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters Area */}
      <Card className="border-none shadow-md bg-card/40 backdrop-blur-sm p-4 rounded-3xl">
         <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
               <Input 
                 placeholder="Search menu items..." 
                 className="pl-12 h-12 rounded-2xl border-muted-foreground/10 focus-visible:ring-secondary"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-muted-foreground/10">
               <Filter size={18} />
               Filter
            </Button>
            <div className="hidden md:block w-px h-8 bg-border/50 mx-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4">Showing {filteredItems.length} Items</p>
         </div>
      </Card>

      {/* Menu Table */}
      <Card className="border-none shadow-xl overflow-hidden bg-white/70 backdrop-blur-md rounded-[40px]">
         <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
                <Loader2 className="animate-spin" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs opacity-50">Syncing with Cosmos...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                   <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-8 py-5">Item</th>
                      <th className="px-8 py-5 text-center">Category</th>
                      <th className="px-8 py-5">Price</th>
                      <th className="px-8 py-5">Stock</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                   <AnimatePresence mode="popLayout">
                     {filteredItems.map((item) => (
                       <motion.tr 
                         layout
                         key={item.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="group hover:bg-muted/20 transition-all"
                       >
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform bg-muted">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                               </div>
                               <div className="flex flex-col shrink-0">
                                  <span className="font-bold text-lg">{item.name}</span>
                                  <div className="flex items-center gap-1 text-secondary font-bold text-[10px]">
                                     <Star size={10} fill="currentColor" />
                                     {item.rating}
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <Badge variant="secondary" className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase opacity-70">
                               {item.category}
                            </Badge>
                         </td>
                         <td className="px-8 py-5">
                            <span className="font-bold text-lg text-primary">${item.price.toFixed(2)}</span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex flex-col">
                               <span className="font-bold">{item.stock}</span>
                               <div className="w-16 h-1 rounded-full bg-muted mt-1 overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      item.stock > 30 ? "bg-green-500" : item.stock > 10 ? "bg-yellow-500" : "bg-red-500"
                                    )} 
                                    style={{ width: `${Math.min(item.stock, 100)}%` }}
                                  />
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <Badge className={cn(
                               "rounded-full px-3 py-1 font-bold text-[10px] uppercase border-none",
                               item.status === 'Active' ? "bg-green-100 text-green-700" :
                               item.status === 'Low Stock' ? "bg-yellow-100 text-yellow-700" :
                               "bg-red-100 text-red-700"
                            )}>
                               {item.status}
                            </Badge>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center justify-end gap-2 text-muted-foreground">
                               <Button 
                                 onClick={() => openEditDialog(item)}
                                 variant="ghost" 
                                 size="icon" 
                                 className="rounded-xl w-10 h-10 hover:bg-primary/10 hover:text-primary transition-all"
                               >
                                  <Edit2 size={18} />
                               </Button>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="rounded-xl w-10 h-10 hover:bg-destructive/10 hover:text-destructive transition-all"
                                 onClick={() => handleDelete(item.id)}
                               >
                                  <Trash2 size={18} />
                               </Button>
                            </div>
                         </td>
                       </motion.tr>
                     ))}
                   </AnimatePresence>
                </tbody>
              </table>
            )}
         </div>
         {!loading && filteredItems.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold font-playfair mb-2">No items found</h3>
              <p className="text-muted-foreground mb-8">Your database is currently empty. Sync the initial items from the website to get started!</p>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="rounded-full h-14 px-10 font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                Sync Website Menu
              </Button>
            </div>
          )}
      </Card>
    </div>
  )
}
