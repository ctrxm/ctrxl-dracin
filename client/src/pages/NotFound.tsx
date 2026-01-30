/**
 * 404 Not Found Page - Premium Streaming Experience
 * Design: Modern, Clean, Netflix-inspired
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home, Search, Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-md"
      >
        {/* Icon */}
        <motion.div 
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-secondary flex items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Film className="w-16 h-16 text-muted-foreground" />
        </motion.div>
        
        {/* 404 Text */}
        <h1 className="font-display text-8xl gradient-text mb-4">404</h1>
        
        {/* Message */}
        <h2 className="text-2xl font-display text-foreground mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-muted-foreground mb-8">
          Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak tersedia. 
          Mari kembali dan temukan drama menarik lainnya!
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 glow-primary w-full sm:w-auto">
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto">
              <Search className="w-5 h-5" />
              Cari Drama
            </Button>
          </Link>
        </div>
        
        <Button
          variant="ghost"
          className="mt-6 text-muted-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke halaman sebelumnya
        </Button>
      </motion.div>
    </div>
  );
}
