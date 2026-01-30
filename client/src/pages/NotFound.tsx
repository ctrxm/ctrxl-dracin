/**
 * 404 Not Found Page
 * Design: Neo-Noir Cinema
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Cinematic 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <h1 className="font-display text-[150px] leading-none text-primary/20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        </motion.div>

        <h2 className="font-display text-3xl text-foreground mb-4">
          Scene Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Sepertinya kamu tersesat di balik layar. Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Search className="w-4 h-4" />
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
