import { supabase } from "../lib/supabaseClient";

export const saveOneSignalPlayerId = async (
  userId: string,
  playerId: string
) => {
  const { error } = await supabase
    .from("onesignal_players")
    .upsert({
      user_id: userId,
      player_id: playerId,
      platform: "web",
    }, {
      onConflict: "player_id",
    });

  if (error) {
    console.error("❌ Erreur sauvegarde playerId :", error);
  }
};
