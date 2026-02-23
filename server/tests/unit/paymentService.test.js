const mongoose = require("mongoose");

jest.mock("../../models/Payment");

const Payment = require("../../models/Payment");
const paymentService = require("../../services/paymentService");

describe("Payment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPayment", () => {
    it("should create a payment when none exists", async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        appointment: new mongoose.Types.ObjectId(),
        patient: new mongoose.Types.ObjectId(),
        amount: 50,
        status: "pending",
        populate: jest.fn().mockReturnThis(),
      };

      Payment.findOne.mockResolvedValue(null);
      Payment.create.mockResolvedValue(mockPayment);

      const result = await paymentService.createPayment({
        appointment: mockPayment.appointment,
        patient: mockPayment.patient,
        amount: 50,
      });

      expect(result.amount).toBe(50);
      expect(result.status).toBe("pending");
    });

    it("should throw 409 if payment already exists", async () => {
      Payment.findOne.mockResolvedValue({ _id: "existing" });

      await expect(
        paymentService.createPayment({ appointment: new mongoose.Types.ObjectId() })
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("verifyPayment", () => {
    it("should verify a pending payment", async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Payment.findById.mockResolvedValue(mockPayment);

      const result = await paymentService.verifyPayment(mockPayment._id);
      expect(result.status).toBe("verified");
      expect(result.transactionRef).toBeDefined();
      expect(result.verifiedAt).toBeDefined();
    });

    it("should reject verifying non-pending payment", async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        status: "verified",
      };

      Payment.findById.mockResolvedValue(mockPayment);

      await expect(
        paymentService.verifyPayment(mockPayment._id)
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("failPayment", () => {
    it("should fail a pending payment", async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Payment.findById.mockResolvedValue(mockPayment);

      const result = await paymentService.failPayment(mockPayment._id);
      expect(result.status).toBe("failed");
    });
  });
});
