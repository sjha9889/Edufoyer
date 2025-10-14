import Doubt from '../../models/Doubt.js';

export async function getUserDoubts(userId) {
  if (!userId) {
    console.error("getUserDoubts: Unauthorized access attempt.");
    return { success: false, error: "Unauthorized", doubts: [] };
  }

  try {
    const userDoubts = await Doubt.find({ doubter_id: userId })
      .sort({ createdAt: -1 });

    return { success: true, doubts: userDoubts };

  } catch (error) {
    console.error(`Database Error fetching doubts for user ${userId}:`, error);
    return {
      success: false,
      error: "Database Error: Failed to fetch doubts.",
      doubts: [],
    };
  }
}
