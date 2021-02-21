const crypto = require("crypto");

ACCESS_KEYS = crypto.randomBytes(32).toString("hex");
REFERESH_KEYS = crypto.randomBytes(32).toString("hex");
