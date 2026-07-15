import { useState, useEffect } from 'react';
import { supabase, type Reservation } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { BarChart3, Download } from 'lucide-react';

export function ReportsManager() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async () => {
    setLoading(true);
    let query = supabase.from('reservations').select('*');
    if (startDate) query = query.gte('reservation_date', startDate);
    if (endDate) query = query.lte('reservation_date', endDate);
    
    const { data: resData } = await query.order('reservation_date', { ascending: true });
    setData((resData as Reservation[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    // Default to this month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  useEffect(() => {
    if (startDate && endDate) load();
  }, [startDate, endDate]);

  const exportPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    const opt = {
      margin:       0.5,
      filename:     `Thong-Ke-MinhCoffee-${startDate}-den-${endDate}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const total = data.length;
  const completed = data.filter(r => r.status === 'COMPLETED').length;
  const cancelled = data.filter(r => r.status === 'CANCELLED').length;
  const pending = data.filter(r => r.status === 'PENDING').length;

  // Chart data formatting
  const chartDataMap: Record<string, number> = {};
  data.forEach(r => {
    if (!chartDataMap[r.reservation_date]) chartDataMap[r.reservation_date] = 0;
    chartDataMap[r.reservation_date]++;
  });
  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    'Số lượng đơn': chartDataMap[date]
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="font-serif text-coffee text-3xl font-medium flex items-center gap-3">
          <BarChart3 /> Báo cáo thống kê
        </h2>
        <button onClick={exportPDF} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Xuất PDF
        </button>
      </div>

      <div className="paper-note p-6 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-xs uppercase font-semibold text-coffee mb-1">Từ ngày</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="block text-xs uppercase font-semibold text-coffee mb-1">Đến ngày</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" />
        </div>
      </div>

      {loading ? <p className="text-muted">Đang phân tích dữ liệu...</p> : (
        <div id="report-content" className="bg-cream-warm p-4 rounded-md">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl text-coffee">Báo cáo tình hình đặt bàn</h1>
            <p className="text-muted">Từ {startDate} đến {endDate}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-coffee/10 text-center">
              <p className="text-xs uppercase text-muted font-semibold">Tổng đơn</p>
              <p className="text-3xl font-serif text-coffee mt-1">{total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-olive/20 text-center">
              <p className="text-xs uppercase text-muted font-semibold">Hoàn thành</p>
              <p className="text-3xl font-serif text-olive mt-1">{completed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-orange/20 text-center">
              <p className="text-xs uppercase text-muted font-semibold">Chờ xử lý</p>
              <p className="text-3xl font-serif text-orange mt-1">{pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-error/20 text-center">
              <p className="text-xs uppercase text-muted font-semibold">Đã hủy</p>
              <p className="text-3xl font-serif text-error mt-1">{cancelled}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-coffee/10">
            <h3 className="font-serif text-coffee text-xl mb-6">Biểu đồ số lượng đơn theo ngày</h3>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="Số lượng đơn" fill="#c48a5c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">Không có dữ liệu trong khoảng thời gian này</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
