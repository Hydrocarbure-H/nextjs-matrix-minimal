import sdk from "matrix-js-sdk";

import matrixClient from "@/utils"

/**
 * Create a new room
 * @param {string} accessToken
 * @param {string} roomAlias
 * @param {string} visibility
 * @returns {Promise} The response from the server containing the room ID
 * and room alias
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { accessToken, roomAlias, visibility } = req.body;

    if (!accessToken || !roomAlias) {
        return res.status(400).json({ error: "Missing required fields: accessToken, roomAlias" });
    }

    try {

        matrixClient.setAccessToken(accessToken);

        // Create the room with the given alias and visibility or default to private
        const response = await matrixClient.createRoom({
            room_alias_name: roomAlias,
            visibility: visibility || "private",
        });

        return res.status(200).json({
            message: "Room created successfully",
            roomId: response.room_id,
            roomAlias: response.room_alias,
        });
    } catch (error) {
        console.error("Failed to create room:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
