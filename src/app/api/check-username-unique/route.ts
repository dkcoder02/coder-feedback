import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    // validation with zod
    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(",")
              : "Invalid query parameters",
          success: false,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          message: "Username is already taken",
          success: false,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        message: "Username is available",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error checking username ", error);
    return Response.json(
      {
        message: "Error checking username",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
