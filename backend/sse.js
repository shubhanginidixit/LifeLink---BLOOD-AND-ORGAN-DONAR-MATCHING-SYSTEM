const jwt = require("jsonwebtoken");

const clients = new Map(); // Map of userId -> Set of Response objects

function initSSE(app) {
  app.get("/api/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    
    // Support token from query string
    const token = req.query.token;
    if (!token) {
      res.status(401).end("Authentication required");
      return;
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      res.status(401).end("Invalid token");
      return;
    }

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    const userClients = clients.get(userId);
    userClients.add(res);

    // Initial connection event
    res.write(`event: connect\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

    // Emit online users immediately
    emitToAll("online-users", Array.from(clients.keys()));

    // Keep-alive heartbeat every 15 seconds
    const interval = setInterval(() => {
      res.write(":\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(interval);
      userClients.delete(res);
      if (userClients.size === 0) {
        clients.delete(userId);
        emitToAll("online-users", Array.from(clients.keys()));
      }
    });
  });
}

function isUserOnline(userId) {
  return clients.has(userId) && clients.get(userId).size > 0;
}

function emitToUser(userId, event, data) {
  const userClients = clients.get(userId);
  if (userClients) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of userClients) {
      res.write(payload);
    }
  }
}

function emitToAll(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const userClients of clients.values()) {
    for (const res of userClients) {
      res.write(payload);
    }
  }
}

module.exports = { initSSE, isUserOnline, emitToUser, emitToAll };
