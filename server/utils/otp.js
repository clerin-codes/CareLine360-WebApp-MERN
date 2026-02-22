const crypto = require("crypto");

const generateOtp = () => String(crypto.randomInt(100000, 1000000)); // 6 digit

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

module.exports = { generateOtp, hashOtp };
