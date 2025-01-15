import sdk from "matrix-js-sdk";

const client = sdk.createClient({
    baseUrl: "http://localhost:8008",
});
/**
 * Login a user
 * @param {string} username
 * @param {string} password
 * @returns {Promise} The response from the server containing the access token
 * @throws {Error} If the request fails
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password } = req.body;

    try {
        const response = await client.login("m.login.password", {
            identifier: {
                type: "m.id.user",
                user: username,
            },
            password: password,
        });
        console.log("Access Token:", response.access_token);
        client.setAccessToken(response.access_token);
        client.startClient();
        return res.status(200).json({ accessToken: response.access_token });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
