### README.md

# Matrix Message Reader

This project demonstrates how to set up a local Matrix Synapse server and use a Matrix client to register a user, join a room, send messages, and fetch those messages.
<img width="1796" alt="image" src="https://github.com/user-attachments/assets/ed4ae99d-d560-4860-b4eb-e464cedec448" />

## Setup Instructions

### 1. Run Synapse Server
1. Pull and run the official Synapse Docker image:
   ```bash
   docker pull matrixdotorg/synapse:latest
   docker run -d --name synapse -v "$(pwd)/data:/data" -p 8008:8008 matrixdotorg/synapse:latest
   ```
2. Generate configuration:
   ```bash
   docker run -it --rm -v "$(pwd)/data:/data" -e SYNAPSE_SERVER_NAME=localhost -e SYNAPSE_REPORT_STATS=no matrixdotorg/synapse:latest generate
   ```
3. Update default configuration to allow registration.
    Update the `homeserver.yaml` by adding these 2 lines:
    ```yaml
    enable_registration: true
    enable_registration_without_verification: true
    ```
### 2. Register a User
Use the `/register` endpoint:
```bash
curl -X POST "http://localhost:8008/_matrix/client/v3/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword",
    "auth": { "type": "m.login.dummy" }
  }'
```

### 3. Log in and Get Access Token
Log in to retrieve an access token:
```bash
curl -X POST "http://localhost:8008/_matrix/client/v3/login" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "m.login.password",
    "user": "@testuser:localhost",
    "password": "securepassword"
  }'
```

### 4. Create a Room
Create a new room:
```bash
curl -X POST "http://localhost:8008/_matrix/client/v3/createRoom" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_alias_name": "test-room",
    "visibility": "private"
  }'
```

### 5. Join the Room
Join the created room:
```bash
curl -X POST "http://localhost:8008/_matrix/client/v3/join/%21ROOM_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Send Messages
Send a message to the room:
```bash
curl -X POST "http://localhost:8008/_matrix/client/v3/rooms/%21ROOM_ID/send/m.room.message" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "m.text",
    "body": "Hello, Matrix!"
  }'
```

### 7. Read Messages
Fetch messages from the room using the `/api/getMessages` endpoint:
```bash
curl -X GET "http://localhost:3000/api/getMessages?accessToken=YOUR_ACCESS_TOKEN&roomId=!ROOM_ID"
```

---

## Debug Checklist

### General
- Ensure the Synapse server is running and accessible at `http://localhost:8008`.

### User-Related
1. **Validate Access Token**: Confirm the token is valid and belongs to the user:
   ```bash
   curl -X GET "http://localhost:8008/_matrix/client/v3/account/whoami" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```
   Ensure the returned `user_id` matches the expected user.

2. **Check User Membership**: Confirm the user is a member of the room:
   ```bash
   curl -X GET "http://localhost:8008/_matrix/client/v3/rooms/%21ROOM_ID/members" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Room-Related
1. **Verify Room Exists**: Ensure the room exists:
   ```bash
   curl -X GET "http://localhost:8008/_matrix/client/v3/rooms/%21ROOM_ID/state" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```
2. **Check History Visibility**: Verify history visibility allows access:
   ```bash
   curl -X GET "http://localhost:8008/_matrix/client/v3/rooms/%21ROOM_ID/state/m.room.history_visibility" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### API-Specific
1. **Client Synchronization**: Ensure the client syncs successfully before accessing the room:
   - Log the state: `User is in rooms: [...]`
2. **Filter Messages**: Use the correct filters to fetch only `m.room.message` events.

---

## Key Insights from Troubleshooting
- Always set the `userId` explicitly in the Matrix client.
- Ensure `history_visibility` is `shared` or `world_readable` for message access.
- Debug `/sync` and `/members` endpoints to confirm room data.
