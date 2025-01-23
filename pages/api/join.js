import sdk from "matrix-js-sdk";
import matrixClient from "@/utils";
/**
 * Join a room
 * @param {string} accessToken
 * @param {string} roomIdOrAlias
 * @returns {Promise} The response from the server containing the room ID
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { accessToken, roomIdOrAlias } = req.body;

    if (!accessToken || !roomIdOrAlias) {
        return res.status(400).json({ error: "Missing required fields: accessToken, roomIdOrAlias" });
    }

    try {

        matrixClient.setAccessToken(accessToken);

        // Join the room
        const response = await matrixClient.joinRoom(roomIdOrAlias);

        return res.status(200).json({
            message: "Successfully joined the room",
            roomId: response.room_id,
        });
    } catch (error) {
        console.error("Failed to join the room:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
