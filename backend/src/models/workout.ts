import { Schema, model, Document } from "mongoose";

// 1. Define an interface for TypeScript
export interface IWorkout extends Document {
  title: string;
  exercises: Schema.Types.ObjectId[];
  weekday: string;

  user: Schema.Types.ObjectId;
  createdAt: Date;
}

// 2. Define the schema
const workoutSchema = new Schema<IWorkout>({
  title: { type: String, required: true },
  exercises: [{ type: Schema.Types.ObjectId, ref: "ExerciseTemplate" }],
  weekday: { type: String, required: true },

  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});
workoutSchema.index({ user: 1, title: 1 }, { unique: true });
// 3. Create the model
const Workout = model<IWorkout>("Workout", workoutSchema);

export default Workout;
