import Profile from '../../models/Profile.js';

export async function getProfile(userId) {
  try {
    const userProfile = await Profile.findOne({ userId: userId })
      .select('strongSubject');

    if (!userProfile) {
      return {
        error: "Profile not found.",
      };
    }

    return userProfile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      error: "An unexpected error occurred while fetching the profile.",
    };
  }
}
