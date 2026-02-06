import type e from "express";
import Workout from "../models/workout";
import ApiResponse from "../database/response";

import User from "../models/User";

export async function getWorkout(req: e.Request, res: e.Response) {

	if(!req.session.userId) return res.status(401).json(new ApiResponse({status:"fail"}));

	const user: User = await User.findById(req.session.userId);
	
  Workout.find({user:user})
    .populate("exercises") // replace ObjectIds in exercises with the actual Exercise documents
    .populate("user", "name email") // optionally select only certain fields from user
    .then((found) => {
      res.json(new ApiResponse({ data: found }));
    })
    .catch((error) => {
      res.json(new ApiResponse({ status: "error", message: error.message }));
    });
}

export async function createWorkout(req: e.Request, res: e.Response) {
  // Ensure body exists
  if (!req.body) {
    return res.json(
      new ApiResponse({ status: "fail", data: "Request body missing" }),
    );
  }

  const body = req.body;

  if (!req.session.userId)
    return res.json(
      new ApiResponse({ status: "fail", data: "Must log in first" }),
    );

  const user = await User.findById(req.session.userId);
  if (!user)
    return res.json(
      new ApiResponse({ status: "fail", data: "User not found" }),
    );

  body.user = user._id; // now safe

  Workout.create(body)
    .then((status) => {
      res.json(new ApiResponse({ data: status }));
    })
    .catch((err) => {
      res.json(new ApiResponse({ status: "error", message: err.message }));
    });
}

export async function deleteWorkout(req: e.Request, res: e.Response) {
  if (!("id" in req.body)) {
    res.json(
      new ApiResponse({ status: "error", message: "No id was provided!" }),
    );
    return;
  }
  const workout: Workout = Workout.findById(req.body.id);
  Workout.deleteOne(workout)
    .then((status) => {
      res.json(new ApiResponse({ data: status }));
    })
    .catch((error) => {
      res.json(new ApiResponse({ status: "error", message: error.message }));
    });
}

export async function updateWorkout(req: e.Request, res: e.Response) {
  try {
    // Ensure body exists
    if (!req.body) {
      return res.json(
        new ApiResponse({ status: "fail", data: "Request body missing" }),
      );
    }

    const { id } = req.params; // e.g. /api/workouts/:id
    const body = req.body;

    if (!req.session.userId)
      return res.json(
        new ApiResponse({ status: "fail", data: "Must log in first" }),
      );

    const user = await User.findById(req.session.userId);
    if (!user)
      return res.json(
        new ApiResponse({ status: "fail", data: "User not found" }),
      );

    // Find workout by ID and ensure it belongs to this user
    const workout = await Workout.findOne({ _id: id, user: user._id });
    if (!workout)
      return res.json(
        new ApiResponse({ status: "fail", data: "Workout not found" }),
      );

    // Update allowed fields only
    Object.assign(workout, body);

    await workout.save();

    const updatedWorkout = await Workout.findById(id)
      .populate("exercises")
      .populate("user", "name email");

    res.json(new ApiResponse({ data: updatedWorkout }));
  } catch (err: Error) {
    res.json(new ApiResponse({ status: "error", message: err.message }));
  }
}
