// 📌 Récupère les IDs des produits likés par un utilisateur depuis localStorage
export const getUserLikedProductIds = (userId: string): string[] => {
  const likes = JSON.parse(localStorage.getItem('likes') || '{}') as Record<string, string[]>; // Ajout d'un typage explicite
  return likes[userId] || [];
};

// 📌 Récupère le nombre total de likes par produit depuis localStorage
export const getLikeCounts = (): Record<string, number> => {
  const likes = JSON.parse(localStorage.getItem('likes') || '{}') as Record<string, string[]>; // Ajout d'un typage explicite
  const counts: Record<string, number> = {};

  Object.values(likes).forEach((userLikes) => {
    userLikes.forEach((productId) => {
      counts[productId] = (counts[productId] || 0) + 1;
    });
  });

  return counts;
};

// 📌 Ajoute un like dans localStorage
export const addLike = (userId: string, productId: string) => {
  const likes = JSON.parse(localStorage.getItem('likes') || '{}') as Record<string, string[]>; // Ajout d'un typage explicite
  if (!likes[userId]) likes[userId] = [];
  if (!likes[userId].includes(productId)) likes[userId].push(productId);
  localStorage.setItem('likes', JSON.stringify(likes));
  return true;
};

// 📌 Supprime un like dans localStorage
export const removeLike = (userId: string, productId: string) => {
  const likes = JSON.parse(localStorage.getItem('likes') || '{}') as Record<string, string[]>; // Ajout d'un typage explicite
  if (likes[userId]) {
    likes[userId] = likes[userId].filter((id: string) => id !== productId);
    if (likes[userId].length === 0) delete likes[userId];
  }
  localStorage.setItem('likes', JSON.stringify(likes));
  return true;
};
