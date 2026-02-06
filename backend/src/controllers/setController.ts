import type e from "express";
import Set from "../models/Set";
import ApiResponse from "../database/response";

import { getStrengthProgress } from "../database/stats";
import User from "../models/User";
import ExerciseTemplate from "../models/ExerciseTemplate";

import _stats, { calculateStrength } from "../database/stats";
import User from "../models/User";
import { addXp } from "./userController"


export async function getSets(req: e.Request, res: e.Response) {
		try {
				const targetUserId = req.body.user || req.session.userId;
				console.log(targetUserId)
				if (!targetUserId) {
						return res
								.status(401)
								.json(
										new ApiResponse({ status: "fail", data: "No user specified" }),
								);
				}

				const user: User | null = await User.findById(targetUserId);
				if (!user) {
						return res
								.status(404)
								.json(new ApiResponse({ status: "fail", data: "User not found" }));
				}

				const found = await Set.find({ user: user._id })
															 .populate("template")
															 .populate("user", "name email")
															 .sort({ createdAt: 1 });

				res.json(new ApiResponse({ data: found }));
		} catch (error) {
				res
						.status(500)
						.json(new ApiResponse({ status: "error", message: error.message }));
		}
}

export async function createSet(req: e.Request, res: e.Response) {
    try {
        const { reps, weight, duration, template, user } = req.body;

        const targetUserId = user || req.session.userId;
        if (!targetUserId) {
            return res
                .status(400)
                .json(new ApiResponse({ status: "error", message: "User ID not provided" }));
        }

        const userObj: User | null = await User.findById(targetUserId);
        if (!userObj) {
            return res
                .status(404)
                .json(new ApiResponse({ status: "error", message: "User not found" }));
        }

        const templateObj: ExerciseTemplate | null = await ExerciseTemplate.findById(template);
        if (!templateObj) {
            return res
                .status(404)
                .json(new ApiResponse({ status: "error", message: "Template not found" }));
        }

        const payload = {
            reps: Number(reps),
            weight: Number(weight),
            duration: Number(duration),
            user: targetUserId,
            template: templateObj._id,
        };

        const newSet = await Set.create(payload);
        res.json(new ApiResponse({ data: newSet }));

        // Update XP
        const strength = calculateStrength(Number(reps), Number(weight));
        addXp(userObj, strength);

        // Update strength goal
        const strengthGoal = userObj.goals.find(
            (goal: Goal) => goal.label === "Strength goal" && !goal.achieved
        );

        if (strengthGoal) {
            const progress = await getStrengthProgress(userObj._id, "");
            strengthGoal.current = progress.totalStrength;
            await strengthGoal.save();
        }

    } catch (error: any) {
        res
            .status(500)
            .json(new ApiResponse({ status: "error", message: error.message }));
    }
}


export async function deleteSet(req: e.Request, res: e.Response) {
		if (!("id" in req.body)) {
				res.json(new ApiResponse({ status: "fail", data: "No id was provided!" }));
				return;
		}
		const set: Set = Set.findById(req.body.id);
		Set.deleteOne(set)
			 .then((status) => {
					 res.json(new ApiResponse({ data: status }));
			 })
			 .catch((error) => {
					 res.json(new ApiResponse({ status: "error", message: error.message }));
			 });
}
