import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { api } from '../services/api';
import {
  FiActivity,
  FiAirplay,
  FiBarChart2,
  FiBook,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiHome,
  FiMessageSquare,
  FiRefreshCcw,
  FiSearch,
  FiSend,
  FiTag,
  FiXCircle,

import { Navigate, useNavigate } from 'react-router-dom';
import api, { bookingApi } from '../services/api';
import { 
  FiHome, FiAirplay, FiBook, FiBarChart2, FiSettings, FiSearch, FiBell, FiUser, FiDollarSign, FiTag, FiActivity, FiClock,
  FiMoreVertical, FiCheckCircle, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, FiFilter, FiCheck, FiTrendingDown, FiTrendingUp,
  FiDownload, FiCalendar, FiSliders, FiArrowRight

} from 'react-icons/fi';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'react-toastify';

 
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VND`;
const dateText = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '-');

/**
 * 1. Bookings Management Component (Updated for Real Data)
 */
function BookingsManagement({ bookings, stats }) {
  const [searchTerm, setSearchParams] = useState('');
  
  const filtered = useMemo(() => 
    bookings.filter(b => 
      b.pnr.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.passengerPhone && b.passengerPhone.includes(searchTerm)) ||
      (b.flight?.flightNumber && b.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [bookings, searchTerm]
  );
 

const statusMeta = {
  CONFIRMED: { label: 'Da thanh toan', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING_PAYMENT: { label: 'Cho thanh toan', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CHECKED_IN: { label: 'Da check-in', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  COMPLETED: { label: 'Hoan thanh', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'Da huy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const supportStatusMeta = {
  OPEN: { label: 'Moi', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  IN_PROGRESS: { label: 'Dang xu ly', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  RESOLVED: { label: 'Da xu ly', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Da dong', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

function StatusBadge({ status }) {
  const meta = statusMeta[status] || { label: status || '-', className: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function SupportStatusBadge({ status }) {
  const meta = supportStatusMeta[status] || { label: status || '-', className: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function buildDailyRevenue(bookings) {
  const byDate = new Map();
  bookings
    .filter((item) => item.status !== 'CANCELLED')
    .forEach((item) => {
      const key = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Khong ro';
      byDate.set(key, (byDate.get(key) || 0) + Number(item.totalPriceVnd || 0));
    });

  return Array.from(byDate.entries())
    .slice(-10)
    .map(([date, revenue]) => ({ date, revenue }));
}

function BookingsTable({ bookings }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((item) =>
      [item.pnr, item.passengerName, item.userEmail, item.flight?.flightNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [bookings, searchTerm]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950">Quan ly dat ve</h2>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} / {bookings.length} booking</p>
        </div>
        <label className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim PNR, khach hang, email..."
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">PNR</th>
              <th className="px-5 py-3">Khach hang</th>
              <th className="px-5 py-3">Chuyen bay</th>
              <th className="px-5 py-3">Ngay dat</th>
              <th className="px-5 py-3 text-right">Tong tien</th>
              <th className="px-5 py-3 text-center">Trang thai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-mono font-black text-sky-700">#{item.pnr}</td>
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900">{item.passengerName}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.userEmail || item.passengerEmail || '-'}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800">{item.flight?.flightNumber || '-'}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {`${item.flight?.departureAirport || '-'} -> ${item.flight?.arrivalAirport || '-'}`}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{dateText(item.createdAt)}</td>
                <td className="px-5 py-4 text-right font-black text-slate-950">{money(item.totalPriceVnd)}</td>
                <td className="px-5 py-4 text-center"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
=======
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Hệ thống đặt vé</h3>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Tìm PNR, tên khách, SĐT hoặc chuyến bay..." 
              value={searchTerm}
              onChange={e => setSearchParams(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-80 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50 bg-white">
                <th className="px-10 py-6">STT</th>
                <th className="px-6 py-6">Mã Đặt Vé (PNR)</th>
                <th className="px-6 py-6">Khách hàng</th>
                <th className="px-6 py-6">Số điện thoại</th>
                <th className="px-6 py-6">Chuyến bay</th>
                <th className="px-6 py-6">Ghế chọn</th>
                <th className="px-6 py-6 text-right">Tổng tiền</th>
                <th className="px-6 py-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filtered.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6 text-sm font-medium text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-6 font-mono text-sm font-black text-sky-600 uppercase tracking-tighter">#{item.pnr}</td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 leading-tight">{item.passengerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">{item.passengerEmail || item.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-slate-600 font-medium">{item.passengerPhone || '—'}</td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 leading-none">{item.flight?.flightNumber || '—'}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.flight?.departureAirport} → {item.flight?.arrivalAirport}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-700">{item.seatNumber || 'Auto'}</td>
                  <td className="px-6 py-6 text-sm font-black text-slate-900 tabular-nums text-right">{item.totalPriceVnd?.toLocaleString()}₫</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      item.status === 'CONFIRMED' || item.status === 'CHECKED_IN' || item.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : item.status === 'PENDING_PAYMENT'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {item.status === 'CONFIRMED' || item.status === 'CHECKED_IN' || item.status === 'COMPLETED' ? 'Đã thanh toán' :
                       item.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' : 'Đã hủy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
              <div className="p-32 text-center text-slate-400 italic font-medium bg-white">
                 <FiBook size={48} className="mx-auto mb-4 opacity-5" />
                 Không tìm thấy dữ liệu đặt vé phù hợp.
              </div>
          )}
        </div>

      </div>

      {filtered.length === 0 ? (
        <div className="border-t border-slate-100 px-5 py-12 text-center text-sm text-slate-500">
          Khong co booking phu hop.
        </div>
      ) : null}
    </section>
  );
}

function AnalyticsPanel({ bookings, summary }) {
  const chartData = useMemo(() => buildDailyRevenue(bookings), [bookings]);
  const byStatus = summary.byStatus || {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Doanh thu theo ngay</h2>
            <p className="mt-1 text-sm text-slate-500">Tinh tu cac booking khong bi huy</p>
          </div>
          <FiBarChart2 className="text-sky-600" size={22} />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} />
              <Tooltip formatter={(value) => money(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-black text-slate-950">Trang thai booking</h2>
        <div className="mt-5 space-y-3">
          {['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((status) => (
            <div key={status} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <StatusBadge status={status} />
              <span className="font-black text-slate-900">{byStatus[status] || 0}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SupportTicketsPanel({ tickets, summary, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesSearch = !q || [ticket.code, ticket.userEmail, ticket.userName, ticket.pnr, ticket.category, ticket.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [tickets, searchTerm, statusFilter]);

  const valueFor = (ticket, key) => drafts[ticket.id]?.[key] ?? ticket[key] ?? '';

  const setDraft = (ticket, key, value) => {
    setDrafts((current) => ({
      ...current,
      [ticket.id]: {
        status: ticket.status,
        adminReply: ticket.adminReply || '',
        ...current[ticket.id],
        [key]: value,
      },
    }));
  };

  const saveTicket = async (ticket) => {
    const payload = {
      status: valueFor(ticket, 'status') || 'OPEN',
      adminReply: valueFor(ticket, 'adminReply'),
    };
    setSavingId(ticket.id);
    try {
      await onUpdate(ticket.id, payload);
      setDrafts((current) => {
        const next = { ...current };
        delete next[ticket.id];
        return next;
      });
      toast.success(`Da cap nhat ${ticket.code}`);
    } finally {
      setSavingId(null);
    }
  };

  const statusCounts = summary.byStatus || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tong yeu cau" value={Number(summary.total || 0).toLocaleString('vi-VN')} hint="Tu mobile va web" icon={FiMessageSquare} tone="bg-sky-50 text-sky-700" />
        <StatCard label="Moi" value={Number(summary.open || 0).toLocaleString('vi-VN')} hint="Can tiep nhan" icon={FiClock} tone="bg-amber-50 text-amber-700" />
        <StatCard label="Dang xu ly" value={Number(summary.inProgress || 0).toLocaleString('vi-VN')} hint="Admin dang phan hoi" icon={FiActivity} tone="bg-indigo-50 text-indigo-700" />
        <StatCard label="Da xu ly" value={Number((summary.resolved || 0) + (summary.closed || 0)).toLocaleString('vi-VN')} hint="Resolved + Closed" icon={FiCheckCircle} tone="bg-emerald-50 text-emerald-700" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Yeu cau ho tro</h2>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} / {tickets.length} ticket</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tim ma, email, PNR, noi dung..."
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="ALL">Tat ca trang thai</option>
              <option value="OPEN">Moi ({statusCounts.OPEN || 0})</option>
              <option value="IN_PROGRESS">Dang xu ly ({statusCounts.IN_PROGRESS || 0})</option>
              <option value="RESOLVED">Da xu ly ({statusCounts.RESOLVED || 0})</option>
              <option value="CLOSED">Da dong ({statusCounts.CLOSED || 0})</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((ticket) => (
            <article key={ticket.id} className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-black text-sky-700">#{ticket.code}</span>
                  <SupportStatusBadge status={ticket.status} />
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {ticket.category || 'general'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="font-bold text-slate-900">Khach hang:</span> {ticket.userName || '-'}
                    <div className="mt-1 text-xs text-slate-500">{ticket.userEmail || '-'}</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">PNR:</span> {ticket.pnr || '-'}
                    <div className="mt-1 text-xs text-slate-500">Booking ID: {ticket.bookingId || '-'}</div>
                  </div>
                  <div><span className="font-bold text-slate-900">Tao luc:</span> {dateText(ticket.createdAt)}</div>
                  <div><span className="font-bold text-slate-900">Cap nhat:</span> {dateText(ticket.updatedAt)}</div>
                </div>
                <div className="mt-4 rounded-md bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Noi dung khach gui</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{ticket.message}</p>
                </div>
                {ticket.adminReply ? (
                  <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Phan hoi hien tai</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-950">{ticket.adminReply}</p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Trang thai xu ly</label>
                <select
                  value={valueFor(ticket, 'status') || 'OPEN'}
                  onChange={(event) => setDraft(ticket, 'status', event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="OPEN">Moi</option>
                  <option value="IN_PROGRESS">Dang xu ly</option>
                  <option value="RESOLVED">Da xu ly</option>
                  <option value="CLOSED">Da dong</option>
                </select>

                <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Phan hoi admin</label>
                <textarea
                  value={valueFor(ticket, 'adminReply')}
                  onChange={(event) => setDraft(ticket, 'adminReply', event.target.value)}
                  rows={5}
                  maxLength={1200}
                  placeholder="Nhap huong xu ly, ghi chu noi bo, hoac phan hoi gui khach..."
                  className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

                <button
                  type="button"
                  onClick={() => void saveTicket(ticket)}
                  disabled={savingId === ticket.id}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-black text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <FiSend size={16} />
                  {savingId === ticket.id ? 'Dang luu...' : 'Luu xu ly'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-slate-100 px-5 py-12 text-center text-sm text-slate-500">
            Khong co yeu cau ho tro phu hop.
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({});
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportSummary, setSupportSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, summaryRes, supportRes, supportSummaryRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/bookings/summary'),
        api.get('/admin/support-tickets'),
        api.get('/admin/support-tickets/summary'),
      ]);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setSummary(summaryRes.data || {});
      setSupportTickets(Array.isArray(supportRes.data) ? supportRes.data : []);
      setSupportSummary(supportSummaryRes.data || {});
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Khong the lay du lieu admin.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateSupportTicket = async (ticketId, payload) => {
    const { data } = await api.put(`/admin/support-tickets/${ticketId}`, payload);
    setSupportTickets((current) => current.map((ticket) => (ticket.id === ticketId ? data : ticket)));
    const { data: nextSummary } = await api.get('/admin/support-tickets/summary');
    setSupportSummary(nextSummary || {});
  };

  useEffect(() => {

    if (user?.role === 'ADMIN') {
      void fetchData();
    }
  }, [user?.role]);

    const fetchData = async () => {
      try {
        const [bookingsRes, summaryRes] = await Promise.all([
            api.get('/admin/dashboard/bookings'),
            api.get('/admin/bookings/summary')
        ]);
        setBookings(bookingsRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error("Admin Dashboard fetch error:", err);
        toast.error("Không thể kết nối tới Server Admin.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);
 

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    {
      label: 'Tong doanh thu',
      value: money(summary.totalRevenueVnd),
      hint: `Hanh ly: ${money(summary.baggageRevenueVnd)}`,
      icon: FiDollarSign,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Tong booking',
      value: Number(summary.totalBookings || 0).toLocaleString('vi-VN'),
      hint: 'Tat ca don trong database',
      icon: FiTag,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Da thanh toan',
      value: Number(summary.confirmed || 0).toLocaleString('vi-VN'),
      hint: `${Number(summary.checkedIn || 0).toLocaleString('vi-VN')} da check-in`,
      icon: FiCheckCircle,
      tone: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Cho thanh toan',
      value: Number(summary.pendingPayment || 0).toLocaleString('vi-VN'),
      hint: `${Number(summary.cancelled || 0).toLocaleString('vi-VN')} da huy`,
      icon: FiClock,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Yeu cau ho tro',
      value: Number(supportSummary.total || 0).toLocaleString('vi-VN'),
      hint: `${Number(supportSummary.open || 0).toLocaleString('vi-VN')} yeu cau moi`,
      icon: FiMessageSquare,
      tone: 'bg-rose-50 text-rose-700',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'bookings', label: 'Quan ly dat ve', icon: FiBook },
    { id: 'support', label: 'Ho tro khach hang', icon: FiMessageSquare },
    { id: 'analytics', label: 'Thong ke', icon: FiBarChart2 },
  ];

  const recentBookings = bookings.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600">
              <FiAirplay size={22} />
            </div>
            <div>
              <div className="text-lg font-black">FlightBook</div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Admin Console</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                  active ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="text-sm font-black">{user.fullName || user.email}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-sky-300">Administrator</div>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h1 className="text-2xl font-black">Quan tri he thong</h1>
            <p className="mt-1 text-sm text-slate-500">Du lieu truc tiep tu database backend</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <FiRefreshCcw size={16} />
            Tai lai
          </button>
        </header>

        <div className="space-y-6 p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
              <div className="flex items-center gap-2 font-black"><FiXCircle /> Khong the lay du lieu admin</div>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {stats.map((item) => <StatCard key={item.label} {...item} />)}
              </div>

              {activeTab === 'dashboard' ? (
                <div className="space-y-6">
                  <AnalyticsPanel bookings={bookings} summary={summary} />
                  <BookingsTable bookings={recentBookings} />
                </div>
              ) : null}

              {activeTab === 'bookings' ? <BookingsTable bookings={bookings} /> : null}
              {activeTab === 'support' ? (
                <SupportTicketsPanel
                  tickets={supportTickets}
                  summary={supportSummary}
                  onUpdate={updateSupportTicket}
                />
              ) : null}
              {activeTab === 'analytics' ? <AnalyticsPanel bookings={bookings} summary={summary} /> : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
