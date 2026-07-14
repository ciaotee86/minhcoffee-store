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
  }
});
