import { useEffect, useState } from 'react';
import { supabase, type MenuItem, type Reservation, type Category, type ShopInfo, uploadImage } from '../lib/supabase';
import { CoffeeRing } from './CoffeeRing';
import { LogOut, Plus, Trash2, Pencil, X, Check, Clock, XCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

type Tab = 'reservations' | 'menu' | 'categories' | 'shop';

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('reservations');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin();
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (sess) await checkAdmin();
        else { setIsAdmin(false); setLoading(false); }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async () => {
    const { data } = await supabase.from('admins').select('user_id').maybeSingle();
    setIsAdmin(!!data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-warm">
        <p className="text-muted">Đang tải...</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <AdminLogin hasSession={!!session} />;
  }

  return (
    <div className="min-h-screen bg-cream-warm">
      <AdminHeader onSignOut={async () => { await supabase.auth.signOut(); }} tab={tab} setTab={setTab} />
      <main className="mx-auto max-w-site px-5 md:px-8 py-10">
        {tab === 'reservations' && <ReservationManager />}
        {tab === 'menu' && <MenuManager />}
        {tab === 'categories' && <CategoryManager />}
        {tab === 'shop' && <ShopManager />}
      </main>
    </div>
  );
}

// ---------- Admin Header ----------
function AdminHeader({ onSignOut, tab, setTab }: { onSignOut: () => void; tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { k: Tab; l: string }[] = [
    { k: 'reservations', l: 'Đặt bàn' },
    { k: 'menu', l: 'Menu' },
    { k: 'categories', l: 'Danh mục' },
    { k: 'shop', l: 'Thông tin' },
  ];
  return (
    <header className="bg-coffee text-cream-warm">
      <div className="mx-auto max-w-site px-5 md:px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex items-center justify-center w-8 h-8">
            <span className="absolute inset-0 rounded-full border-2 border-cream-warm rotate-[-8deg] opacity-70" />
            <span className="font-serif text-cream-warm text-sm font-semibold relative">M</span>
          </span>
          <span className="font-serif text-lg font-semibold hidden sm:inline-block">
            Cà phê <span className="font-hand text-orange text-xl">Minh</span>
            <span className="text-cream-warm/50 text-sm font-sans ml-2">— Quản trị</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1 mr-2 bg-coffee-light/20 p-1 rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  tab === t.k ? 'bg-orange text-cream-warm font-medium' : 'text-cream-warm/70 hover:text-cream-warm'
                }`}
              >
                {t.l}
              </button>
            ))}
          </nav>
          <a href="#top" className="text-cream-warm/60 hover:text-orange text-sm px-2 transition-colors">
            Xem trang
          </a>
          <button onClick={onSignOut} className="inline-flex items-center gap-1.5 text-cream-warm/70 hover:text-orange text-sm px-2 transition-colors">
            <LogOut size={15} /> <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------- Admin Login ----------
function AdminLogin({ hasSession }: { hasSession: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) showToast(error.message.includes('Invalid login') ? 'Email hoặc mật khẩu không đúng.' : error.message, 'error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-warm px-5 relative overflow-hidden">
      <CoffeeRing size={400} className="absolute -top-20 -right-20 text-coffee" opacity={0.05} />
      <CoffeeRing size={200} className="absolute -bottom-10 -left-10 text-orange" opacity={0.06} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-coffee text-2xl font-medium">Đăng nhập Quản trị</h1>
        </div>

        {hasSession && (
          <div className="paper-note p-4 mb-4 text-center rotate-[-1deg]">
            <p className="font-hand text-coffee text-sm">
              Tài khoản của bạn không có quyền quản trị.
            </p>
          </div>
        )}

        <div className="paper-note p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
              <span>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------- Reservation Manager ----------
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', icon: Clock, color: 'text-orange', bg: 'bg-orange/10' },
  CONFIRMED: { label: 'Đã xác nhận', icon: Check, color: 'text-success', bg: 'bg-success/10' },
  CANCELLED: { label: 'Đã hủy', icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
  COMPLETED: { label: 'Đã hoàn thành', icon: CheckCircle2, color: 'text-olive', bg: 'bg-olive/10' },
} as const;

function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const { showToast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    setReservations((data as Reservation[]) || []);
    setLoading(false);
  };

  useEffect(() => { 
    load(); 
    
    // Đăng ký nhận thông báo thay đổi (Realtime) từ bảng reservations
    const channel = supabase.channel('realtime_reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Có sự kiện Realtime từ reservations:', payload);
          showToast('Có cập nhật đặt bàn mới!', 'info');
          load(); // Tải lại danh sách khi có sự kiện Insert, Update, Delete
        }
      )
      .subscribe((status, err) => {
        console.log('Trạng thái kết nối Realtime reservations:', status, err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: Reservation['status'], reason?: string) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status, cancellation_reason: reason || null } : r));
    const payload: any = { status };
    if (status === 'CANCELLED') {
      payload.cancellation_reason = reason;
    }
    await supabase.from('reservations').update(payload).eq('id', id);
    showToast('Cập nhật trạng thái thành công', 'success');
    load(); // Refresh for timestamps
  };

  const handleConfirmCancel = () => {
    if (!cancelingId) return;
    updateStatus(cancelingId, 'CANCELLED', cancelReason || 'Lý do khác');
    setCancelingId(null);
    setCancelReason('');
  };

  const deleteRes = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đặt bàn này vĩnh viễn?')) return;
    setReservations((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('reservations').delete().eq('id', id);
    showToast('Đã xóa đặt bàn', 'info');
  };

  const filtered = filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);
  const counts = {
    ALL: reservations.length,
    PENDING: reservations.filter((r) => r.status === 'PENDING').length,
    CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
    CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
    COMPLETED: reservations.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div>
      <h2 className="font-serif text-coffee text-3xl font-medium mb-2">Danh sách đặt bàn</h2>
      <div className="flex flex-wrap gap-2 mb-6 mt-6">
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-l-sm rounded-r-lg border transition-colors ${
              filter === s ? 'bg-coffee text-cream-warm border-coffee' : 'bg-transparent text-coffee border-coffee/20 hover:border-orange'
            }`}
          >
            {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s].label}
            <span className="ml-1.5 opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <div className="paper-note p-10 text-center">
          <p className="font-hand text-coffee text-lg">Chưa có đặt bàn nào trong mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const sc = STATUS_CONFIG[r.status];
            const Icon = sc.icon;
            return (
              <div key={r.id} className="paper-note p-5 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Khách</span>
                    <p className="text-coffee font-medium">{r.customer_name}</p>
                    <a href={`tel:+84${r.phone}`} className="text-sm text-orange link-hand block">{r.phone}</a>
                    {r.email && <span className="text-xs text-muted block mt-1">{r.email}</span>}
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Khi nào</span>
                    <p className="text-coffee">{r.reservation_date}</p>
                    <p className="text-sm text-muted">{r.reservation_time} · {r.guest_count} người</p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Ghi chú khách</span>
                    <p className="text-coffee text-sm">{r.customer_note || '—'}</p>
                    <div className="mt-2 text-xs">
                      <span className="text-muted font-semibold uppercase tracking-wider">Email báo:</span>{' '}
                      {r.notification_status === 'PENDING' && <span className="text-orange">Đang chờ</span>}
                      {r.notification_status === 'SENT' && <span className="text-success">Đã gửi</span>}
                      {r.notification_status === 'FAILED' && <span className="text-error" title={r.notification_error || ''}>Lỗi</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-stretch md:items-end gap-2">
                  <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-sm text-sm font-medium ${sc.bg} ${sc.color}`}>
                    <Icon size={14} /> {sc.label}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {r.status !== 'CONFIRMED' && <button onClick={() => updateStatus(r.id, 'CONFIRMED')} className="px-2.5 py-1 text-xs font-medium text-success border border-success/30 rounded-sm hover:bg-success/10 transition-colors">Xác nhận</button>}
                    {r.status !== 'COMPLETED' && <button onClick={() => updateStatus(r.id, 'COMPLETED')} className="px-2.5 py-1 text-xs font-medium text-olive border border-olive/30 rounded-sm hover:bg-olive/10 transition-colors">Hoàn thành</button>}
                    {r.status !== 'CANCELLED' && <button onClick={() => setCancelingId(r.id)} className="px-2.5 py-1 text-xs font-medium text-error border border-error/30 rounded-sm hover:bg-error/10 transition-colors">Hủy</button>}
                    <button onClick={() => deleteRes(r.id)} className="px-2.5 py-1 text-xs font-medium text-muted border border-muted/30 rounded-sm hover:bg-muted/10 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/40 backdrop-blur-sm p-4">
          <div className="bg-cream p-6 rounded-md shadow-xl w-full max-w-md border border-coffee/10">
            <h3 className="font-serif text-coffee text-2xl font-medium mb-4">Lý do hủy bàn</h3>
            <p className="text-sm text-muted mb-4">
              Lý do này sẽ được đính kèm trong email thông báo xin lỗi gửi đến khách hàng.
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="form-input mb-6"
            >
              <option value="">-- Chọn lý do --</option>
              <option value="Quán đã hết bàn vào khung giờ này">Quán đã hết bàn vào khung giờ này</option>
              <option value="Quán có việc đột xuất phải đóng cửa / nghỉ lễ">Quán có việc đột xuất phải đóng cửa / nghỉ lễ</option>
              <option value="Thông tin đặt bàn không hợp lệ">Thông tin đặt bàn không hợp lệ</option>
              <option value="Lý do khác">Khác</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelingId(null)} className="px-4 py-2 text-sm text-muted hover:text-coffee transition-colors">
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason}
                className="px-4 py-2 text-sm font-medium bg-error text-white rounded-sm hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Category Manager ----------
function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const { showToast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    setCategories((data as Category[]) || []);
    setLoading(false);
  };
  useEffect(() => { 
    load(); 
    const channel = supabase.channel('realtime_admin_cat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleVisible = async (c: Category) => {
    setCategories((prev) => prev.map((i) => i.id === c.id ? { ...i, is_visible: !i.is_visible } : i));
    await supabase.from('categories').update({ is_visible: !c.is_visible }).eq('id', c.id);
  };
  const deleteItem = async (id: string) => {
    if (!confirm('Xóa danh mục sẽ báo lỗi nếu có món ăn đang thuộc danh mục này. Tiếp tục?')) return;
    await supabase.from('categories').delete().eq('id', id);
    showToast('Đã xóa danh mục', 'info');
    load();
  };
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) { showToast('Vui lòng nhập đủ mã và tên', 'error'); return; }
    await supabase.from('categories').insert({ key: newKey.trim(), label: newLabel.trim(), is_visible: true, sort_order: categories.length });
    setNewKey(''); setNewLabel(''); 
    showToast('Thêm danh mục thành công', 'success');
    load();
  };

  return (
    <div>
      <h2 className="font-serif text-coffee text-3xl font-medium mb-6">Quản lý danh mục</h2>
      <div className="paper-note p-6 mb-8">
        <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Mã (key, Vd: coffee)</label>
            <input value={newKey} onChange={(e) => setNewKey(e.target.value)} required className="form-input" />
          </div>
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Tên hiển thị (Vd: Cà phê)</label>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required className="form-input" />
          </div>
          <div className="flex-none">
            <button type="submit" className="btn-primary h-[46px] px-6 gap-2 w-full sm:w-auto">
              <Plus size={16} />
              <span>Thêm</span>
            </button>
          </div>
        </form>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className={`paper-note p-4 flex items-center justify-between ${!c.is_visible ? 'opacity-50' : ''}`}>
              <div>
                <span className="font-medium text-coffee text-lg">{c.label}</span>
                <span className="ml-3 text-xs text-muted uppercase tracking-wider">{c.key}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleVisible(c)} className="px-3 py-1 text-xs border border-coffee/20 hover:bg-coffee/5 rounded-sm">{c.is_visible ? 'Ẩn' : 'Hiện'}</button>
                <button onClick={() => deleteItem(c.id)} className="p-1 text-error border border-error/30 hover:bg-error/10 rounded-sm"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Menu Manager ----------
function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    const [m, c] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true })
    ]);
    setItems((m.data as MenuItem[]) || []);
    setCategories((c.data as Category[]) || []);
    setLoading(false);
  };
  useEffect(() => { 
    load(); 
    const menuChannel = supabase.channel('realtime_admin_menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => load())
      .subscribe();
    const catChannel = supabase.channel('realtime_admin_cat2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => load())
      .subscribe();
    return () => { 
      supabase.removeChannel(menuChannel); 
      supabase.removeChannel(catChannel); 
    };
  }, []);

  const toggleVisible = async (item: MenuItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_visible: !i.is_visible } : i));
    await supabase.from('menu_items').update({ is_visible: !item.is_visible }).eq('id', item.id);
  };
  const toggleAvailable = async (item: MenuItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Xóa món này?')) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from('menu_items').delete().eq('id', id);
    showToast('Đã xóa món ăn', 'info');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-serif text-coffee text-3xl font-medium">Quản lý menu</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <span className="flex items-center gap-1.5"><Plus size={16} /> Thêm món</span>
        </button>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`paper-note p-4 flex items-center gap-4 ${!item.is_visible ? 'opacity-50' : ''}`}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-sm shrink-0" loading="lazy" />
              ) : (
                <div className="w-16 h-16 bg-beige-light rounded-sm shrink-0 flex items-center justify-center text-xs text-muted">No IMG</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-coffee text-lg font-medium truncate">{item.name}</h3>
                  <span className="price-tag text-xs">{item.price}.000đ</span>
                  {item.is_featured && <span className="bg-orange text-cream-warm text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Nổi bật</span>}
                </div>
                <p className="text-sm text-muted truncate">{item.description}</p>
                <span className="text-xs uppercase tracking-[0.08em] text-olive font-semibold">
                  {categories.find((c) => c.id === item.category_id)?.label || 'Không rõ'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <button onClick={() => toggleVisible(item)} className="px-2.5 py-1 text-xs border border-coffee/20 rounded-sm hover:bg-coffee/5">{item.is_visible ? 'Ẩn' : 'Hiện'}</button>
                <button onClick={() => toggleAvailable(item)} className="px-2.5 py-1 text-xs border border-coffee/20 rounded-sm hover:bg-coffee/5">{item.is_available ? 'Hết' : 'Còn'}</button>
                <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1.5 border border-coffee/20 rounded-sm hover:bg-coffee/5"><Pencil size={14} /></button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-error border border-error/30 rounded-sm hover:bg-error/10"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <MenuForm item={editing} categories={categories} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function MenuForm({ item, categories, onClose, onSaved }: { item: MenuItem | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [slug, setSlug] = useState(item?.slug || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [categoryId, setCategoryId] = useState<string>(item?.category_id || (categories[0]?.id || ''));
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [sortOrder, setSortOrder] = useState(item ? String(item.sort_order) : '0');
  const [isFeatured, setIsFeatured] = useState(item?.is_featured || false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Ảnh không được vượt quá 2MB', 'error'); return; }
    setUploading(true);
    const { url, error: uploadErr } = await uploadImage(file);
    if (uploadErr) showToast(uploadErr, 'error');
    else if (url) setImageUrl(url);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !categoryId) { showToast('Điền đủ tên, giá và chọn danh mục.', 'error'); return; }
    setBusy(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim() || null,
      price: parseInt(price, 10),
      category_id: categoryId,
      image_url: imageUrl.trim() || null,
      sort_order: parseInt(sortOrder, 10) || 0,
      is_visible: item ? item.is_visible : true,
      is_available: item ? item.is_available : true,
      is_featured: isFeatured,
    };
    if (item) await supabase.from('menu_items').update(payload).eq('id', item.id);
    else await supabase.from('menu_items').insert(payload);
    setBusy(false);
    showToast('Lưu món thành công', 'success');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-roast-dark/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="paper-note p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-6">
          <h3 className="font-serif text-2xl">{item ? 'Sửa món' : 'Thêm món'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs uppercase font-semibold">Tên món</label><input value={name} onChange={e => setName(e.target.value)} required className="form-input mt-1" /></div>
            <div><label className="text-xs uppercase font-semibold">Slug (để trống tự tạo)</label><input value={slug} onChange={e => setSlug(e.target.value)} className="form-input mt-1" /></div>
            <div className="col-span-2"><label className="text-xs uppercase font-semibold">Mô tả</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="form-input mt-1" /></div>
            <div><label className="text-xs uppercase font-semibold">Giá (nghìn VNĐ)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} required min={0} className="form-input mt-1" /></div>
            <div>
              <label className="text-xs uppercase font-semibold">Danh mục</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input mt-1">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase font-semibold block mb-1">Ảnh món (Tối đa 2MB)</label>
            <div className="flex gap-4 items-center">
              {imageUrl ? <img src={imageUrl} alt="" className="w-16 h-16 rounded object-cover" /> : <div className="w-16 h-16 bg-beige flex items-center justify-center rounded"><ImageIcon className="text-muted" /></div>}
              <div className="flex-1 space-y-2">
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImage} disabled={uploading} className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-coffee file:text-cream-warm hover:file:bg-coffee/90" />
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Hoặc dán URL ảnh vào đây" className="form-input text-sm py-1" />
              </div>
            </div>
          </div>
          <div className="flex gap-6 items-center pt-2">
            <div><label className="text-xs uppercase font-semibold">Thứ tự hiển thị</label><input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="form-input mt-1 w-24" /></div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-orange" />
              <span className="text-sm font-semibold text-coffee">Nổi bật (hiển thị trang chủ)</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-coffee/10">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={busy || uploading} className="btn-primary"><span>Lưu món</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Shop Manager ----------
function ShopManager() {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [openingHoursStr, setOpeningHoursStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('shop_info').select('*').limit(1).maybeSingle();
    setShop(data as ShopInfo);
    
    if (data?.opening_hours) {
      const hoursStr = Object.entries(data.opening_hours)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setOpeningHoursStr(hoursStr);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!shop) return;
    setShop({ ...shop, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setBusy(true);
    const newHours = openingHoursStr.split('\n').reduce((acc, line) => {
      const [k, ...v] = line.split(':');
      if (k && v.length) acc[k.trim()] = v.join(':').trim();
      return acc;
    }, {} as Record<string, string>);

    await supabase.from('shop_info').update({
      shop_name: shop.shop_name,
      address: shop.address,
      phone: shop.phone,
      email: shop.email || null,
      zalo_link: shop.zalo_link || null,
      facebook_link: shop.facebook_link || null,
      maps_link: shop.maps_link || null,
      parking_note: shop.parking_note || null,
      opening_hours: newHours,
      reservation_start_time: shop.reservation_start_time,
      reservation_end_time: shop.reservation_end_time,
      reservation_notification_email: shop.reservation_notification_email || null,
    }).eq('id', shop.id);
    setBusy(false);
    showToast('Đã lưu thông tin cửa hàng', 'success');
  };

  if (loading) return <p>Đang tải...</p>;
  if (!shop) return <p>Không tìm thấy dữ liệu shop_info.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-serif text-3xl mb-6">Thông tin cửa hàng</h2>
      <form onSubmit={handleSave} className="paper-note p-6 space-y-4">
        <div><label className="text-xs uppercase font-semibold">Tên quán</label><input name="shop_name" value={shop.shop_name} onChange={handleChange} required className="form-input mt-1" /></div>
        <div><label className="text-xs uppercase font-semibold">Địa chỉ</label><textarea name="address" value={shop.address} onChange={handleChange} required rows={2} className="form-input mt-1 resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs uppercase font-semibold">Điện thoại</label><input name="phone" value={shop.phone} onChange={handleChange} required className="form-input mt-1" /></div>
          <div><label className="text-xs uppercase font-semibold">Email công khai</label><input name="email" type="email" value={shop.email || ''} onChange={handleChange} className="form-input mt-1" /></div>
          <div><label className="text-xs uppercase font-semibold">Zalo Link</label><input name="zalo_link" value={shop.zalo_link || ''} onChange={handleChange} className="form-input mt-1" /></div>
          <div><label className="text-xs uppercase font-semibold">Maps Link</label><input name="maps_link" value={shop.maps_link || ''} onChange={handleChange} className="form-input mt-1" /></div>
        </div>
        <div><label className="text-xs uppercase font-semibold">Ghi chú gửi xe</label><textarea name="parking_note" value={shop.parking_note || ''} onChange={handleChange} rows={2} className="form-input mt-1 resize-none" /></div>
        
        <div>
          <label className="text-xs uppercase font-semibold">Giờ mở cửa (Cửa hàng)</label>
          <textarea 
            value={openingHoursStr} 
            onChange={(e) => setOpeningHoursStr(e.target.value)} 
            rows={3} 
            placeholder={"Thứ 2 - Thứ 6: 07:30 - 21:00\nThứ 7 - CN: 08:00 - 22:00"}
            className="form-input mt-1 resize-none" 
          />
          <p className="text-xs mt-1 text-muted">Nhập mỗi dòng 1 khung giờ. Ví dụ: <code>T2-T6: 07:30 - 21:00</code></p>
        </div>
        <div className="pt-4 border-t border-coffee/10">
          <h3 className="font-semibold text-sm mb-2 text-coffee">Giờ nhận khách (Đặt bàn)</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase font-semibold">Giờ bắt đầu</label>
              <input name="reservation_start_time" type="time" value={shop.reservation_start_time} onChange={handleChange} required className="form-input mt-1" />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold">Giờ kết thúc (nhận khách cuối)</label>
              <input name="reservation_end_time" type="time" value={shop.reservation_end_time} onChange={handleChange} required className="form-input mt-1" />
            </div>
          </div>
          <label className="text-xs uppercase font-semibold text-orange">Email nhận thông báo đặt bàn (Nội bộ)</label>
          <input name="reservation_notification_email" type="email" value={shop.reservation_notification_email || ''} onChange={handleChange} className="form-input mt-1" placeholder="Vd: quanly@caphe-minh.vn" />
          <p className="text-xs mt-1 text-muted">Email này sẽ nhận thông báo khi có khách đặt bàn trên web.</p>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={busy} className="btn-primary"><span>{busy ? 'Đang lưu...' : 'Lưu thay đổi'}</span></button>
        </div>
      </form>
    </div>
  );
}
