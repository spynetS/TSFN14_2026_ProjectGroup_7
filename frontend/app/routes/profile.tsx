import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Page from "~/components/page";
import type { User } from "~/models/User";
import { apiFetch } from "~/api";
import { IoMdNotifications } from "react-icons/io";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [weightGoal, setWeightGoal] = useState<string>("");
  const [strengthGoal, setStrengthGoal] = useState<string>("");

  useEffect(() => {
    apiFetch("/api/get-user").then((response) => {
      setUser(response.data);
    });
  }, []);

  const handleSubmit = async (): Promise<void> => {
		//    console.log("Submitted!");
  };

  const lastWeight =
    user?.weightLogs && user.weightLogs.length > 0
      ? user.weightLogs[user.weightLogs.length - 1].weight
      : "-";

  const progressValue =
    user?.xp && user?.level
      ? (user.xp / (100 * user.level ** 2)) * 100
      : 0;

  return (
    <Page>
      {/* Notification Button */}
      <Link
        to="/notifications"
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-base-100 shadow-lg flex items-center justify-center"
      >
        <IoMdNotifications className="w-6 h-6 text-gray-700" />
      </Link>

      {/* Profile Header */}
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full flex justify-center">
          <div className="w-full max-w-xl h-56 bg-gradient-to-r from-blue-400 to-purple-500 rounded-b-3xl"></div>

          {/* Avatar */}
          <div className="absolute top-36 flex flex-col items-center w-full">
            <div className="avatar">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                  alt="User Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-16 flex flex-col items-center space-y-2">
          <button className="hidden btn btn-xs text-blue-800 font-bold">Edit Profile</button>
          <h1 className="text-4xl font-bold text-center">{user?.name || "Loading..."}</h1>
          <p className="text-sm italic text-center text-gray-600">
            Joined Fitness Duel on September 18, 2025
          </p>

          {/* Level */}
          <div className="flex flex-col items-center mt-4">
            <p className="text-2xl font-semibold mb-2">Level</p>
            <div
              className="radial-progress text-primary font-bold"
              style={{ "--value": progressValue } as React.CSSProperties}
            >
              {user?.level || 0}
            </div>
          </div>

          {/* Stats */}
          <div className="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full max-w-lg">
            <div className="stat">
              <div className="stat-title">Friends</div>
              <Link to="/friends" className="btn btn-primary btn-sm">
                Manage Friends
              </Link>
            </div>

            <div className="stat">
              <div className="stat-title">Weight</div>
              <div className="stat-value">{lastWeight} kg</div>
            </div>


          </div>
        </div>
      </div>
    </Page>
  );
}
