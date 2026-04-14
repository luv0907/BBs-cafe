'use client'

import * as React from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { MessageCircle, X, Send, Coffee, Sparkles, User, Bot, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export type MessagePayload = {
  id: number;
  text?: string;
  sender: 'bot' | 'user';
  type?: 'text' | 'deck';
  payload?: any[];
}

const initialMessages: MessagePayload[] = [
  { id: 1, text: "Hi there! I'm your BBS Café AI assistant. How can I help you today? ☕", sender: 'bot', type: 'text' },
]

const suggestedQuestions = [
  "Show me the menu 👀",
  "Add a Classic Espresso",
  "What is in my cart?",
  "Checkout my order 💳"
]

export function AIChatbot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState(initialMessages)
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const [menuCatalog, setMenuCatalog] = React.useState<any[]>([])

  const [isMaximized, setIsMaximized] = React.useState(false)
  const [dim, setDim] = React.useState({ w: 420, h: 600 })
  
  const router = useRouter()
  const { cart, addToCart, cartTotal } = useCart()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Fetch the Live Dictionary on mount so the NLP engine has semantic understanding of available food
  React.useEffect(() => {
     getDocs(collection(db, 'menu')).then(snap => {
       setMenuCatalog(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
     }).catch(console.error)

     // Window Resize Catch for maximum boundaries
     const checkBounds = () => {
        setDim(prev => ({
           w: Math.min(prev.w, window.innerWidth - 48),
           h: Math.min(prev.h, window.innerHeight - 48)
        }))
     }
     window.addEventListener('resize', checkBounds)
     return () => window.removeEventListener('resize', checkBounds)
  }, [])

  // Floating Window Geometry Override
  const handleResize = (e: React.PointerEvent, dir: 'nw' | 'n' | 'w') => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = dim.w
    const startH = dim.h

    const onPointerMove = (evt: PointerEvent) => {
       let newW = startW
       let newH = startH
       if (dir === 'nw' || dir === 'w') newW = startW + (startX - evt.clientX)
       if (dir === 'nw' || dir === 'n') newH = startH + (startY - evt.clientY)

       // Hardware Safe Bounds Clamping
       newW = Math.max(320, Math.min(newW, window.innerWidth - 48))
       newH = Math.max(400, Math.min(newH, window.innerHeight - 100))
       setDim({ w: newW, h: newH })
    }

    const onPointerUp = () => {
       document.removeEventListener('pointermove', onPointerMove)
       document.removeEventListener('pointerup', onPointerUp)
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const newMessage = { id: messages.length + 1, text, sender: 'user' }
    setMessages([...messages, newMessage])
    setInput('')
    setIsTyping(true)

    // Advanced Local NLP Engine Hook
    setTimeout(() => {
      let responseText = "I didn't quite catch that. Try asking me to 'Show Menu' or 'Add Espresso'."
      const lower = text.toLowerCase()

      // Intent 1: Menu Parsing (The Gamified Swipe Deck)
      if (lower.includes('menu') || lower.includes('food') || lower.includes('have')) {
         if (menuCatalog.length === 0) {
           responseText = "Our live menu is currently empty or loading..."
         } else {
           setMessages(prev => [...prev, { 
              id: prev.length + 1, 
              text: "Here is today's fresh menu! Swipe right to add it to your order, or swipe left to skip.", 
              sender: 'bot', 
              type: 'text' 
           }])
           setMessages(prev => [...prev, { 
              id: prev.length + 1, 
              sender: 'bot', 
              type: 'deck',
              payload: menuCatalog.slice(0, 8) 
           }])
           setIsTyping(false)
           return
         }
      } 
      // Intent 2: Checkout Action
      else if (lower.includes('book') || lower.includes('checkout') || lower.includes('order')) {
         if (cart.length === 0) {
            responseText = "Your cart is empty! Take a look at our menu first."
         } else {
            responseText = "Perfect! Sending you directly to the secure checkout terminal..."
            setTimeout(() => {
               router.push('/checkout')
               setIsOpen(false)
            }, 1800)
         }
      }
      // Intent 3: Auto Add-to-Cart
      else if (lower.includes('add') || lower.includes('buy') || lower.includes('want')) {
          let foundItem = null
          for (const m of menuCatalog) {
             if (lower.includes(m.name.toLowerCase())) {
                foundItem = m
                break
             }
          }
          if (foundItem) {
             const match = lower.match(/\d+/)
             const qty = match ? parseInt(match[0]) : 1
             addToCart({
                id: foundItem.id,
                name: foundItem.name,
                price: foundItem.price,
                image: foundItem.image
             }, qty)
             responseText = `Boom! Added ${qty}x ${foundItem.name} to your cart. Your new order subtotal is hovering around $${(cartTotal + (foundItem.price * qty)).toFixed(2)}. Say 'Checkout' when you are ready to pay!`
          } else {
             responseText = "I couldn't figure out which distinct item you wanted. Did you use its exact name from our menu?"
          }
      }
      // Intent 4: Cart Introspection
      else if (lower.includes('cart') || lower.includes('total')) {
         responseText = `You are currently holding ${cart.length} distinct item types in your cart, with a combined total of $${cartTotal.toFixed(2)}.`
      }
      // Implicit Fallbacks
      else if (lower.includes('hours')) {
        responseText = "We're open Mon-Fri 08:00 AM to 09:00 PM, and Saturdays 09:00 AM to 10:00 PM!"
      }

      setMessages(prev => [...prev, { id: prev.length + 1, text: responseText, sender: 'bot', type: 'text' }])
      setIsTyping(false)
    }, 1500)
  }

  // Push system message directly from Swipes
  const SystemInject = (text: string) => {
    setMessages(prev => [...prev, { id: prev.length + 1, text, sender: 'bot', type: 'text' }])
  }

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isTyping])

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col relative z-50 pointer-events-auto"
            style={{ 
               width: isMaximized ? '95vw' : dim.w, 
               height: isMaximized ? '90vh' : dim.h,
               maxWidth: '100vw', 
               maxHeight: '100vh',
               transition: isMaximized ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
            }}
          >
            <Card className="border-none shadow-2xl flex flex-col h-full overflow-hidden bg-background/80 backdrop-blur-xl rounded-[40px] border border-white/20">
              
              {/* Invisible Grab Handles for Custom Resizing */}
              {!isMaximized && (
                <>
                  <div onPointerDown={(e) => handleResize(e, 'nw')} className="absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-50 bg-transparent" />
                  <div onPointerDown={(e) => handleResize(e, 'n')} className="absolute top-0 left-8 right-0 h-4 cursor-ns-resize z-40 bg-transparent" />
                  <div onPointerDown={(e) => handleResize(e, 'w')} className="absolute top-8 bottom-0 left-0 w-4 cursor-ew-resize z-40 bg-transparent" />
                </>
              )}

              <CardHeader className="bg-primary text-primary-foreground p-6 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Coffee size={24} className="text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-playfair font-bold">BBS Assistant</CardTitle>
                    <div className="flex items-center gap-1.5 opacity-70">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Always Brewing Answers</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setIsMaximized(!isMaximized)}>
                     {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                   </Button>
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setIsOpen(false)}>
                     <X size={20} />
                   </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-grow overflow-hidden p-0 relative">
                <ScrollArea className="h-full p-6" ref={scrollRef}>
                  <div className="flex flex-col gap-6">
                    {messages.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3 max-w-[85%]",
                          m.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                          m.sender === 'bot' ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                        )}>
                          {m.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        {m.type === 'deck' && m.payload ? (
                           <div className="w-[280px] h-[340px] mt-2">
                              <SwipeDeck 
                                 items={m.payload} 
                                 onSwipeRight={(item: any) => {
                                    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image }, 1)
                                    SystemInject(`Awesome! Swiped right on ${item.name}. I've firmly added 1x to your cart! 🛒`)
                                 }} 
                                 onSwipeLeft={(item) => {
                                    // Optional skipped log
                                 }}
                                 onEmpty={() => {
                                    SystemInject("You swiped through the entire highlighted stack! Want to 'Checkout'?")
                                 }}
                              />
                           </div>
                        ) : (
                           <div className={cn(
                             "p-4 rounded-[24px] text-sm leading-relaxed shadow-sm w-full",
                             m.sender === 'bot' 
                               ? "bg-white text-primary rounded-tl-none border border-muted" 
                               : "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
                           )}>
                             {m.text}
                           </div>
                        )}
                      </motion.div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                          <Bot size={16} />
                        </div>
                        <div className="p-4 rounded-[24px] bg-white border border-muted flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-6 pt-2 flex flex-col gap-4 bg-muted/30 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background border border-border px-3 py-2 rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    className="h-14 rounded-2xl border-none bg-background shadow-inner text-base focus-visible:ring-secondary"
                  />
                  <Button 
                    size="icon" 
                    className="w-14 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                    onClick={() => handleSend(input)}
                  >
                    <Send size={20} />
                  </Button>
                </div>
                <p className="text-[8px] text-center font-bold uppercase tracking-[0.2em] opacity-30 flex items-center justify-center gap-1">
                  <Sparkles size={8} /> Powered by BBS AI Agent
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-primary animate-bounce">
            1
          </span>
        )}
        <div className="absolute inset-x-0 h-px -bottom-4 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </motion.button>
    </div>
  )
}

// ----------------------------------------------------
// EXPERIMENTAL SWIPE DECK GAMIFICATION MINI-APP
// ----------------------------------------------------

function SwipeDeck({ items, onSwipeRight, onSwipeLeft, onEmpty }: any) {
  const [index, setIndex] = React.useState(0)

  // Empty state fallback directly replaces the card view when swiped entirely
  if (index >= items.length) {
    return <div className="p-4 bg-muted/40 rounded-xl text-center text-sm font-bold text-muted-foreground w-full h-[60px] flex items-center justify-center">Deck Empty!</div>
  }

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center perspective-[1200px]">
      {items.map((item: any, i: number) => {
        if (i < index) return null;
        if (i > index + 2) return null; // Render max 3 cards for perf
        const isTop = i === index;
        return <SwipeCard key={`${item.id}-${i}`} item={item} isTop={isTop} index={i - index} onDragEnd={(dir: string) => {
           setIndex(prev => prev + 1)
           if (dir === 'right') onSwipeRight(item)
           if (dir === 'left') onSwipeLeft(item)
           if (i === items.length - 1) onEmpty?.()
        }} />
      }).reverse()}
    </div>
  )
}

function SwipeCard({ item, isTop, index, onDragEnd }: any) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 150], [-10, 10])
  const bg = useTransform(x, [-100, 0, 100], ['#fecaca', '#ffffff', '#bbf7d0'])
  
  // Create beautiful physics-based overlays
  const yepOpacity = useTransform(x, [10, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-10, -100], [0, 1])

  return (
    <motion.div
      className="absolute top-2 w-[260px] h-[300px] rounded-[32px] shadow-2xl overflow-hidden border border-border/50 flex flex-col cursor-grab active:cursor-grabbing pointer-events-auto select-none"
      style={{
         x: isTop ? x : 0, 
         rotate: isTop ? rotate : 0, 
         scale: 1 - (index * 0.05),
         y: index * 16,
         zIndex: 50 - index,
         backgroundColor: bg
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
         // Aggressive Drag Detection Parameters
         if (info.offset.x > 80 || info.velocity.x > 500) {
            onDragEnd('right')
         } else if (info.offset.x < -80 || info.velocity.x < -500) {
            onDragEnd('left')
         }
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1 - (index * 0.2), scale: 1 - (index * 0.05) }}
      transition={{ duration: 0.3 }}
    >
       <div className="h-[180px] w-full relative shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
          
          {isTop && (
             <>
                <motion.div style={{ opacity: yepOpacity }} className="absolute font-playfair inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-[2px]">
                   <span className="text-green-900 border-4 border-green-900 rounded-xl px-4 py-2 font-black text-3xl -rotate-12 shadow-2xl">ADD +</span>
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute font-playfair inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-[2px]">
                   <span className="text-red-900 border-4 border-red-900 rounded-xl px-4 py-2 font-black text-3xl rotate-12 shadow-2xl">SKIP</span>
                </motion.div>
             </>
          )}
       </div>
       <div className="p-5 flex flex-col justify-center flex-grow pointer-events-none bg-white">
          <h3 className="font-bold text-xl font-playfair leading-tight truncate">{item.name}</h3>
          <p className="text-base font-black text-secondary uppercase tracking-widest mt-1">${Number(item.price).toFixed(2)}</p>
       </div>
    </motion.div>
  )
}
