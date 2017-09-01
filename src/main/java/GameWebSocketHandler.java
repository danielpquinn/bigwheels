import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;

import org.json.JSONObject;

@WebSocket
public class GameWebSocketHandler {
    private String sender;
    private String msg;

    @OnWebSocketConnect
    public void onConnect(Session user) throws Exception {
        Main.nextUserNumber++;
        String userId = Main.nextUserNumber.toString();
        Main.sessionUserIdMap.put(user, userId);
        String payload = String.valueOf(new JSONObject()
          .put("userId", userId)
          .put("topic", "connect")
          .put("userIds", Main.sessionUserIdMap.values()));
        Main.broadcastMessage(payload);
    }

    @OnWebSocketClose
    public void onClose(Session user, int statusCode, String reason) {
        String userId = Main.sessionUserIdMap.get(user);
        Main.sessionUserIdMap.remove(user);
        String payload = String.valueOf(new JSONObject()
          .put("userId", userId)
          .put("topic", "disconnect"));
        Main.broadcastMessage(payload);
    }

    @OnWebSocketMessage
    public void onMessage(Session user, String message) {
        String userId = Main.sessionUserIdMap.get(user);
        JSONObject messageContents = new JSONObject(message);
        messageContents.put("userId", userId);
        String payload = String.valueOf(messageContents);
        Main.broadcastMessage(String.valueOf(payload));
    }
}