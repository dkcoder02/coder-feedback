import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  await dbConnect();

  const messageId = params.messageid;
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

  try {
    const updateResult = await UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        $pull: {
          messages: {
            _id: messageId,
          },
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 }
    );
  }
}
