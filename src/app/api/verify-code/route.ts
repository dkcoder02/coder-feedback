import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { NextRequest } from "next/server";

const CodeQuerySchema = verifySchema;

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const queryParams = {
      code,
    };

    const result = CodeQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const verifyCodeErrors = result.error.format().code?._errors || [];
      return Response.json(
        {
          message:
            verifyCodeErrors.length > 0
              ? verifyCodeErrors.join(",")
              : "Invalid query parameters",
          success: false,
        },
        { status: 400 }
      );
    }

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const isCodeCorrect = user.verifyCode === code;
    const isNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeCorrect && isNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code has expired please request a new code",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.log("Error verifying code", error);
    return Response.json(
      {
        message: "Error verifying code",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
