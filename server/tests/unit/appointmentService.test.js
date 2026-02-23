const mongoose = require("mongoose");

// Mock the models and email service before requiring the service
jest.mock("../../models/Appointment");
jest.mock("../../models/User");
jest.mock("../../services/emailService", () => ({
  sendAppointmentCreated: jest.fn(),
  sendAppointmentConfirmed: jest.fn(),
  sendAppointmentRescheduled: jest.fn(),
  sendAppointmentCancelled: jest.fn(),
}));

const Appointment = require("../../models/Appointment");
const appointmentService = require("../../services/appointmentService");

describe("Appointment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAppointment", () => {
    it("should create an appointment when no double booking exists", async () => {
      const mockAppointment = {
        _id: new mongoose.Types.ObjectId(),
        patient: { name: "Alice", email: "alice@test.com" },
        doctor: { name: "Dr. Sarah", email: "sarah@test.com" },
        date: new Date("2026-03-01"),
        time: "10:00",
        status: "pending",
        populate: jest.fn().mockReturnThis(),
      };

      Appointment.findOne.mockResolvedValue(null); // no double booking
      Appointment.create.mockResolvedValue(mockAppointment);
      Appointment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppointment),
      });

      const result = await appointmentService.createAppointment({
        patient: new mongoose.Types.ObjectId(),
        doctor: new mongoose.Types.ObjectId(),
        date: "2026-03-01",
        time: "10:00",
        consultationType: "video",
      });

      expect(result).toBeDefined();
      expect(Appointment.create).toHaveBeenCalled();
    });

    it("should throw 409 when double booking detected", async () => {
      Appointment.findOne.mockResolvedValue({ _id: "existing" }); // double booking

      await expect(
        appointmentService.createAppointment({
          doctor: new mongoose.Types.ObjectId(),
          date: "2026-03-01",
          time: "10:00",
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining("already has an appointment"),
        statusCode: 409,
      });
    });
  });

  describe("transitionStatus", () => {
    it("should allow pending → confirmed", async () => {
      const mockAppt = {
        _id: new mongoose.Types.ObjectId(),
        status: "pending",
        patient: { name: "Alice", email: "alice@test.com" },
        doctor: { name: "Dr. Sarah", email: "sarah@test.com" },
        save: jest.fn().mockResolvedValue(true),
      };

      Appointment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppt),
      });

      const result = await appointmentService.transitionStatus(mockAppt._id, "confirmed");
      expect(result.status).toBe("confirmed");
    });

    it("should reject invalid transitions", async () => {
      const mockAppt = {
        _id: new mongoose.Types.ObjectId(),
        status: "completed",
        save: jest.fn(),
      };

      Appointment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppt),
      });

      await expect(
        appointmentService.transitionStatus(mockAppt._id, "confirmed")
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("deleteAppointment", () => {
    it("should only delete pending appointments", async () => {
      const mockAppt = {
        _id: new mongoose.Types.ObjectId(),
        status: "confirmed",
      };

      Appointment.findById.mockResolvedValue(mockAppt);

      await expect(
        appointmentService.deleteAppointment(mockAppt._id)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("pending"),
      });
    });
  });
});
