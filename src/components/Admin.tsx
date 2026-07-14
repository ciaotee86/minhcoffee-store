import { useEffect, useState } from 'react';
import { supabase, type MenuItem, type Reservation } from '../lib/supabase';
import { CoffeeRing } from './CoffeeRing';
import {
  LogOut, Plus, Trash2, Pencil, X, Check, Clock, XCircle, CheckCircle2,
} from 'lucide-react';

type Tab = 'reservations' | 'menu';

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('reservations');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin(data.session.user.id);
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (sess) await checkAdmin(sess.user.id);
        else { setIsAdmin(false); setLoading(false); }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase.from('admins').select('user_id').eq('user_id', uid).maybeSingle();
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
    return <AdminLogin onLoggedIn={() => {}} hasSession={!!session} />;
  }

  return (
    <div className="min-h-screen bg-cream-warm">
      <AdminHeader onSignOut={async () => { await supabase.auth.signOut(); }} tab={tab} setTab={setTab} />
      <main className="mx-auto max-w-site px-5 md:px-8 py-10">
        {tab === 'reservations' ? <ReservationManager /> : <MenuManager />}
      </main>
    </div>
  );
}

// ---------- Admin Header ----------
function AdminHeader({ onSignOut, tab, setTab }: { onSignOut: () => void; tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <header className="bg-coffee text-cream-warm">
      <div className="mx-auto max-w-site px-5 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex items-center justify-center w-8 h-8">
            <span className="absolute inset-0 rounded-full border-2 border-cream-warm rotate-[-8deg] opacity-70" />
            <span className="font-serif text-cream-warm text-sm font-semibold relative">M</span>
          </span>
          <span className="font-serif text-lg font-semibold">
            Cà phê <span className="font-hand text-orange text-xl">Minh</span>
            <span className="text-cream-warm/50 text-sm font-sans ml-2">— Quản trị</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1 mr-2">
            <button
              onClick={() => setTab('reservations')}
              className={`px-3 py-1.5 text-sm rounded-l-sm rounded-r-lg transition-colors ${
                tab === 'reservations' ? 'bg-orange text-cream-warm' : 'text-cream-warm/70 hover:text-cream-warm'
              }`}
            >
              Đặt bàn
            </button>
            <button
              onClick={() => setTab('menu')}
              className={`px-3 py-1.5 text-sm rounded-l-sm rounded-r-lg transition-colors ${
                tab === 'menu' ? 'bg-orange text-cream-warm' : 'text-cream-warm/70 hover:text-cream-warm'
              }`}
            >
              Menu
            </button>
          </nav>
          <a href="#top" className="text-cream-warm/60 hover:text-orange text-sm px-2 transition-colors">
            Xem trang
          </a>
          <button onClick={onSignOut} className="inline-flex items-center gap-1.5 text-cream-warm/70 hover:text-orange text-sm px-2 transition-colors">
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------- Admin Login / Bootstrap ----------
function AdminLogin({ hasSession }: { onLoggedIn: () => void; hasSession: boolean }) {
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message.includes('Invalid login') ? 'Email hoặc mật khẩu không đúng.' : error.message);
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (password.length < 8) { setError('Mật khẩu ít nhất 8 ký tự.'); return; }
    setBusy(true);

    const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reservation-notify`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    try {
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'bootstrap-admin', payload: { email, password } }),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) { setError(data.error || 'Không tạo được tài khoản.'); return; }
      // Auto-login
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError('Tài khoản đã tạo. Vui lòng đăng nhập thủ công.');
    } catch {
      setBusy(false);
      setError('Không kết nối được đến máy chủ. Thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-warm px-5 relative overflow-hidden">
      <CoffeeRing size={400} className="absolute -top-20 -right-20 text-coffee" opacity={0.05} />
      <CoffeeRing size={200} className="absolute -bottom-10 -left-10 text-orange" opacity={0.06} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <span className="relative inline-flex items-center justify-center w-14 h-14 mb-4">
            <span className="absolute inset-0 rounded-full border-2 border-coffee rotate-[-8deg] opacity-70" />
            <span className="absolute inset-2 rounded-full border border-orange rotate-[-4deg] opacity-50" />
            <span className="font-serif text-coffee text-2xl font-semibold relative">M</span>
          </span>
          <h1 className="font-serif text-coffee text-2xl font-medium">
            Cà phê <span className="font-hand text-orange text-3xl">Minh</span>
          </h1>
          <p className="text-muted text-sm mt-1">Khu quản trị</p>
        </div>

        {hasSession && (
          <div className="paper-note p-4 mb-4 text-center rotate-[-1deg]">
            <p className="font-hand text-coffee text-sm">
              Tài khoản của bạn không có quyền quản trị. Liên hệ chủ quán để được cấp quyền.
            </p>
          </div>
        )}

        <div className="paper-note p-6 md:p-8">
          {/* Mode toggle */}
          <div className="flex gap-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-l-sm rounded-r-lg transition-colors ${
                mode === 'login' ? 'bg-coffee text-cream-warm' : 'text-coffee hover:text-orange'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setMode('bootstrap'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-l-sm rounded-r-lg transition-colors ${
                mode === 'bootstrap' ? 'bg-coffee text-cream-warm' : 'text-coffee hover:text-orange'
              }`}
            >
              Tạo tài khoản (lần đầu)
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleBootstrap} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="minh@caphe-minh.vn"
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'bootstrap' ? 8 : 1}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
            {mode === 'bootstrap' && (
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            )}

            {error && <p className="text-error text-sm" role="alert">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
              <span>{busy ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản quản trị'}</span>
            </button>
          </form>

          {mode === 'bootstrap' && (
            <p className="mt-4 text-xs text-muted leading-relaxed">
              Chỉ dùng lần đầu để tạo tài khoản quản trị. Sau khi tạo, chuyển sang "Đăng nhập" cho các lần sau.
            </p>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-muted">
          <a href="#top" className="link-hand">← Quay lại trang quán</a>
        </p>
      </div>
    </div>
  );
}

// ---------- Reservation Manager ----------
const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-orange', bg: 'bg-orange/10' },
  confirmed: { label: 'Đã xác nhận', icon: Check, color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
  completed: { label: 'Đã hoàn thành', icon: CheckCircle2, color: 'text-olive', bg: 'bg-olive/10' },
} as const;

function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    setReservations((data as Reservation[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Reservation['status']) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    await supabase.from('reservations').update({ status }).eq('id', id);
  };

  const deleteRes = async (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('reservations').delete().eq('id', id);
  };

  const filtered = filter === 'all' ? reservations : reservations.filter((r) => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
  };

  return (
    <div>
      <h2 className="font-serif text-coffee text-3xl font-medium mb-2">Danh sách đặt bàn</h2>
      <p className="text-muted mb-6">Cập nhật trạng thái khi liên hệ khách. Khách đặt mới có trạng thái "Chờ xác nhận".</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-l-sm rounded-r-lg border transition-colors ${
              filter === s ? 'bg-coffee text-cream-warm border-coffee' : 'bg-transparent text-coffee border-coffee/20 hover:border-orange'
            }`}
          >
            {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s].label}
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
              <div key={r.id} className="paper-note p-5 flex flex-col md:flex-row md:items-center gap-4">
                {/* Info */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Khách</span>
                    <p className="text-coffee font-medium">{r.name}</p>
                    <a href={`tel:+84${r.phone}`} className="text-sm text-orange link-hand">{r.phone}</a>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Khi nào</span>
                    <p className="text-coffee">{r.date}</p>
                    <p className="text-sm text-muted">{r.time} · {r.guests} người</p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs uppercase tracking-[0.08em] text-muted font-semibold">Ghi chú</span>
                    <p className="text-coffee text-sm">{r.note || '—'}</p>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex flex-col items-stretch md:items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-medium ${sc.bg} ${sc.color}`}>
                    <Icon size={14} /> {sc.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.status !== 'confirmed' && (
                      <button onClick={() => updateStatus(r.id, 'confirmed')} className="px-2.5 py-1 text-xs font-medium text-success border border-success/30 rounded-sm hover:bg-success/10 transition-colors">
                        Xác nhận
                      </button>
                    )}
                    {r.status !== 'completed' && (
                      <button onClick={() => updateStatus(r.id, 'completed')} className="px-2.5 py-1 text-xs font-medium text-olive border border-olive/30 rounded-sm hover:bg-olive/10 transition-colors">
                        Hoàn thành
                      </button>
                    )}
                    {r.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(r.id, 'cancelled')} className="px-2.5 py-1 text-xs font-medium text-error border border-error/30 rounded-sm hover:bg-error/10 transition-colors">
                        Hủy
                      </button>
                    )}
                    <button onClick={() => deleteRes(r.id)} className="px-2.5 py-1 text-xs font-medium text-muted border border-muted/30 rounded-sm hover:bg-muted/10 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Menu Manager ----------
const CATS = [
  { key: 'coffee', label: 'Cà phê' },
  { key: 'tea', label: 'Trà' },
  { key: 'pastry', label: 'Bánh nhẹ' },
] as const;

function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
    setItems((data as MenuItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAvailable = async (item: MenuItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from('menu_items').delete().eq('id', id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-coffee text-3xl font-medium mb-1">Quản lý menu</h2>
          <p className="text-muted">Thêm, sửa, ẩn hoặc xóa món. Thay đổi hiển thị ngay trên trang.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <span className="flex items-center gap-1.5"><Plus size={16} /> Thêm món</span>
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`paper-note p-4 flex items-center gap-4 ${!item.available ? 'opacity-50' : ''}`}>
              <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-sm shrink-0" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-coffee text-lg font-medium truncate">{item.name}</h3>
                  <span className="price-tag text-xs">{item.price}.000đ</span>
                </div>
                <p className="text-sm text-muted truncate">{item.description}</p>
                <span className="text-xs uppercase tracking-[0.08em] text-olive font-semibold">
                  {CATS.find((c) => c.key === item.category)?.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleAvailable(item)}
                  className="px-2.5 py-1 text-xs font-medium text-coffee border border-coffee/20 rounded-sm hover:bg-coffee/5 transition-colors"
                >
                  {item.available ? 'Ẩn' : 'Hiện'}
                </button>
                <button
                  onClick={() => { setEditing(item); setShowForm(true); }}
                  className="p-1.5 text-coffee border border-coffee/20 rounded-sm hover:bg-coffee/5 transition-colors"
                  aria-label="Sửa món"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-error border border-error/30 rounded-sm hover:bg-error/10 transition-colors"
                  aria-label="Xóa món"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <MenuForm
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function MenuForm({ item, onClose, onSaved }: { item: MenuItem | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [category, setCategory] = useState<MenuItem['category']>(item?.category || 'coffee');
  const [image_url, setImageUrl] = useState(item?.image_url || '');
  const [sort_order, setSortOrder] = useState(item ? String(item.sort_order) : '0');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !price.trim()) { setError('Tên và giá là bắt buộc.'); return; }
    setBusy(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseInt(price, 10),
      category,
      image_url: image_url.trim(),
      sort_order: parseInt(sort_order, 10) || 0,
      available: true,
    };

    if (item) {
      await supabase.from('menu_items').update(payload).eq('id', item.id);
    } else {
      await supabase.from('menu_items').insert(payload);
    }

    setBusy(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-roast-dark/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="paper-note p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-coffee text-2xl font-medium">
            {item ? 'Sửa món' : 'Thêm món mới'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-coffee transition-colors" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Tên món</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Cà phê sữa đá" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Mô tả ngắn</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="form-input resize-none" placeholder="Cà phê phin, sữa đặc, uống đá..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Giá (nghìn đồng)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} className="form-input" placeholder="38" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Loại</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as MenuItem['category'])} className="form-input">
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">URL hình ảnh</label>
            <input value={image_url} onChange={(e) => setImageUrl(e.target.value)} className="form-input" placeholder="https://images.pexels.com/..." />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">Thứ tự hiển thị</label>
            <input type="number" value={sort_order} onChange={(e) => setSortOrder(e.target.value)} className="form-input" placeholder="0" />
          </div>

          {error && <p className="text-error text-sm" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
              <span>{busy ? 'Đang lưu...' : 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
