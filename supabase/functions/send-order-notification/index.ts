// Types Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("🚀 Edge Function send-order-notification prête");

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const payload = await req.json();
    console.log("📥 Données reçues :", payload);

    return new Response(
      JSON.stringify({
        success: true,
        received: payload,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Erreur Edge Function :", error);

    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
