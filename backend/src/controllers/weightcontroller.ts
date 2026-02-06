import User from "../models/User";
import ApiResponse from "../database/response";
import { Request, Response } from "express";

import stats from "../database/stats";
import { _canDo } from "./permissionController";

import stats, { getStrengthProgress } from "../database/stats";
import { Goal } from "../models/User";

// TODO change so this function adds a new 'weight goal' to the users goals array
export async function setWeightGoal(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    const { weightGoal } = req.body;

    if (!weightGoal) {
      return res.json(
        new ApiResponse({ status: "fail", data: "Weight goal is required" }),
      );
    }

    const user: User = await User.findById(userId).populate("weightLogs");


    if (!user.weightLogs || user.weightLogs.length === 0) {
      return res.json(
        new ApiResponse({ status: "fail", data: "no weightlog" }),
      );
    }

    const newGoal = await Goal.create({
      label: "Weight goal",
      goal: weightGoal,
      current: user.weightLogs[user.weightLogs.length - 1].weight,
      start: user.weightLogs[user.weightLogs.length - 1].weight,
      achieved: false,
    });

    user.goals.push(newGoal._id);


    await user.save();

    res.json(new ApiResponse({ data: user }));
  } catch (error: Error) {
    res
      .status(500)
      .json(new ApiResponse({ status: "error", message: error.message }));
  }
}

export async function setStrengthGoal(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    const { strengthGoal } = req.body;

    if (!strengthGoal) {
      return res.json(
        new ApiResponse({ status: "fail", data: "strengthGoal is required" }),
      );
    }
    const user: User = await User.findById(userId);

    const progress = await getStrengthProgress(userId);

		const previusStrengthGoal = await Goal.findOne({label:"Strength goal"}).sort({ createdAt: -1 });
		const start = previusStrengthGoal ? previusStrengthGoal.current : progress.totalStartStrength;
		
    const newGoal = await Goal.create({
      label: "Strength goal",
      goal: start * strengthGoal,
      current: progress.totalStrength,
      start: progress.totalStartStrength,
      achieved: false,
    });

    user.goals.push(newGoal._id);

    await user.save();
    res.json(new ApiResponse({ data: progress }));
  } catch (error: Error) {
    res
      .status(500)
      .json(new ApiResponse({ status: "error", message: error.message }));
  }
}

// TODO change so we filter to get the new weight goal and return the progress of that goal
export async function getWeightGoalProgress(req: Request, res: Response) {
  try {
    const progress = await stats.getWeightProgress(req.session.userId);
    res.json(new ApiResponse({ data: { progress: Math.round(progress) } }));
  } catch (error: Error) {
    res
      .status(500)
      .json(new ApiResponse({ status: "error", data: error.message }));
  }
}
