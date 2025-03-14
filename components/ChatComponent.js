"use client";


import { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";

export default function ChatComponent() {
    const [userId, setUserId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [roomId, setRoomId] = useState("!cMsVuhYYsktMNsiNXM:localhost");
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);
    const [message, setMessage] = useState(""); // État pour le message

    const sendMessage = async () => {
        if (!message.trim()) {
            alert("Message cannot be empty");
            return;
        }
        if (!client) {
            alert("Matrix client is not initialized");
            return;
        }

        try {
            const txnId = `m${Date.now()}`; // Génération d'un ID unique pour la transaction
            await client.sendEvent(roomId, "m.room.message", {
                msgtype: "m.text",
                body: message,
            }, txnId);
            console.log("Message sent:", message);
            setMessage(""); // Réinitialise le champ d'entrée après l'envoi
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send the message");
        }
    };

    const startMatrixClient = async () => {
        if (!userId || !accessToken) {
            alert("Please provide a valid User ID and Access Token");
            return;
        }

        const matrixClient = sdk.createClient({
            baseUrl: "http://localhost:8008",
            accessToken: accessToken,
            userId: userId,
            cryptoStore: new sdk.IndexedDBCryptoStore(window.indexedDB, "matrix-client-crypto"),
        });

        await matrixClient.initRustCrypto();

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
        const storedUserId = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const storedAccessToken = document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1");

        setAccessToken(storedAccessToken);
        setUserId(storedUserId);
    });

    useEffect(() => {
        return () => {
            if (client) {
                client.stopClient();
                console.log("Matrix client stopped!");
            }
        };
    }, [client]);

    return (
        <div style={{ fontFamily: "Arial, sans-serif", height: "99vh", display: "flex", flexDirection: "column" }}>
            {/* Navbar */}
            <header style={{
                backgroundColor: "rgb(0, 124, 232)",
                color: "white",
                padding: "15px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "15px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}>
                Matrix Chat
            </header>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f5f5f5",
            }}>
                {/* Message List */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}>
                    {messages.map((msg, index) => {
                        const isOwnMessage = msg.sender === userId;
                        return (
                            <div key={index} style={{
                                display: "flex",
                                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                            }}>
                                <div
                                    style={{
                                        padding: "10px",
                                        backgroundColor: isOwnMessage ? "rgb(0, 124, 232)" : "rgb(226, 224, 224)",
                                        borderRadius: "15px",
                                        color: isOwnMessage ? "white" : "black",
                                        maxWidth: "40%",
                                        wordWrap: "break-word",
                                    }}
                                >
                                    <p style={{ margin: 0 }}>{msg.body}</p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "0.7em",
                                        textAlign: "right",
                                        color: isOwnMessage ? "lightgray" : "gray",
                                    }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* User Input */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px",
                    backgroundColor: "white",
                    boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                    }}>
                        <input
                            style={{
                                flex: 1,
                                borderRadius: "5px",
                                padding: "10px",
                                fontSize: "14px",
                                border: "1px solid #ccc",
                            }}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button
                            style={{
                                borderRadius: "5px",
                                padding: "10px 15px",
                                backgroundColor: "rgb(0, 124, 232)",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                transition: "transform 0.1s",
                            }}
                            onClick={sendMessage}
                            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
                            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                        >
                            Send
                        </button>
                    </div>

                    <input
                        style={{
                            marginBottom: "10px",
                            borderRadius: "5px",
                            padding: "10px",
                            fontSize: "14px",
                            border: "1px solid #ccc",
                        }}
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => {
                            setUserId(e.target.value);
                            document.cookie = `userId=${e.target.value}`;
                            //sessionStorage.setItem("userId", e.target.value)
                        }}
                        placeholder="@youruser:localhost"
                    />
                    <input
                        style={{
                            marginBottom: "10px",
                            borderRadius: "5px",
                            padding: "10px",
                            fontSize: "14px",
                            border: "1px solid #ccc",
                        }}
                        type="text"
                        id="accessToken"
                        value={accessToken}
                        onChange={(e) => {
                            setAccessToken(e.target.value);
                            document.cookie = `accessToken=${e.target.value}`;
                        }}
                        placeholder="syt_..."
                    />
                    <button
                        style={{
                            borderRadius: "5px",
                            padding: "10px",
                            backgroundColor: "rgb(0, 124, 232)",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                            transition: "transform 0.1s",
                            width: "fit-content",
                            margin: "auto",
                        }}
                        onClick={startMatrixClient}
                        onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
                        onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
