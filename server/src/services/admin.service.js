const User = require('../models/User');
const EmergencyCase = require('../models/EmergencyCase');

class AdminService {
    async getAllUsers() {
        return await User.aggregate([
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'patientProfile'
                }
            },
            {
                $lookup: {
                    from: 'doctors',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'doctorProfile'
                }
            },
            {
                $addFields: {
                    profile: {
                        $cond: {
                            if: { $gt: [{ $size: '$patientProfile' }, 0] },
                            then: { $arrayElemAt: ['$patientProfile', 0] },
                            else: {
                                $cond: {
                                    if: { $gt: [{ $size: '$doctorProfile' }, 0] },
                                    then: { $arrayElemAt: ['$doctorProfile', 0] },
                                    else: null
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    name: { $ifNull: ['$profile.fullName', '$fullName'] },
                    avatarUrl: { $ifNull: ['$profile.avatarUrl', null] },
                    phone: { $ifNull: ['$phone', '$profile.phone'] }
                }
            },
            {
                $project: {
                    patientProfile: 0,
                    doctorProfile: 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }

    async toggleUserStatus(id) {
        const user = await User.findById(id);
        if (!user) throw new Error('User not found');

        const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return await User.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true, runValidators: false }
        );
    }

    async getStats() {
        const totalUsers = await User.countDocuments();
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalResponders = await User.countDocuments({ role: 'responder' });

        const totalEmergencies = await EmergencyCase.countDocuments();
        const resolvedEmergencies = await EmergencyCase.countDocuments({ status: 'RESOLVED' });

        const avgResponseTimeResult = await EmergencyCase.aggregate([
            { $match: { status: 'RESOLVED', responseTime: { $exists: true } } },
            { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
        ]);

        const avgResponseTime = avgResponseTimeResult.length > 0 ? Math.round(avgResponseTimeResult[0].avgTime) : 0;

        const statusBreakdown = await EmergencyCase.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const emergencyStatusBreakdown = {
            PENDING: 0,
            DISPATCHED: 0,
            ARRIVED: 0,
            RESOLVED: 0,
        };

        statusBreakdown.forEach((item) => {
            if (emergencyStatusBreakdown.hasOwnProperty(item._id)) {
                emergencyStatusBreakdown[item._id] = item.count;
            }
        });

        return {
            totalUsers,
            totalPatients,
            totalDoctors,
            totalResponders,
            totalEmergencies,
            resolvedEmergencies,
            avgResponseTime,
            emergencyStatusBreakdown,
        };
    }
}

module.exports = new AdminService();
