const { validationResult } = require("express-validator");
const { listPendingDoctors, updateUserStatus, createResponder } = require("../services/adminService");

const getPendingDoctors = async (req, res) => {
  const result = await listPendingDoctors();
  return res.status(result.status).json(result.data);
};

const patchUserStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const result = await updateUserStatus({ userId: req.params.id, status: req.body.status });
  return res.status(result.status).json(result.data);
};

const postCreateResponder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const result = await createResponder(req.body);
  return res.status(result.status).json(result.data);
};

module.exports = { getPendingDoctors, patchUserStatus, postCreateResponder };
