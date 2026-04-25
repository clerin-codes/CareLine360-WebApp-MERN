/**
 * Admin Module - Integration Tests
 * Tests for admin operations and user management workflows
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const User = require("../../../models/User");
const Doctor = require("../../../models/Doctor");
const Appointment = require("../../../models/Appointment");
const EmergencyCase = require("../../../models/EmergencyCase");

describe("Admin Module - Integration Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await EmergencyCase.deleteMany({});
  });

  describe("User Management Workflow", () => {
    test("should create and retrieve multiple users with different roles", async () => {
      const users = await User.create([
        { email: "patient@example.com", role: "patient", passwordHash: "hash123" },
        { email: "doctor@example.com", role: "doctor", passwordHash: "hash123" },
        { email: "admin@example.com", role: "admin", passwordHash: "hash123" },
      ]);

      expect(users).toHaveLength(3);

      const patients = await User.find({ role: "patient" });
      expect(patients).toHaveLength(1);
      expect(patients[0].email).toBe("patient@example.com");
    });

    test("should update user status and track changes", async () => {
      const user = await User.create({
        email: "newuser@example.com",
        role: "patient",
        status: "PENDING",
        passwordHash: "hash123",
      });

      // Admin approves user
      const approved = await User.findByIdAndUpdate(
        user._id,
        { status: "ACTIVE" },
        { new: true }
      );

      expect(approved.status).toBe("ACTIVE");
    });

    test("should suspend user account", async () => {
      const user = await User.create({
        email: "suspend@example.com",
        role: "patient",
        status: "ACTIVE",
        passwordHash: "hash123",
      });

      const suspended = await User.findByIdAndUpdate(
        user._id,
        { status: "SUSPENDED" },
        { new: true }
      );

      expect(suspended.status).toBe("SUSPENDED");
    });

    test("should delete user and maintain data integrity", async () => {
      const user = await User.create({
        email: "delete@example.com",
        role: "patient",
        passwordHash: "hash123",
      });

      await User.findByIdAndDelete(user._id);

      const found = await User.findById(user._id);
      expect(found).toBeNull();
    });
  });

  describe("Doctor Verification Workflow", () => {
    test("should handle doctor verification process", async () => {
      const user = await User.create({
        email: "doctor@medical.com",
        role: "doctor",
        passwordHash: "hash123",
      });

      const doctor = await Doctor.create({
        userId: user._id,
        doctorId: "DOC-000001",
        fullName: "Dr. Smith",
        specialization: "Cardiology",
        licenseNumber: "MED-2024-001",
        status: "PENDING",
      });

      // Admin verifies doctor
      const verified = await Doctor.findByIdAndUpdate(
        doctor._id,
        { status: "VERIFIED" },
        { new: true }
      );

      expect(verified.status).toBe("VERIFIED");
    });

    test("should retrieve pending doctors for admin review", async () => {
      await Doctor.create([
        {
          userId: new mongoose.Types.ObjectId(),
          doctorId: "DOC-000002",
          fullName: "Dr. Johnson",
          status: "PENDING",
        },
        {
          userId: new mongoose.Types.ObjectId(),
          doctorId: "DOC-000003",
          fullName: "Dr. Williams",
          status: "PENDING",
        },
        {
          userId: new mongoose.Types.ObjectId(),
          doctorId: "DOC-000004",
          fullName: "Dr. Brown",
          status: "VERIFIED",
        },
      ]);

      const pending = await Doctor.find({ status: "PENDING" });
      expect(pending).toHaveLength(2);
    });

    test("should reject doctor application", async () => {
      const doctor = await Doctor.create({
        userId: new mongoose.Types.ObjectId(),
        doctorId: "DOC-000005",
        fullName: "Dr. Applicant",
        status: "PENDING",
      });

      const rejected = await Doctor.findByIdAndUpdate(
        doctor._id,
        { status: "REJECTED" },
        { new: true }
      );

      expect(rejected.status).toBe("REJECTED");
    });
  });

  describe("Appointment Oversight", () => {
    test("should retrieve all appointments for admin dashboard", async () => {
      await Appointment.create([
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "10:00",
          consultationType: "video",
          status: "pending",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "11:00",
          consultationType: "video",
          status: "confirmed",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "12:00",
          consultationType: "video",
          status: "completed",
        },
      ]);

      const allAppointments = await Appointment.find();
      expect(allAppointments).toHaveLength(3);

      const confirmed = await Appointment.find({ status: "confirmed" });
      expect(confirmed).toHaveLength(1);
    });

    test("should calculate appointment statistics", async () => {
      await Appointment.create([
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "10:00",
          consultationType: "video",
          status: "completed",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "11:00",
          consultationType: "video",
          status: "completed",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "12:00",
          consultationType: "video",
          status: "cancelled",
        },
      ]);

      const completed = await Appointment.countDocuments({
        status: "completed",
      });
      const cancelled = await Appointment.countDocuments({
        status: "cancelled",
      });

      expect(completed).toBe(2);
      expect(cancelled).toBe(1);
    });
  });

  describe("Emergency Response Management", () => {
    test("should create and track emergency cases", async () => {
      const emergency = await EmergencyCase.create({
        patient: new mongoose.Types.ObjectId(),
        description: "Severe Chest Pain",
        severity: "critical",
        status: "PENDING",
        latitude: 6.9271,
        longitude: 80.7744,
      });

      expect(emergency.status).toBe("PENDING");
      expect(emergency.severity).toBe("critical");
    });

    test("should update emergency status through workflow", async () => {
      const emergency = await EmergencyCase.create({
        patient: new mongoose.Types.ObjectId(),
        description: "Emergency",
        status: "PENDING",
        latitude: 6.9271,
        longitude: 80.7744,
      });

      // Responder accepts
      let updated = await EmergencyCase.findByIdAndUpdate(
        emergency._id,
        { status: "DISPATCHED" },
        { new: true }
      );
      expect(updated.status).toBe("DISPATCHED");

      // Emergency resolved
      updated = await EmergencyCase.findByIdAndUpdate(
        emergency._id,
        { status: "RESOLVED" },
        { new: true }
      );
      expect(updated.status).toBe("RESOLVED");
    });

    test("should retrieve emergencies by severity", async () => {
      await EmergencyCase.create([
        {
          patient: new mongoose.Types.ObjectId(),
          severity: "critical",
          description: "Critical 1",
          latitude: 6.9,
          longitude: 80.7,
        },
        {
          patient: new mongoose.Types.ObjectId(),
          severity: "critical",
          description: "Critical 2",
          latitude: 6.9,
          longitude: 80.7,
        },
        {
          patient: new mongoose.Types.ObjectId(),
          severity: "high",
          description: "High 1",
          latitude: 6.9,
          longitude: 80.7,
        },
      ]);

      const critical = await EmergencyCase.find({ severity: "critical" });
      expect(critical).toHaveLength(2);
    });
  });

  describe("System Statistics and Reporting", () => {
    test("should calculate system-wide statistics", async () => {
      // Create test data
      await User.create([
        { email: "user1@example.com", role: "patient", passwordHash: "hash" },
        { email: "user2@example.com", role: "patient", passwordHash: "hash" },
        { email: "user3@example.com", role: "doctor", passwordHash: "hash" },
      ]);

      const totalUsers = await User.countDocuments();
      const patientCount = await User.countDocuments({ role: "patient" });
      const doctorCount = await User.countDocuments({ role: "doctor" });

      expect(totalUsers).toBe(3);
      expect(patientCount).toBe(2);
      expect(doctorCount).toBe(1);
    });

    test("should generate appointment statistics", async () => {
      await Appointment.create([
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "10:00",
          consultationType: "video",
          status: "pending",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "11:00",
          consultationType: "video",
          status: "confirmed",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "12:00",
          consultationType: "video",
          status: "completed",
        },
        {
          patient: new mongoose.Types.ObjectId(),
          doctor: new mongoose.Types.ObjectId(),
          date: new Date(),
          time: "13:00",
          consultationType: "video",
          status: "completed",
        },
      ]);

      const stats = {
        total: await Appointment.countDocuments(),
        pending: await Appointment.countDocuments({ status: "pending" }),
        confirmed: await Appointment.countDocuments({ status: "confirmed" }),
        completed: await Appointment.countDocuments({ status: "completed" }),
      };

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(1);
    });

    test("should calculate emergency statistics", async () => {
      await EmergencyCase.create([
        {
          severity: "critical",
          status: "PENDING",
          patient: new mongoose.Types.ObjectId(),
          description: "test",
          latitude: 1,
          longitude: 1,
        },
        {
          severity: "critical",
          status: "PENDING",
          patient: new mongoose.Types.ObjectId(),
          description: "test",
          latitude: 1,
          longitude: 1,
        },
        {
          severity: "high",
          status: "RESOLVED",
          patient: new mongoose.Types.ObjectId(),
          description: "test",
          latitude: 1,
          longitude: 1,
        },
      ]);

      const stats = {
        total: await EmergencyCase.countDocuments(),
        critical: await EmergencyCase.countDocuments({
          severity: "critical",
        }),
        pending: await EmergencyCase.countDocuments({ status: "PENDING" }),
        resolved: await EmergencyCase.countDocuments({ status: "RESOLVED" }),
      };

      expect(stats.total).toBe(3);
      expect(stats.critical).toBe(2);
      expect(stats.pending).toBe(2);
    });
  });

  describe("Data Integrity and Constraints", () => {
    test("should maintain user role integrity", async () => {
      const validRoles = ["patient", "doctor", "admin", "responder"];

      const users = await User.create([
        { email: "valid1@example.com", role: "patient", passwordHash: "hash" },
        { email: "valid2@example.com", role: "doctor", passwordHash: "hash" },
      ]);

      users.forEach((user) => {
        expect(validRoles).toContain(user.role);
      });
    });

    test("should track user creation timestamps", async () => {
      const user = await User.create({
        email: "timestamp@example.com",
        role: "patient",
        passwordHash: "hash",
      });

      expect(user.createdAt).toBeDefined();
      expect(user.createdAt instanceof Date).toBe(true);
    });
  });
});
