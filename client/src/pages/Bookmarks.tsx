/**
 * Bookmarks Page
 * Design: Neo-Noir Cinema
 * 
 * Features:
 * - Saved dramas list
 * - Continue watching section
 * - Watch history
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Bookmark, Clock, Play, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookmarks, useWatchHistory } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { getContinueWatching, history, clearHistory } = useWatchHistory();
  const continueWatching = getContinueWatching();
  const [activeTab, setActiveTab] = useState("bookmarks");

  const handleRemoveBookmark = (bookId: string, bookName: string) => {
    removeBookmark(bookId);
    toast(`${bookName} dihapus dari daftar simpan`);
  };

  const handleClearHistory = () => {
    clearHistory();
    toast("Riwayat tontonan dihapus");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border safe-top">
        <div className="container py-4">
          <h1 className="font-display text-2xl text-foreground">Koleksi Saya</h1>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-secondary rounded-xl p-1 mb-6">
            <TabsTrigger 
              value="bookmarks" 
              className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Simpan ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Clock className="w-4 h-4 mr-2" />
              Riwayat ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {bookmarks.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-16 h-16 text-muted-foreground" />}
                title="Belum ada drama tersimpan"
                description="Drama yang kamu simpan akan muncul di sini"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {bookmarks.map((drama, index) => (
                    <motion.div
                      key={drama.bookId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <Link href={`/drama/${drama.bookId}`}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                          <img
                            src={drama.coverWap}
                            alt={drama.bookName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center glow-crimson">
                              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white text-sm font-medium line-clamp-2">
                              {drama.bookName}
                            </h3>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(drama.bookId, drama.bookName);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {history.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-16 h-16 text-muted-foreground" />}
                title="Belum ada riwayat"
                description="Drama yang kamu tonton akan muncul di sini"
              />
            ) : (
              <>
                {/* Clear history button */}
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Riwayat
                  </Button>
                </div>

                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <section className="mb-8">
                    <h2 className="font-display text-lg text-foreground mb-4">
                      Lanjutkan Menonton
                    </h2>
                    <div className="space-y-3">
                      {continueWatching.map((item, index) => (
                        <motion.div
                          key={`${item.bookId}-${item.episodeIndex}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={`/watch/${item.bookId}/${item.episodeIndex}`}>
                            <div className="flex gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group">
                              <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.coverWap}
                                  alt={item.bookName}
                                  className="w-full h-full object-cover"
                                />
                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                  <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                {/* Play icon */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-foreground font-medium line-clamp-1">
                                  {item.bookName}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  {item.episodeName}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                  {item.progress}% selesai
                                </p>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Full History */}
                <section>
                  <h2 className="font-display text-lg text-foreground mb-4">
                    Riwayat Lengkap
                  </h2>
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <motion.div
                        key={`${item.bookId}-${item.episodeIndex}-${item.watchedAt}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Link href={`/watch/${item.bookId}/${item.episodeIndex}`}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.coverWap}
                                alt={item.bookName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-foreground text-sm font-medium line-clamp-1">
                                {item.bookName}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                {item.episodeName} • {new Date(item.watchedAt).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 opacity-50">{icon}</div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Link href="/">
        <Button>Jelajahi Drama</Button>
      </Link>
    </motion.div>
  );
}
