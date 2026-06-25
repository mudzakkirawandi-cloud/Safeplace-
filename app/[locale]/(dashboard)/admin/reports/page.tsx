'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, CheckSquare, Square, Eye } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

interface Report {
  id: string
  tracking_code: string
  incident_type: string
  status: string
  priority: string
  emergency: boolean
  created_at: string
  escalated_to: string | null
  assigned_consultant_id: string | null
  assigned_satgas_id: string | null
}

export default function AdminReportsPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('id, tracking_code, incident_type, status, priority, emergency, created_at, escalated_to, assigned_consultant_id, assigned_satgas_id')
      .order('created_at', { ascending: false })
    if (data) setReports(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`admin-reports-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => {
        fetchReports()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchReports])

  const filtered = reports.filter(r => {
    const matchSearch = r.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
      r.incident_type?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchPriority = filterPriority === 'all' || r.priority === filterPriority ||
      (filterPriority === 'urgent' && r.emergency)
    return matchSearch && matchStatus && matchPriority
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const getPriorityBadge = (report: Report) => {
    if (report.emergency) return { label: 'Darurat', className: 'bg-red-100 text-red-700' }
    switch (report.priority) {
      case 'urgent': return { label: 'Urgent', className: 'bg-red-100 text-red-700' }
      case 'high': return { label: 'Tinggi', className: 'bg-orange-100 text-orange-700' }
      case 'normal': return { label: 'Normal', className: 'bg-green-100 text-green-700' }
      default: return { label: report.priority || 'Normal', className: 'bg-gray-100 text-gray-700' }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received': return { label: 'Diterima', className: 'bg-yellow-100 text-yellow-700' }
      case 'under_review': return { label: 'Ditinjau', className: 'bg-blue-100 text-blue-700' }
      case 'in_consultation': return { label: 'Konsultasi Aktif', className: 'bg-green-100 text-green-700' }
      case 'escalated': return { label: 'Diekskalasi', className: 'bg-purple-100 text-purple-700' }
      case 'resolved': return { label: 'Selesai', className: 'bg-gray-100 text-gray-600' }
      case 'closed': return { label: 'Ditutup', className: 'bg-gray-100 text-gray-500' }
      default: return { label: status, className: 'bg-gray-100 text-gray-600' }
    }
  }

  const getIntentLabel = (report: Report) => {
    if (report.escalated_to === 'satgas' || report.escalated_to === 'both') return 'Satgas'
    if (report.escalated_to === 'consultant') return 'Konsultasi'
    if (report.assigned_consultant_id) return 'Konsultasi'
    if (report.assigned_satgas_id) return 'Satgas'
    return 'Pendampingan'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Laporan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total {reports.length} laporan masuk
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode laporan..."
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="received">Diterima</option>
          <option value="under_review">Ditinjau</option>
          <option value="in_consultation">Konsultasi Aktif</option>
          <option value="escalated">Diekskalasi</option>
          <option value="resolved">Selesai</option>
          <option value="closed">Ditutup</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm outline-none"
        >
          <option value="all">Semua Prioritas</option>
          <option value="urgent">Urgent</option>
          <option value="high">Tinggi</option>
          <option value="normal">Normal</option>
        </select>
        <button className="p-2 border border-border rounded-lg hover:bg-muted text-muted-foreground">
          <Filter size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 w-12">
                  <button onClick={() => setSelected(
                    selected.length === filtered.length ? [] : filtered.map(r => r.id)
                  )}>
                    {selected.length === filtered.length && filtered.length > 0
                      ? <CheckSquare size={16} className="text-[#4ECDC4]" />
                      : <Square size={16} />}
                  </button>
                </th>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Intent</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    Tidak ada laporan ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map(report => {
                  const priority = getPriorityBadge(report)
                  const status = getStatusBadge(report.status)
                  return (
                    <tr key={report.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelect(report.id)}>
                          {selected.includes(report.id)
                            ? <CheckSquare size={16} className="text-[#4ECDC4]" />
                            : <Square size={16} className="text-gray-300" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-primary">
                        {report.tracking_code}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-card-foreground">
                        {report.incident_type?.replace(/_/g, ' ') || '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {getIntentLabel(report)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.className}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/${params.locale}/admin/reports/${report.id}`)}
                          className="p-1 hover:bg-gray-200 rounded text-muted-foreground"
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
