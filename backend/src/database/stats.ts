import Set from "../models/Set";
import User from "../models/User";
import mongoose from "mongoose";

export async function getTotalSessions(userId?: string) {
  const matchStage = userId
    ? { $match: { user: new mongoose.Types.ObjectId(userId) } }
    : { $match: {} };

  const result = await Set.aggregate([
    matchStage,
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    { $group: { _id: "$date" } },
    { $count: "totalSessions" },
  ]);

  return result[0]?.totalSessions || 0;
}

export async function getWeightProgress(userId: number): Promise<number> {
  const user = await User.findById(userId).populate("goals");

  if (!user || !user.goals || user.goals.length === 0) {
    throw new Error("No goal added");
  }

  const latestGoal = user.goals.find(
    (goal: Goal) => goal.label === "Weight goal",
  );

  if (latestGoal.start - latestGoal.current == 0) return 0;

  return (
    ((latestGoal.start - latestGoal.current) /
      (latestGoal.start - latestGoal.goal)) *
    100
  );
}

export async function getGoalProgress(
  userId: string | number,
  goalType: string,
): Promise<number> {
  if (goalType === "weight") {
    try {
      const progress = await getWeightProgress(userId);
      return progress;
    } catch (_err: Error) {
      console.error(_err);
      return 0;
    }
  }
  throw new Error("Unsupported goal type: " + goalType);
}

export function calculateStrength(reps: number, weight: number): number {
  return weight * (1 + reps / 30);
}

export async function getStrengthProgress(
  userId: number,
  _muscleGroup: string,
) {
  const muscles = ["Chest", "Legs", "Arms", "Back"];

	const user:User = await User.findById(userId);
	
  const sets = await Set.find({
    user: user
  }).populate("template");

  const response = [];

  muscles.forEach((muscle) => {
    const filtered = sets.filter((s) =>
      s.template?.muscleGroups.includes(muscle),
    );

    const strengthPoints = filtered.map((aSet) => {
      return {
        date: aSet.createdAt,
        strength: calculateStrength(aSet.reps, aSet.weight),
      };
    });

    let progress = 0;
    let startStrength = 0;

    if (strengthPoints.length > 0) {
      startStrength = strengthPoints[0].strength; // get the number
      const maxStrength = Math.max(...strengthPoints.map((sp) => sp.strength));

      progress = ((maxStrength - startStrength) / startStrength) * 100;
    }

    response.push({
      startStrength: startStrength,
      muscleGroup: muscle,
      progress: progress,
      strengthPoints: strengthPoints,
    });
  });

  const totalStrength = response.reduce((sum, item) => {
    if (item.strengthPoints.length > 0) {
      const max = Math.max(...item.strengthPoints.map((sp) => sp.strength));
      return sum + max;
    }
    return sum + (item.startStrength || 0);
  }, 0);

  const totalStartStrength = response.reduce(
    (sum, item) => sum + (item.startStrength || 0),
    0,
  );

  return { strengthData: response, totalStrength, totalStartStrength };
}

export async function getTotalStrengthProgress(userId: number) {
  const progress = await getStrengthProgress(userId, "");
  return progress;
}
