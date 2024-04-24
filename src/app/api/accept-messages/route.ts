import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!user || !session) {
    return Response.json(
      {
        message: "Unauthorized",
        success: false,
      },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptMessage: acceptMessages,
      },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          message: "acceptMessages not updated",
          success: false,
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        message: "acceptMessages updated successfully",
        success: true,
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error accepting messages", error);
    return Response.json(
      {
        message: "Error accepting messages",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!user || !session) {
    return Response.json(
      {
        message: "Unauthorized",
        success: false,
      },
      { status: 401 }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          message: "User not found",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "User found",
        success: true,
        isAcceptMessages: foundUser.isAcceptMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error getting user", error);
    return Response.json(
      {
        message: "Error getting isAcceptMessages status",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
