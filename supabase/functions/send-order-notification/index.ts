/// <reference lib="deno.ns" />

// Types Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("🚀 Edge Function send-order-notification prête");

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    console.log("📥 Données reçues :", payload);

    return new Response(
      JSON.stringify({
        success: true,
        received: payload,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erreur Edge Function :", error);

    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400 }
    );
  }
});
