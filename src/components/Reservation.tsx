import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { CoffeeRing } from './CoffeeRing';
import { Reveal } from './Reveal';
import { useToast } from './Toast';

type FormState = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  note: string;
};

const EMPTY: FormState = { name: '', phone: '', email: '', date: '', time: '', guests: '2', note: '' };

const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
  '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
  '19:30', '20:00', '20:30', '21:00',
];

export function Reservation() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const { showToast } = useToast();

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9+\s()-]{8,15}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ';
    if (!form.date) e.date = 'Vui lòng chọn ngày';
    if (!form.time) e.time = 'Vui lòng chọn giờ';
    const g = parseInt(form.guests, 10);
    if (!g || g < 1 || g > 20) e.guests = 'Từ 1 đến 20 người';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) {
      showToast('Vui lòng kiểm tra lại thông tin...', 'error');
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.rpc('create_reservation', {
      p_customer_name: form.name.trim(),
      p_phone: form.phone.trim(),
      p_email: form.email.trim() || null,
      p_reservation_date: form.date,
      p_reservation_time: form.time,
      p_guest_count: parseInt(form.guests, 10),
      p_customer_note: form.note.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      setServerError(error.message || 'Không gửi được đặt bàn. Vui lòng gọi điện cho quán: 028 3999 1234.');
      showToast('Gửi yêu cầu thất bại', 'error');
      return;
    }
    setSuccess(true);
    showToast('Yêu cầu đặt bàn đã được gửi!', 'success');
    setForm(EMPTY);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="reserve" className="relative py-section">
      <CoffeeRing size={320} className="absolute -top-10 right-0 text-coffee" opacity={0.06} rotate={12} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        <Reveal>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">05</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Đặt bàn
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Left: intro */}
          <div className="col-span-12 md:col-span-5">
            <Reveal delay={1}>
              <h2 className="font-serif text-coffee text-h2 font-medium">
                Đặt trước một chỗ ngồi,
                <br />
                để khi đến chỉ cần
                <span className="hand-underline">
                  {' '}chọn món
                  <svg viewBox="0 0 110 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 Q 28 2 55 7 T 108 6" />
                  </svg>
                </span>.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-sm">
                Gửi thông tin, quán sẽ liên hệ qua điện thoại để xác nhận trong vòng 2 giờ
                (trong giờ mở cửa). Nếu đến cuối tuần, hãy đặt trước 1 ngày.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 paper-note p-5 max-w-sm rotate-[-1deg]">
                <p className="font-hand text-coffee text-base leading-snug">
                  Quán chỉ nhận đặt bàn cho nhóm từ 2 người trở lên.
                  Khách lẻ vui lòng đến trực tiếp — còn bàn là ngồi được ngay.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: form / confirmation */}
          <div className="col-span-12 md:col-span-7 md:col-start-7">
            {success ? (
              <Reveal className="relative">
                <div className="paper-note p-10 md:p-14 text-center min-h-[420px] flex flex-col items-center justify-center">
                  <div className="confirm-stamp animate-stamp mb-6">Đã ghi bàn</div>
                  <h3 className="font-serif text-coffee text-3xl font-medium mb-3">
                    Cảm ơn bạn đã đặt bàn.
                  </h3>
                  <p className="text-muted text-lg max-w-md leading-relaxed">
                    Quán sẽ gọi điện cho bạn để xác nhận trong giờ mở cửa.
                    Nếu cần gấp, hãy gọi trực tiếp: 028 3999 1234.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-secondary mt-8"
                  >
                    Đặt bàn khác
                  </button>
                </div>
              </Reveal>
            ) : (
              <Reveal delay={2}>
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="paper-note p-6 md:p-8 relative"
                  aria-label="Form đặt bàn"
                >
                  {/* Form header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-coffee/15">
                    <span className="font-hand text-coffee text-xl">Phiếu ghi bàn</span>
                    <span className="text-xs uppercase tracking-[0.1em] text-muted">Cà phê Minh</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Họ tên"
                      required
                      error={errors.name}
                    >
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                      />
                    </Field>

                    <Field
                      label="Số điện thoại"
                      required
                      error={errors.phone}
                    >
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="0901 234 567"
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                      />
                    </Field>

                    <Field
                      label="Email (không bắt buộc)"
                      error={errors.email}
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ban@email.com"
                        className="form-input"
                      />
                    </Field>

                    <Field
                      label="Ngày"
                      required
                      error={errors.date}
                    >
                      <input
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.date}
                      />
                    </Field>

                    <Field
                      label="Giờ"
                      required
                      error={errors.time}
                    >
                      <select
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.time}
                      >
                        <option value="">Chọn giờ</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Số người"
                      required
                      error={errors.guests}
                    >
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: e.target.value })}
                        className="form-input"
                        aria-required="true"
                        aria-invalid={!!errors.guests}
                      />
                    </Field>

                    <Field label="Ghi chú" className="sm:col-span-2">
                      <textarea
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        placeholder="Bàn gần cửa sổ, nhóm có trẻ em, cần ổ cắm..."
                        rows={2}
                        className="form-input resize-none"
                      />
                    </Field>
                  </div>

                  {serverError && (
                    <p className="mt-5 text-error text-sm font-medium" role="alert">
                      {serverError}
                    </p>
                  )}

                  <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted">
                      Quán sẽ liên hệ để xác nhận. Đặt bàn chỉ hiệu lực sau khi được xác nhận.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>{submitting ? 'Đang gửi...' : 'Ghi bàn'}</span>
                    </button>
                  </div>
                </form>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-[0.1em] text-coffee font-semibold mb-1.5">
        {label} {required && <span className="text-orange">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
