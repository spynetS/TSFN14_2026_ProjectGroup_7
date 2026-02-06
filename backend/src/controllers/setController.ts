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

	if(!req.session.userId) return res.status(401).json(new ApiResponse({status:"fail"}));

	const user:User = await User.findById(req.session.userId)
	
		Set.find({user:user})
    .populate("template") // replace ObjectIds in exercises with the actual Exercise documents
    .populate("user", "name email") // optionally select only certain fields from user
    .sort({ createdAt: 1 }) // oldest first
    .then((found) => {
      res.json(new ApiResponse({ data: found }));
    })
    .catch((error) => {
      res.json(new ApiResponse({ status: "error", message: error.message }));
    });
}

export async function createSet(req: e.Request, res: e.Response) {
  const { reps, weight, duration, template } = req.body;

	const userObj:User = await User.findById(req.session.userId).populate("goals");
	const templateObj :ExerciseTemplate = await ExerciseTemplate.findById(template);
	
  const payload = {
    reps: Number(reps),
    weight: Number(weight),
    duration: Number(duration),
    user:userObj._id,
    template:templateObj._id
  };

  Set.create(payload)
    .then((status) => {
      res.json(new ApiResponse({ data: status }));
    })
    .catch((err) => {
      res.json(new ApiResponse({ status: "error", message: err.message }));
    });


	const strength = calculateStrength(reps,weight);
	addXp(userObj,strength);
	

  const strengthGoal = userObj.goals.find(
    (goal: Goal) => goal.label === "Strength goal" && !goal.achieved,
  );
  strengthGoal.current = (
    await getStrengthProgress(userObj._id, "")
  ).totalStrength;
  await strengthGoal.save();
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
