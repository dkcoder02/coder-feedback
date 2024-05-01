import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!_user || !session) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

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
    ]).exec();

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
        messages: user[0].messages,
        success: true,
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
