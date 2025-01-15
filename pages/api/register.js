import client from "../../utils/matrix";

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @returns {Promise} The response from the server containing the user ID
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password } = req.body;

    try {
        const response = await client.registerRequest({
            username,
            password,
            auth: { type: "m.login.dummy" },
        });
        return res.status(200).json({ userId: response.user_id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

