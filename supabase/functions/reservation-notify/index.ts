import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  try {
    // 1. Nhận Webhook Payload
    const payload = await req.json();
    const record = payload.record;

    if (!record || payload.table !== 'reservations' || payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // 2. Kiểm tra Idempotent (Chỉ xử lý khi notification_status là PENDING)
    if (record.notification_status !== 'PENDING') {
      return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
    }

    // Khởi tạo Supabase client với Service Role để bypass RLS
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 3. Lấy email nhận thông báo từ shop_info
    const { data: shopInfo } = await supabase
      .from('shop_info')
      .select('reservation_notification_email, shop_name')
      .limit(1)
      .maybeSingle();

    const toEmail = shopInfo?.reservation_notification_email;

    if (!toEmail) {
      // Đánh dấu failed nếu chưa cấu hình email
      await supabase.from('reservations').update({
        notification_status: 'FAILED',
        notification_error: 'Chưa cấu hình reservation_notification_email trong shop_info'
      }).eq('id', record.id);

      return new Response(JSON.stringify({ message: 'No target email configured' }), { status: 200 });
    }

    // 4. Gửi email bằng Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Cà phê Minh <onboarding@resend.dev>', // Có thể thay bằng domain thật
        to: toEmail,
        subject: `[Đặt bàn mới] ${record.customer_name} - ${record.reservation_date}`,
        html: `
          <h2>Có yêu cầu đặt bàn mới!</h2>
          <ul>
            <li><strong>Khách hàng:</strong> ${record.customer_name}</li>
            <li><strong>SĐT:</strong> ${record.phone}</li>
            <li><strong>Email khách:</strong> ${record.email || 'Không có'}</li>
            <li><strong>Ngày:</strong> ${record.reservation_date}</li>
            <li><strong>Giờ:</strong> ${record.reservation_time}</li>
            <li><strong>Số lượng:</strong> ${record.guest_count} người</li>
            <li><strong>Ghi chú:</strong> ${record.customer_note || 'Không có'}</li>
          </ul>
          <p>Hãy vào trang quản trị để xác nhận cho khách nhé.</p>
        `
      })
    });

    const resendData = await res.json();

    if (!res.ok) {
      // Đánh dấu failed
      await supabase.from('reservations').update({
        notification_status: 'FAILED',
        notification_error: JSON.stringify(resendData)
      }).eq('id', record.id);

      return new Response(JSON.stringify({ error: 'Resend API error', details: resendData }), { status: 500 });
    }

    // 5. Cập nhật thành công
    await supabase.from('reservations').update({
      notification_status: 'SENT',
      notification_error: null
    }).eq('id', record.id);

    return new Response(JSON.stringify({ message: 'Notification sent successfully' }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
