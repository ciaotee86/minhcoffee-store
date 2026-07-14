<<<<<<< HEAD
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
=======
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { type, payload } = await req.json();

    // --- Bootstrap admin: create auth user + add to admins table ---
    if (type === "bootstrap-admin") {
      const { email, password } = payload;
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Thiếu email hoặc mật khẩu" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if admin already exists in admins table
      const { data: existing } = await supabase
        .from("admins")
        .select("user_id")
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, message: "Admin đã tồn tại" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add to admins table
      const { error: adminError } = await supabase
        .from("admins")
        .insert({ user_id: authData.user.id });

      if (adminError) {
        return new Response(
          JSON.stringify({ error: adminError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, email }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Reservation notification ---
    if (type === "reservation-created") {
      const { name, phone, date, time, guests, note } = payload;

      // Log the reservation (visible in Supabase logs)
      console.log(`[Cà phê Minh] Đặt bàn mới: ${name} - ${phone} - ${date} ${time} - ${guests} người - ${note || "không ghi chú"}`);

      // In production, this would send an email via an email service.
      // For now, we log it so the owner can see notifications in the dashboard.
      return new Response(
        JSON.stringify({ ok: true, message: "Đã ghi nhận đặt bàn" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Loại yêu cầu không hợp lệ" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
  }
});
