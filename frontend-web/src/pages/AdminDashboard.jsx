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
const paidRevenueStatuses = new Set(['CONFIRMED', 'CHECKED_IN', 'COMPLETED']);

/**
 * 1. Bookings Management Component (Updated for Real Data)
 */

 

const statusMeta = {
  CONFIRMED: { label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CHECKED_IN: { label: 'Đã check-in', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const supportStatusMeta = {
  OPEN: { label: 'Mới', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  RESOLVED: { label: 'Đã xử lý', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const workflowDecisionMeta = {
  ELIGIBLE: { label: 'Đủ điều kiện', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  INELIGIBLE: { label: 'Không đủ điều kiện', className: 'border-rose-200 bg-rose-50 text-rose-800' },
  MANUAL_REVIEW: { label: 'Cần kiểm tra thủ công', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  MISSING_BOOKING: { label: 'Chưa xác định đặt chỗ', className: 'border-slate-200 bg-slate-50 text-slate-700' },
};

const supportCategoryLabels = {
  change: 'Đổi lịch bay',
  refund: 'Hoàn hoặc hủy vé',
  payment: 'Thanh toán',
  baggage: 'Hành lý',
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

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
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
    .filter((item) => paidRevenueStatuses.has(item.status))
    .forEach((item) => {
      const key = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Không rõ';
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
            <h2 className="text-base font-black text-slate-950">Quản lý đặt vé</h2>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} / {bookings.length} lượt đặt chỗ</p>
        </div>
        <label className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm PNR, khách hàng, email..."
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">PNR</th>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">Chuyến bay</th>
              <th className="px-5 py-3">Ngày đặt</th>
              <th className="px-5 py-3 text-right">Tổng tiền</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
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
                    {`${item.flight?.departureAirport || '-'} → ${item.flight?.arrivalAirport || '-'}`}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{dateText(item.createdAt)}</td>
                <td className="px-5 py-4 text-right font-black text-slate-950">{money(item.totalPriceVnd)}</td>
                <td className="px-5 py-4 text-center"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

      
      </div>

      {filtered.length === 0 ? (
        <div className="border-t border-slate-100 px-5 py-12 text-center text-sm text-slate-500">
          Không có lượt đặt chỗ phù hợp.
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
          <h2 className="text-base font-black text-slate-950">Doanh thu theo ngày</h2>
          <p className="mt-1 text-sm text-slate-500">Tính từ các lượt đặt chỗ không bị hủy</p>
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
        <h2 className="text-base font-black text-slate-950">Trạng thái đặt chỗ</h2>
        <div className="mt-5 space-y-3">
          {['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'REFUND_PENDING', 'CANCELLED', 'EXPIRED'].map((status) => (
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
      toast.success(`Đã cập nhật ${ticket.code}`);
    } finally {
      setSavingId(null);
    }
  };

  const useWorkflowReply = (ticket, includeSteps) => {
    const workflow = ticket.workflow;
    if (!workflow) return;
    const decisionText = {
      ELIGIBLE: 'Yêu cầu của bạn đủ điều kiện xử lý.',
      INELIGIBLE: 'Yêu cầu của bạn hiện chưa đủ điều kiện xử lý.',
      MANUAL_REVIEW: 'Yêu cầu của bạn cần được kiểm tra thủ công.',
      MISSING_BOOKING: 'Chúng tôi chưa xác định được booking liên quan.',
    }[workflow.decision] || 'Yêu cầu của bạn đang được kiểm tra.';
    const reply = includeSteps
      ? workflow.suggestedReply
      : `${decisionText} ${workflow.reason}`;
    setDraft(ticket, 'adminReply', reply);
    setDraft(ticket, 'status', workflow.decision === 'MANUAL_REVIEW' ? 'IN_PROGRESS' : 'RESOLVED');
  };

  const statusCounts = summary.byStatus || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tổng yêu cầu" value={Number(summary.total || 0).toLocaleString('vi-VN')} icon={FiMessageSquare} tone="bg-sky-50 text-sky-700" />
        <StatCard label="Mới" value={Number(summary.open || 0).toLocaleString('vi-VN')} icon={FiClock} tone="bg-amber-50 text-amber-700" />
        <StatCard label="Đang xử lý" value={Number(summary.inProgress || 0).toLocaleString('vi-VN')} icon={FiActivity} tone="bg-indigo-50 text-indigo-700" />
        <StatCard label="Đã xử lý" value={Number((summary.resolved || 0) + (summary.closed || 0)).toLocaleString('vi-VN')} icon={FiCheckCircle} tone="bg-emerald-50 text-emerald-700" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Yêu cầu hỗ trợ</h2>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} / {tickets.length} ticket</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm mã, email, PNR, nội dung..."
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Mới ({statusCounts.OPEN || 0})</option>
              <option value="IN_PROGRESS">Đang xử lý ({statusCounts.IN_PROGRESS || 0})</option>
              <option value="RESOLVED">Đã xử lý ({statusCounts.RESOLVED || 0})</option>
              <option value="CLOSED">Đã đóng ({statusCounts.CLOSED || 0})</option>
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
                    {supportCategoryLabels[ticket.category] || 'Hỗ trợ chung'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="font-bold text-slate-900">Khách hàng:</span> {ticket.userName || '-'}
                    <div className="mt-1 text-xs text-slate-500">{ticket.userEmail || '-'}</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">PNR:</span> {ticket.pnr || '-'}
                    <div className="mt-1 text-xs text-slate-500">Mã đặt chỗ: {ticket.bookingId || '-'}</div>
                  </div>
                  <div><span className="font-bold text-slate-900">Tạo lúc:</span> {dateText(ticket.createdAt)}</div>
                  <div><span className="font-bold text-slate-900">Cập nhật:</span> {dateText(ticket.updatedAt)}</div>
                </div>
                <div className="mt-4 rounded-md bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Nội dung khách gửi</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{ticket.message}</p>
                </div>
                {ticket.workflow ? (
                  <div className={`mt-3 rounded-md border p-4 ${workflowDecisionMeta[ticket.workflow.decision]?.className || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-black uppercase tracking-wide">Đánh giá tự động</div>
                      <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black">
                        {workflowDecisionMeta[ticket.workflow.decision]?.label || ticket.workflow.decision}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold">{ticket.workflow.reason}</p>
                    <p className="mt-1 text-xs">Trạng thái đặt chỗ: {ticket.workflow.bookingStatus || 'Không xác định'}</p>
                    {ticket.workflow.steps?.length ? (
                      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                        {ticket.workflow.steps.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => useWorkflowReply(ticket, true)}
                        className="rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                      >
                        Dùng kết luận và hướng dẫn
                      </button>
                      <button
                        type="button"
                        onClick={() => useWorkflowReply(ticket, false)}
                        className="rounded-md border border-current bg-white/70 px-3 py-2 text-xs font-black"
                      >
                        Chỉ gửi kết luận
                      </button>
                    </div>
                  </div>
                ) : null}
                {ticket.adminReply ? (
                  <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Phản hồi hiện tại</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-950">{ticket.adminReply}</p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái xử lý</label>
                <select
                  value={valueFor(ticket, 'status') || 'OPEN'}
                  onChange={(event) => setDraft(ticket, 'status', event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="OPEN">Mới</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESOLVED">Đã xử lý</option>
                  <option value="CLOSED">Đã đóng</option>
                </select>

                <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Phản hồi quản trị viên</label>
                <textarea
                  value={valueFor(ticket, 'adminReply')}
                  onChange={(event) => setDraft(ticket, 'adminReply', event.target.value)}
                  rows={5}
                  maxLength={1200}
                  placeholder="Nhập hướng xử lý, ghi chú nội bộ hoặc phản hồi gửi khách..."
                  className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

                <button
                  type="button"
                  onClick={() => void saveTicket(ticket)}
                  disabled={savingId === ticket.id}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-black text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <FiSend size={16} />
                  {savingId === ticket.id ? 'Đang lưu...' : 'Lưu xử lý'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-slate-100 px-5 py-12 text-center text-sm text-slate-500">
            Không có yêu cầu hỗ trợ phù hợp.
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
      const message = err.response?.data?.message || err.message || 'Không thể tải dữ liệu quản trị.';
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

    
 

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    {
      label: 'Tổng doanh thu',
      value: money(summary.totalRevenueVnd),
      icon: FiDollarSign,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Tổng đặt chỗ',
      value: Number(summary.totalBookings || 0).toLocaleString('vi-VN'),
      icon: FiTag,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Đã thanh toán',
      value: Number(summary.confirmed || 0).toLocaleString('vi-VN'),
      icon: FiCheckCircle,
      tone: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Chờ thanh toán',
      value: Number(summary.pendingPayment || 0).toLocaleString('vi-VN'),
      icon: FiClock,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Yêu cầu hỗ trợ',
      value: Number(supportSummary.total || 0).toLocaleString('vi-VN'),
      icon: FiMessageSquare,
      tone: 'bg-rose-50 text-rose-700',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: FiHome },
    { id: 'bookings', label: 'Quản lý đặt vé', icon: FiBook },
    { id: 'support', label: 'Hỗ trợ khách hàng', icon: FiMessageSquare },
    { id: 'analytics', label: 'Thống kê', icon: FiBarChart2 },
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
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Trang quản trị</div>
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
            <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-sky-300">Quản trị viên</div>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h1 className="text-2xl font-black">Quản trị hệ thống</h1>
            <p className="mt-1 text-sm text-slate-500">Dữ liệu trực tiếp từ cơ sở dữ liệu máy chủ</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <FiRefreshCcw size={16} />
            Tải lại
          </button>
        </header>

        <div className="space-y-6 p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
              <div className="flex items-center gap-2 font-black"><FiXCircle /> Không thể tải dữ liệu quản trị</div>
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
