import sdk from "matrix-js-sdk";

/**
 * Fetch messages from a room
 * @param {string} accessToken
 * @param {string} roomId
 * @returns {Promise} The messages from the room with the given ID
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    const { accessToken, roomId } = req.query;

    if (!accessToken || !roomId) {
        return res.status(400).json({ error: "Missing required fields: accessToken, roomId" });
    }

    try {
        // Create a client with an associated user
        const client = sdk.createClient({
            baseUrl: "http://localhost:8008",
            accessToken: accessToken,
            userId: "@testuser2:localhost",
        });

        // Start synchro with a client already connected
        await client.startClient({ initialSyncLimit: 10 });
        await new Promise((resolve, reject) => {
            client.once('sync', (state) => {
                if (state === 'PREPARED') {
                    resolve();
                } else {
                    reject(new Error(`Sync failed with state: ${state}`));
                }
            });
        });

        // Get the room
        const room = client.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found or not joined by this user.`);
        }

        // Get messages
        const timeline = room.getLiveTimeline();
        const messages = timeline.getEvents()
            .filter(event => event.getType() === "m.room.message")
            .map(event => ({
                sender: event.getSender(),
                body: event.getContent().body,
                type: event.getType(),
                timestamp: event.getTs(),
            }));

        res.status(200).json({ roomId, messages });
    } catch (error) {
        console.error("Failed to fetch messages:", error.message);
        res.status(500).json({ error: error.message });
    }
}
