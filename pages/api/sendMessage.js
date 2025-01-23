import sdk from "matrix-js-sdk";
import matrixClient from "@/utils";

/**
 * Send a message to a room
 * @param {string} accessToken
 * @param {string} roomId
 * @param {string} message
 * @returns {Promise} The response from the server containing the event ID
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { accessToken, roomId, message } = req.body;

    if (!accessToken || !roomId || !message) {
        return res.status(400).json({ error: "Missing required fields: accessToken, roomId, message" });
    }

    try {
        matrixClient.setAccessToken(accessToken);

        // Send the message and generate a transaction ID
        const txnId = `m${Date.now()}`;
        const response = await matrixClient.sendEvent(roomId, "m.room.message", {
            msgtype: "m.text",
            body: message,
        }, txnId);

        return res.status(200).json({
            message: "Message sent successfully",
            eventId: response.event_id,
        });
    } catch (error) {
        console.error("Failed to send message:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
