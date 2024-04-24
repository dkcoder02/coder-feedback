import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // $unwind is used to deconstruct the array of messages
    // $sort is used to sort the messages in descending order
    // $group is used to group the messages by the user id
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: {
          "messages.createAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: "$messages",
          },
        },
      },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          message: "User not found",
          success: false,
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        message: user[0].messages,
        success: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error getting messages", error);
    return Response.json(
      {
        message: "Error getting messages",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
