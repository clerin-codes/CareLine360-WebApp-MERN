const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");

const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const appointmentRoutes = require("../../routes/appointmentRoutes");
const errorHandler = require("../../middleware/errorHandler");

// Mock email service
jest.mock("../../services/emailService", () => ({
  sendAppointmentCreated: jest.fn(),
  sendAppointmentConfirmed: jest.fn(),
  sendAppointmentRescheduled: jest.fn(),
  sendAppointmentCancelled: jest.fn(),
}));

let mongoServer;
let app;
let patient, doctor;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use("/api/appointments", appointmentRoutes);
  app.use(errorHandler);

  patient = await User.create({ name: "Test Patient", email: "patient@test.com", role: "patient" });
  doctor = await User.create({ name: "Test Doctor", email: "doctor@test.com", role: "doctor", specialization: "General" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Appointment.deleteMany({});
});

describe("Appointment API", () => {
  const validAppointment = () => ({
    patient: patient._id.toString(),
    doctor: doctor._id.toString(),
    date: "2026-04-01",
    time: "10:00",
    consultationType: "video",
    symptoms: "headache",
    priority: "medium",
  });

  describe("POST /api/appointments", () => {
    it("should create an appointment", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .send(validAppointment())
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
    });

    it("should prevent double booking", async () => {
      await request(app).post("/api/appointments").send(validAppointment());

      const res = await request(app)
        .post("/api/appointments")
        .send(validAppointment())
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid data", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .send({ patient: "invalid" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/appointments", () => {
    it("should list appointments with pagination", async () => {
      await request(app).post("/api/appointments").send(validAppointment());

      const res = await request(app)
        .get("/api/appointments")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.appointments).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter by status", async () => {
      await request(app).post("/api/appointments").send(validAppointment());

      const res = await request(app)
        .get("/api/appointments?status=confirmed")
        .expect(200);

      expect(res.body.appointments).toHaveLength(0);
    });
  });

  describe("PATCH /api/appointments/:id/status", () => {
    it("should transition pending to confirmed", async () => {
      const createRes = await request(app).post("/api/appointments").send(validAppointment());
      const id = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/appointments/${id}/status`)
        .send({ status: "confirmed" })
        .expect(200);

      expect(res.body.data.status).toBe("confirmed");
    });

    it("should reject invalid transitions", async () => {
      const createRes = await request(app).post("/api/appointments").send(validAppointment());
      const id = createRes.body.data._id;

      await request(app)
        .patch(`/api/appointments/${id}/status`)
        .send({ status: "completed" })
        .expect(400);
    });
  });

  describe("PATCH /api/appointments/:id/cancel", () => {
    it("should cancel with reason", async () => {
      const createRes = await request(app).post("/api/appointments").send(validAppointment());
      const id = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/appointments/${id}/cancel`)
        .send({ reason: "Schedule conflict" })
        .expect(200);

      expect(res.body.data.status).toBe("cancelled");
      expect(res.body.data.cancellationReason).toBe("Schedule conflict");
    });
  });
});
