/**
 * Bookmarks Page - Premium Streaming Experience
 * Design: Modern, Clean, Netflix-inspired
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Bookmark, Clock, Play, Trash2, X, Heart, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseBookmarks } from "@/hooks/useSupabaseBookmarks";
import { useSupabaseWatchHistory } from "@/hooks/useSupabaseWatchHistory";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Bookmarks() {
  const { user } = useAuth();
  const { bookmarks, removeBookmark: removeSupabaseBookmark, loading: bookmarksLoading } = useSupabaseBookmarks();
  const { history, getContinueWatching, clearHistory, loading: historyLoading } = useSupabaseWatchHistory();
  const continueWatching = getContinueWatching();
  const [activeTab, setActiveTab] = useState("bookmarks");

  const handleRemoveBookmark = async (dramaSource: string, dramaId: string, bookName: string) => {
    if (!user) {
      toast.error('Please login to manage bookmarks');
      return;
    }
    await removeSupabaseBookmark(dramaSource, dramaId);
  };

  const handleClearHistory = async () => {
    if (!user) {
      toast.error('Please login to manage history');
      return;
    }
    await clearHistory();
    toast.success("Riwayat tontonan dihapus");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav safe-top">
        <div className="container py-5">
          <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Koleksi Saya
          </h1>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-secondary/50 rounded-2xl p-1.5 mb-8">
            <TabsTrigger 
              value="bookmarks" 
              className="flex-1 rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Simpan ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="flex-1 rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              Riwayat ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {bookmarks.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-12 h-12 text-muted-foreground" />}
                title="Belum ada drama tersimpan"
                description="Drama yang kamu simpan akan muncul di sini. Mulai jelajahi dan simpan drama favoritmu!"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {bookmarks.map((drama, index) => (
                    <motion.div
                      key={drama.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <Link href={`/drama/${drama.drama_source}/${drama.drama_id}`}>
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden card-hover">
                          <img
                            src={drama.drama_image || '/placeholder.jpg'}
                            alt={drama.drama_title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-primary">
                              <Play className="w-7 h-7 text-white fill-white ml-1" />
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-semibold line-clamp-2 text-sm">
                              {drama.drama_title}
                            </h3>
                          </div>
                          
                          {/* Border */}
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-primary/50 transition-all" />
                        </div>
                      </Link>
                      
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveBookmark(drama.drama_source, drama.drama_id, drama.drama_title);
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
                icon={<Clock className="w-12 h-12 text-muted-foreground" />}
                title="Belum ada riwayat"
                description="Drama yang kamu tonton akan muncul di sini. Mulai menonton drama favoritmu!"
              />
            ) : (
              <>
                {/* Clear history button */}
                <div className="flex justify-end mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive gap-2"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Riwayat
                  </Button>
                </div>

                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <section className="mb-10">
                    <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Lanjutkan Menonton
                    </h2>
                    <div className="space-y-3">
                      {continueWatching.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={`/watch/${item.drama_source}/${item.drama_id}/${item.episode}`}>
                            <div className="flex gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all group">
                              <div className="relative w-28 aspect-video rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                  src={item.drama_image || '/placeholder.jpg'}
                                  alt={item.drama_title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                  <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${(item.progress / item.duration) * 100}%` }}
                                  />
                                </div>
                                {/* Play icon */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 py-1">
                                <h3 className="text-foreground font-semibold line-clamp-1 mb-1">
                                  {item.drama_title}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-2">
                                  {item.episodeName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {item.progress}%
                                  </span>
                                </div>
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
                  <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-muted-foreground" />
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
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
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
                            <Play className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        {icon}
      </div>
      <h2 className="text-xl font-display text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">{description}</p>
      <Link href="/">
        <Button className="gap-2 glow-primary">
          <Play className="w-4 h-4" />
          Jelajahi Drama
        </Button>
      </Link>
    </motion.div>
  );
}
