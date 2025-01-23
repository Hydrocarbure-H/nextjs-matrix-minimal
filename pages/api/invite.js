import * as sdk from "matrix-js-sdk";
import matrixClient from "@/utils";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { accessToken, roomId, userId } = req.body;

    if (!accessToken || !roomId || !userId) {
        return res.status(400).json({ error: "Missing required fields: accessToken, roomId, userId" });
    }

    try {

        await matrixClient.invite(roomId, userId);

        res.status(200).json({ success: true, message: `User ${userId} invited to room ${roomId}` });
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ error: error.message });
    }
}
