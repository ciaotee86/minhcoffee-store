import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  try {
    const payload = await req.json();
    const recordId = payload?.record?.id;

    if (!recordId || payload.table !== 'reservations' || !['INSERT', 'UPDATE'].includes(payload.type)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');
    const signature = req.headers.get('x-webhook-secret');
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: record, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchError || !record) {
      return new Response(JSON.stringify({ error: 'Reservation not found' }), { status: 404 });
    }

    const { data: shopInfo } = await supabase
      .from('shop_info')
      .select('reservation_notification_email, shop_name')
      .limit(1)
      .maybeSingle();

    const shopName = shopInfo?.shop_name || 'Cà phê Minh';

    if (payload.type === 'INSERT') {
      if (record.notification_status !== 'PENDING') {
        return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
      }

      const toEmail = shopInfo?.reservation_notification_email;
      if (!toEmail) {
        await supabase.from('reservations').update({ notification_status: 'FAILED', notification_error: 'Chưa cấu hình email' }).eq('id', record.id);
        return new Response(JSON.stringify({ message: 'No target email' }), { status: 200 });
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${shopName} <onboarding@resend.dev>`,
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

      if (!res.ok) {
        const resendData = await res.json();
        await supabase.from('reservations').update({ notification_status: 'FAILED', notification_error: JSON.stringify(resendData) }).eq('id', record.id);
        return new Response(JSON.stringify({ error: 'Resend API error' }), { status: 500 });
      }

      await supabase.from('reservations').update({ notification_status: 'SENT', notification_error: null }).eq('id', record.id);
      return new Response(JSON.stringify({ message: 'Notification sent successfully' }), { status: 200 });
    } 
    
    else if (payload.type === 'UPDATE') {
      const oldStatus = payload.old_record?.status;
      const newStatus = record.status;
      
      if (oldStatus !== newStatus && (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED')) {
        const customerEmail = record.email;
        if (!customerEmail) {
           return new Response(JSON.stringify({ message: 'Customer has no email' }), { status: 200 });
        }

        let subject = '';
        let html = '';

        if (newStatus === 'CONFIRMED') {
           subject = `Xác nhận đặt bàn tại ${shopName}`;
           html = `
             <h2>Xin chào ${record.customer_name},</h2>
             <p>Cảm ơn bạn đã chọn <strong>${shopName}</strong>. Yêu cầu đặt bàn của bạn đã được xác nhận thành công!</p>
             <ul>
               <li><strong>Ngày:</strong> ${record.reservation_date}</li>
               <li><strong>Giờ:</strong> ${record.reservation_time}</li>
               <li><strong>Số người:</strong> ${record.guest_count} người</li>
             </ul>
             <p>Chúng tôi rất mong được đón tiếp bạn. Nếu có thay đổi, vui lòng liên hệ lại với quán.</p>
             <p>Hẹn gặp bạn nhé!</p>
           `;
        } else if (newStatus === 'CANCELLED') {
           subject = `Thông báo hủy đặt bàn từ ${shopName}`;
           const reason = record.cancellation_reason || 'Không xác định';
           html = `
             <h2>Xin chào ${record.customer_name},</h2>
             <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu đặt bàn của bạn vào lúc ${record.reservation_time} ngày ${record.reservation_date} đã bị hủy.</p>
             <p><strong>Lý do:</strong> ${reason}</p>
             <p>Thành thật xin lỗi bạn vì sự bất tiện này. Hy vọng sẽ được đón tiếp bạn vào một dịp khác.</p>
             <p>Trân trọng,</p>
             <p>${shopName}</p>
           `;
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: `${shopName} <onboarding@resend.dev>`,
            to: customerEmail,
            subject: subject,
            html: html
          })
        });

        if (!res.ok) {
           const err = await res.json();
           return new Response(JSON.stringify({ error: 'Failed to send customer email', details: err }), { status: 500 });
        }
        
        return new Response(JSON.stringify({ message: 'Customer notification sent successfully' }), { status: 200 });
      }

      return new Response(JSON.stringify({ message: 'No email required for this update' }), { status: 200 });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
