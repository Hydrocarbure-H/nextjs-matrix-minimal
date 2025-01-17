import { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";

export default function ChatComponent() {
    const [userId, setUserId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [roomId, setRoomId] = useState("!cMsVuhYYsktMNsiNXM:localhost");
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);


    const startMatrixClient = () => {
        if (!userId || !accessToken) {
            alert("Please provide a valid User ID and Access Token");
            return;
        }

        const matrixClient = sdk.createClient({
            baseUrl: "http://localhost:8008",
            accessToken: accessToken,
            userId: userId,
        });

        matrixClient.startClient({ initialSyncLimit: 10 });
        setClient(matrixClient);

        matrixClient.once("sync", (state) => {
            if (state === "PREPARED") {
                console.log("Matrix client synced!");
            }
        });

        matrixClient.on("Room.timeline", (event, room, toStartOfTimeline) => {
            if (event.getType() === "m.room.message" && room.roomId === roomId) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: event.getSender(),
                        body: event.getContent().body,
                        timestamp: event.getTs(),
                    },
                ]);
            }
        });
    };

    useEffect(() => {
        return () => {
            if (client) {
                client.stopClient();
                console.log("Matrix client stopped!");
            }
        };
    }, [client]);

    return (
        <div>
            <h1>Matrix Chat</h1>
            <div>
                <label htmlFor="userId">User ID:</label>
                <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="@youruser:localhost"
                />
            </div>
            <div>
                <label htmlFor="accessToken">Access Token:</label>
                <input
                    type="text"
                    id="accessToken"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="syt_..."
                />
            </div>
            <div>
                <button onClick={startMatrixClient}>Start Chat</button>
            </div>
            <div>
                <h2>Messages in Room: {roomId}</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>
                            <strong>{msg.sender}</strong>: {msg.body} <em>({new Date(msg.timestamp).toLocaleString()})</em>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
