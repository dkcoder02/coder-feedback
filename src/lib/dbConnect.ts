import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

//* void used to do no know what value is returned

export async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("DB already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL || "", {});
    connection.isConnected = db.connections[0].readyState;

    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connection Failed", error);
    process.exit(1);
  }
}
