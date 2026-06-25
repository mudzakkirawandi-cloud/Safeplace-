'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FolderOpen, FolderPlus, Clock, CheckCircle2, ChevronRight } from 'lucide-react'

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

export default function ConsultantDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [cases, setCases] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [newEscalationNotif, setNewEscalationNotif] = useState<string | null>(null)
  const [showEscalationPopup, setShowEscalationPopup] = useState(false)

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

  // Realtime
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`consultant-dashboard-${userId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports',
        filter: `assigned_consultant_id=eq.${userId}`
      }, () => fetchCases(userId))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase, fetchCases])

  useEffect(() => {
    if (!userId) return
    
    const channel = supabase
      .channel(`escalation-consultant-${userId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'escalation_notifications',
        filter: `to_user_id=eq.${userId}`
      }, (payload) => {
        const notif = payload.new as {
          report_id: string
          to_role: string
          status: string
        }
        if (notif.status === 'approved') {
          setNewEscalationNotif(notif.report_id)
          setShowEscalationPopup(true)
          setTimeout(() => setShowEscalationPopup(false), 8000)
        }
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const stats = [
    {
      key: 'active',
      label: 'Kasus Aktif',
      value: cases.filter(c => !['resolved', 'closed'].includes(c.status)).length,
      icon: FolderOpen,
      color: 'text-primary',
      bg: 'bg-[#EAF3EE]'
    },
    {
      key: 'new_today',
      label: 'Kasus Baru Hari Ini',
      value: cases.filter(c => {
        const today = new Date().toDateString()
        return new Date(c.created_at).toDateString() === today
      }).length,
      icon: FolderPlus,
      color: 'text-[#E8A87C]',
      bg: 'bg-[#FDF3EB]'
    },
    {
      key: 'waiting',
      label: 'Menunggu Responsmu',
      value: cases.filter(c => c.status === 'under_review').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      key: 'done',
      label: 'Selesai Minggu Ini',
      value: cases.filter(c => {
        if (c.status !== 'resolved') return false
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(c.updated_at) >= weekAgo
      }).length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ]

  const getPriorityConfig = (report: Report) => {
    if (report.emergency) return { label: 'Darurat', className: 'bg-red-100 text-red-700', pulse: true }
    switch (report.priority) {
      case 'urgent': return { label: 'Urgent', className: 'bg-red-100 text-red-700', pulse: true }
      case 'high': return { label: 'Tinggi', className: 'bg-orange-100 text-orange-700', pulse: false }
      default: return { label: 'Normal', className: 'bg-yellow-100 text-yellow-700', pulse: false }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Diterima'
      case 'under_review': return 'Ditinjau'
      case 'in_consultation': return 'Konsultasi Aktif'
      case 'escalated': return 'Diekskalasi'
      case 'resolved': return 'Selesai'
      default: return status
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

  const recentCases = cases.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">Selamat Datang 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Berikut ringkasan aktivitas kasus kamu hari ini.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-primary">Kasus Aktif</h2>
          <button
            onClick={() => router.push('/consultant/cases')}
            className="text-sm text-primary hover:underline font-medium"
          >
            Lihat semua →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Memuat data...</div>
        ) : recentCases.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Belum ada kasus yang ditugaskan.
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Prioritas</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Terakhir Update</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentCases.map(c => {
                  const priority = getPriorityConfig(c)
                  return (
                    <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-primary">
                        #{c.tracking_code}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {c.incident_type?.replace(/_/g, ' ') || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${priority.className}`}>
                          {priority.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {getStatusLabel(c.status)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {getTimeAgo(c.updated_at)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/consultant/cases/${c.id}`)}
                          className="flex items-center gap-1 text-primary hover:text-[#3d6b52] font-medium text-xs"
                        >
                          Buka <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {showEscalationPopup && newEscalationNotif && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4 z-50 max-w-sm border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                Kasus Dieskalasi ke Anda
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Menunggu persetujuan pelapor
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                router.push(`/consultant/cases`)
                setShowEscalationPopup(false)
              }}
              className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-xl hover:bg-blue-700 transition font-medium">
              Lihat Kasus
            </button>
            <button
              onClick={() => setShowEscalationPopup(false)}
              className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:bg-gray-50 transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
