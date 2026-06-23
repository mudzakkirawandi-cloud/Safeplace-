"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Image as ImageIcon, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Journal {
  id: string
  title: string | null
  content: string
  mood: string
  image_url: string | null
  created_at: string
}

export default function JournalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("😌")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const emojis = ["😔", "😌", "😢", "😊", "😤", "😰"]

  const fetchJournals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setJournals(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJournals()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let image_url = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('journals')
          .upload(filePath, imageFile)

        if (!uploadError) {
          const { data } = supabase.storage
            .from('journals')
            .getPublicUrl(filePath)
          image_url = data.publicUrl
        }
      }

      await supabase.from('journals').insert({
        user_id: user.id,
        title: title || null,
        content,
        mood,
        image_url
      })

      setIsModalOpen(false)
      setTitle("")
      setContent("")
      setMood("😌")
      setImageFile(null)
      setImagePreview(null)
      fetchJournals()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Hapus jurnal ini?")) return
    
    await supabase.from("journals").delete().eq("id", id)
    fetchJournals()
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6 font-serif">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/report/dashboard')}
          className="flex items-center gap-2 text-[#4A9B8E] mb-6 hover:opacity-70 transition font-sans"
        >
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Jurnalku 📖</h1>
            <p className="text-[#C9847A]">Ruang pribadimu untuk mengekspresikan diri</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4A9B8E] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#3d8377] transition shadow-sm"
          >
            <Plus size={20} />
            <span className="hidden sm:inline font-sans font-medium">Tulis Hari Ini</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A9B8E]"></div>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-[#C9847A]/20">
            <p className="text-6xl mb-4">✍️</p>
            <p className="text-[#2D3748]">Belum ada jurnal yang ditulis.</p>
            <p className="text-sm text-gray-500 mt-2">Mulai cerita pertamamu hari ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={journal.id}
                className="bg-[#FDF6EC] border border-[#C9847A]/30 p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer group relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-4xl">{journal.mood}</span>
                  <button 
                    onClick={(e) => handleDelete(journal.id, e)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2 font-sans">
                  {new Date(journal.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                {journal.title && <h3 className="font-bold text-[#2D3748] mb-2">{journal.title}</h3>}
                <p className="text-[#2D3748]/80 text-sm line-clamp-3 mb-3">{journal.content}</p>
                {journal.image_url && (
                  <div className="relative h-24 w-full rounded-xl overflow-hidden mt-3">
                    <Image src={journal.image_url} alt="Journal image" fill className="object-cover" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#FDF6EC] w-full max-w-lg rounded-3xl shadow-xl border border-[#C9847A]/20 overflow-hidden relative z-10"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2D3748]">Tulis Jurnal Baru</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">Bagaimana perasaanmu?</label>
                      <div className="flex gap-2">
                        {emojis.map(e => (
                          <button
                            type="button"
                            key={e}
                            onClick={() => setMood(e)}
                            className={`text-3xl p-2 rounded-xl transition ${mood === e ? 'bg-[#C9847A]/20 scale-110' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Judul (opsional)"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-white/50 border border-[#C9847A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A9B8E] transition"
                    />

                    <textarea
                      required
                      rows={5}
                      placeholder="Tuliskan ceritamu hari ini..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full bg-white/50 border border-[#C9847A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A9B8E] transition resize-none"
                    />

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer w-fit text-[#4A9B8E] hover:opacity-70 transition bg-white/50 px-4 py-2 rounded-xl border border-[#4A9B8E]/30">
                        <ImageIcon size={20} />
                        <span className="text-sm font-medium">Tambah Foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                      {imagePreview && (
                        <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                          <button 
                            type="button" 
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 rounded-xl font-medium text-[#2D3748] bg-white border border-gray-200 hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !content}
                        className="flex-1 py-3 rounded-xl font-medium text-white bg-[#4A9B8E] hover:bg-[#3d8377] transition disabled:opacity-50"
                      >
                        {isSubmitting ? "Menyimpan..." : "Simpan Jurnal"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
