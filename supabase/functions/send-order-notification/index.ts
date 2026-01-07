import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("🚀 send-order-notification function loaded");

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    console.log("📥 Payload reçu :", body);

    return new Response(
      JSON.stringify({ success: true, body }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (err) {
    console.error("❌ Erreur Edge Function :", err);

    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400 }
    );
  }
});
