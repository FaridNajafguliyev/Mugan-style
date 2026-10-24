import rateLimit from "express-rate-limit";

// Admin login sees legitimate traffic only a handful of times a day — this
// caps brute-force password guessing without affecting real usage.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много попыток входа — подождите 15 минут и попробуйте снова" },
});
