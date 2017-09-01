import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.eclipse.jetty.websocket.api.Session;

import static j2html.TagCreator.*;
import static spark.Spark.*;

public class Main {
  static Map<Session, String> sessionUserIdMap = new ConcurrentHashMap<>();
  static Integer nextUserNumber = 0;

  public static void main(String[] args) {
    staticFileLocation("/public");
    webSocket("/game", GameWebSocketHandler.class);
    init();
  }

  public static void broadcastMessage(String message) {
    sessionUserIdMap.keySet().stream().filter(Session::isOpen).forEach(session-> {
      try {
        session.getRemote().sendString(message);
      } catch (Exception e) {
        e.printStackTrace();
      }
    });
  }
}
