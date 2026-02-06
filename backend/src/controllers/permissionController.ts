import User, { Permission } from "../models/User";

export async function canDo(user: User, modelType: string, action: string): Promise<boolean> {
  const permissions: Permission[] = await Permission.find({ user, modelType });

  if (!permissions || permissions.length === 0) {
    throw new Error("Permission denied");
  }

  for (const perm of permissions) {
    if (perm.action === action) {
      return true; // ✅ returns from canDo
    }
  }

  throw new Error("Permission denied");
}


export async function setNewPermission(user: User,modelType:string, action: string, ) {

		const _permission = await Permission.create({
    action: action,
    user: user._id,
    modelType: modelType,
  });
	
}
