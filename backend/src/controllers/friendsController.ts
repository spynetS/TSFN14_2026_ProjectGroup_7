import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import mongoose from "mongoose";
import Set from "../models/Set";
import ApiResponse from "../database/response";

function getUserId(req: Request): string | undefined {
  return req.session.userId;
}

export function makeCode(): string {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 hex chars
  return `FD-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * GET /api/friends
 * Returns the user's friends. Also ensures the caller has a friendCode.
 */
export async function getFriends(req: Request, res: Response) {
  const uid = req.body.user || getUserId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  console.log (uid)
  const me = await User.findById(uid);
  if (me===null|| me===undefined) return res.status(404).json({ message: "User not found" });

  // Ensure caller has a friendCode
  if (!me.friendCode) {
    me.friendCode = makeCode();
    await me.save();
  }

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

  const start = startOfToday();
  const end = endOfToday();

  const populated = await me.populate("friends", "name email friendCode");
  const friends = await Promise.all(
    (populated.friends as User[]).map(async (f) => ({
      _id: String(f._id),
      name: f.name,
      email: f.email,
      friendCode: f.friendCode,
      lastTrainedAt: (
        await Set.findOne({
          user: new mongoose.Types.ObjectId(f._id),
          createdAt: { $gte: start, $lte: end },
        }).lean()
      )?.createdAt,
    })),
  );

  return res.json(
    new ApiResponse({
      data: {
        friendCode: me.friendCode, // handy for the page header
        friends: friends,
      },
    }),
  );
}

/**
 * POST /api/friends
 * Body: { code: string }
 * Adds the user with that friendCode to the caller's friends (bidirectional, idempotent).
 */
export async function addFriend(req: Request, res: Response) {
  const uid = req.body.user || getUserId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const { code } = (req.body || {}) as { code?: string };
  if (!code) return res.status(400).json({ message: "Friend code required" });

  const me = await User.findById(uid);
  if (!me) return res.status(404).json({ message: "User not found" });

  // Ensure the caller has a code (first-time)
  if (!me.friendCode) {
    me.friendCode = makeCode();
    await me.save();
  }

  const other = await User.findOne({ friendCode: code.trim() });
  if (!other)
    return res.status(404).json({ message: "No user with that code" });
  if (String(other._id) === String(me._id))
    return res.status(400).json({ message: "You can’t add yourself" });

  // Add both ways (idempotent)
  const meHas = me.friends?.some((id: string) => String(id) === String(other._id));
  const otherHas = other.friends?.some(
    (id: string) => String(id) === String(me._id),
  );

  if (!meHas) me.friends.push(other._id as string);
  if (!otherHas) other.friends.push(me._id as string);

  await me.save();
  await other.save();

  return res.status(201).json({ message: "Friend added" });
}
