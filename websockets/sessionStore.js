// eslint-disable-next-line no-unused-vars
const { default: Redis } = require("ioredis");

/* abstract */ class SessionStore {
    // eslint-disable-next-line no-unused-vars
    findSession(id) {}
    // eslint-disable-next-line no-unused-vars
    saveSession(id, session) {}
    findAllSessions() {}
  }

class InMemorySessionStore extends SessionStore {
    constructor() {
        super();
        this.sessions = new Map();
    }

    findSession(id) {
        return this.sessions.get(id);
    }

    saveSession(id, session) {
        this.sessions.set(id, session);
    }

    findAllSessions() {
        return [...this.sessions.values()];
    }
}

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userId, lastNotifId, token, connected]) =>
  userId ? { userId: parseInt(userId), lastNotifId: parseInt(lastNotifId), token, connected: connected === "true" } : undefined;

class RedisSessionStore extends SessionStore {
    /**
     * @type {Redis}
     */
    redisClient;
    constructor(redisClient) {
        super();
        this.redisClient = redisClient;
    }

    /**
     * Retourne la session si elle existe
     * @param {number} id - Key Redis
     * @returns {Promise<mapSession | null>}
     */
    findSession(id) {
        return this.redisClient
            .hmget(`session:${id}`, "userId", "lastNotifId", "token", "connected")
            .then(mapSession);
    }
    /**
     * Sauver la session
     * @param {string} id - Key Redis
     * @param {Object} param1 - Les données à sauver
     * @param {number} param1.userId - L'ID du membre
     * @param {number} param1.lastNotifId - L'ID de la dernière notification
     * @param {string} param1.token - Le token de l'API BS
     * @param {boolean} param1.connected - L'état de connexion de la socket
     */
    saveSession(id, { userId, lastNotifId, token, connected }) {
        this.redisClient
            .multi()
            .hset(
                `session:${id}`,
                "userId",
                userId,
                "lastNotifId",
                lastNotifId,
                "token",
                token,
                "connected",
                connected
            )
            .expire(`session:${id}`, SESSION_TTL)
            .exec();
    }

    async findAllSessions() {
        const keys = new Set();
        let nextIndex = 0;
        do {
            const [nextIndexAsStr, results] = await this.redisClient.scan(
                nextIndex,
                "MATCH",
                "session:*",
                "COUNT",
                "100"
            );
            nextIndex = parseInt(nextIndexAsStr, 10);
            results.forEach((s) => keys.add(s));
        } while (nextIndex !== 0);
        const commands = [];
        keys.forEach((key) => {
            commands.push(["hmget", key, "userId", "lastNotifId", "token", "connected"]);
        });
        return this.redisClient
            .multi(commands)
            .exec()
            .then((results) => {
                return results
                    .map(([err, session]) => (err ? undefined : mapSession(session)))
                    .filter((v) => !!v);
            });
    }
}
module.exports = {
    InMemorySessionStore,
    RedisSessionStore,
};