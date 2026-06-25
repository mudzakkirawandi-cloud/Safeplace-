'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ChevronRight } from 'lucide-react'

interface Report {
  id: string
  tracking_code: string
  incident_type: string
  status: string
  priority: string
  emergency: boolean
  created_at: string
  updated_at: string
}

export default function CasesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [cases, setCases] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchCases = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('reports')
      .select('id, tracking_code, incident_type, status, priority, emergency, created_at, updated_at')
      .eq('assigned_consultant_id', uid)
      .order('updated_at', { ascending: false })
    if (data) setCases(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await fetchCases(user.id)
    }
    init()
  }, [supabase, fetchCases])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`consultant-cases-${userId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports',
        filter: `assigned_consultant_id=eq.${userId}`
      }, () => fetchCases(userId))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase, fetchCases])

  const FILTER_TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'in_consultation', label: 'Aktif' },
    { key: 'under_review', label: 'Ditinjau' },
    { key: 'resolved', label: 'Selesai' },
  ]

  const filtered = cases.filter(c => {
    const matchFilter = activeFilter === 'all' || c.status === activeFilter
    const matchSearch =
      c.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
      c.incident_type?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const getPriorityConfig = (report: Report) => {
    if (report.emergency) return { label: 'Darurat', className: 'bg-red-100 text-red-700' }
    switch (report.priority) {
      case 'urgent': return { label: 'Urgent', className: 'bg-red-100 text-red-700' }
      case 'high': return { label: 'Tinggi', className: 'bg-orange-100 text-orange-700' }
      default: return { label: 'Normal', className: 'bg-yellow-100 text-yellow-700' }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'received': return { label: 'Diterima', className: 'bg-yellow-100 text-yellow-700' }
      case 'under_review': return { label: 'Ditinjau', className: 'bg-blue-100 text-blue-700' }
      case 'in_consultation': return { label: 'Konsultasi Aktif', className: 'bg-[#EAF3EE] text-primary' }
      case 'escalated': return { label: 'Diekskalasi', className: 'bg-purple-100 text-purple-700' }
      case 'resolved': return { label: 'Selesai', className: 'bg-gray-100 text-muted-foreground' }
      case 'closed': return { label: 'Ditutup', className: 'bg-gray-100 text-gray-500' }
      default: return { label: status, className: 'bg-gray-100 text-gray-600' }
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} menit lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">Kasus Saya</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Semua kasus yang ditugaskan kepadamu
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau jenis kasus..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeFilter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({cases.filter(c => tab.key === 'all' || c.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-300 text-sm">Tidak ada kasus ditemukan.</div>
        ) : (
          filtered.map((c, i) => {
            const priority = getPriorityConfig(c)
            const status = getStatusConfig(c.status)
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/consultant/cases/${c.id}`)}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left hover:shadow-sm hover:border-[#5B8A6F]/30 transition group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono font-bold text-primary">#{c.tracking_code}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {c.incident_type?.replace(/_/g, ' ') || '-'}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(c.updated_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-primary flex-shrink-0" />
                </div>
              </motion.button>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
