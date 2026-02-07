import { Request, Response } from "express";
import { Types } from "mongoose";
import ApiResponse from "../database/response";
import Set from "../models/Set";                 // <-- adjust path if needed
import User from "../models/User";               // already in your repo

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.session?.userId as string | undefined;
    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse({ status: "fail", message: "Not logged in", data: [] }));
    }

    const start = startOfToday();
    const end = endOfToday();

    // 1) Did the user train today? (any Set logged today)
    // If you track workouts elsewhere, replace Set with your model and date field.
    const trainedToday = async (id:number) => { return !!(await Set.findOne({
      user: new Types.ObjectId(id),
      createdAt: { $gte: start, $lte: end },
    }).lean());
  }

    // 3) Build notifications list
    const notifications: { id: string; message: string; kind?: "info" | "warning" | "success" }[] = [];


    const user: User = await User.findById(userId).populate("friends");

    await user.friends.forEach(async (friend: User) => {
      if(await trainedToday(friend._id)){
        const shown = friend.name;
        notifications.push({
          id: "friends-trained",
          message: `${shown} has trained—you should do that too!`,
          kind: "success",
        });
      }
      })
    


    if (!(await trainedToday(userId))) {
      notifications.push({ id: "should-train", message: "You should train today.", kind: "info" });
      notifications.push({ id: "not-trained", message: "You haven’t trained today.", kind: "warning" });

      ///if (friendNames.length) {
       /// const shown = friendNames.slice(0, 3).join(", ");
        //const extra = friendNames.length > 3 ? ` and ${friendNames.length - 3} others` : "";
        //notifications.push({
         // id: "friends-trained",
          // message: `${shown}${extra} has trained—you should do that too!`,
          //kind: "success",
       // });
      // }
    }

    return res.json(new ApiResponse({ data: notifications }));
  } catch (err: Error) {
    console.error(err);
    return res
      .status(500)
      .json(new ApiResponse({ status: "error", message: err.message, data: [] }));
  }
}
