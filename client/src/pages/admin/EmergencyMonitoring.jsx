import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, CheckCircle2, MoreVertical, X, Calendar, User, Phone } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import EmergencyMap from '../../components/EmergencyMap';

const safeFormatDate = (dateStr, formatStr) => {
    try {
        const d = new Date(dateStr);
        return isValid(d) ? format(d, formatStr) : 'N/A';
    } catch (e) {
        return 'N/A';
    }
};

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
        DISPATCHED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
        ARRIVED: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/30',
        RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
};

const EmergencyMonitoring = () => {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchEmergencies();
    }, []);

    const fetchEmergencies = async () => {
        try {
            const response = await api.get('/emergency');
            setEmergencies(response.data.data);
        } catch (error) {
            toast.error('Failed to load emergencies');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const response = await api.patch(`/emergency/${id}/status`, { status });
            setEmergencies(emergencies.map(e => e._id === id ? { ...e, status: response.data.data.status, resolvedAt: response.data.data.resolvedAt, responseTime: response.data.data.responseTime } : e));
            if (selectedEmergency && selectedEmergency._id === id) {
                setSelectedEmergency({ ...selectedEmergency, status: response.data.data.status, resolvedAt: response.data.data.resolvedAt, responseTime: response.data.data.responseTime });
            }
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openModal = (emergency) => {
        setSelectedEmergency(emergency);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-slate-500 font-medium italic">Streaming Rescue Telemetry...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Dispatch Hub</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time situational awareness and responder orchestration</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Live Feed Active</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            <tr>
                                <th className="py-4 px-6">Case Subject</th>
                                <th className="py-4 px-6">Registry Timestamp</th>
                                <th className="py-4 px-6">Condition</th>
                                <th className="py-4 px-6">Spatial Node</th>
                                <th className="py-4 px-6 text-right">Dispatch Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {emergencies.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-500 italic font-medium">No active or historical emergency cases discovered.</td>
                                </tr>
                            ) : emergencies.map((e) => (
                                <tr
                                    key={e._id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                    onClick={() => openModal(e)}
                                >
                                    <td className="py-5 px-6">
                                        <div className="font-bold text-slate-900 dark:text-white text-base">{e.patient?.fullName || 'Anonymous Patient'}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-500 font-medium max-w-[280px] truncate italic">"{e.description}"</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <Calendar size={14} className="text-slate-400" />
                                            {safeFormatDate(e.triggeredAt, 'HH:mm — MMM dd')}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <StatusBadge status={e.status} />
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group">
                                            <MapPin size={14} className="text-teal-500" />
                                            <span className="font-mono tracking-tighter">{e.latitude.toFixed(5)}, {e.longitude.toFixed(5)}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-right" onClick={(event) => event.stopPropagation()}>
                                        <select
                                            value={e.status}
                                            onChange={(event) => updateStatus(e._id, event.target.value)}
                                            className="text-[11px] font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                                        >
                                            <option value="PENDING">SET PENDING</option>
                                            <option value="DISPATCHED">DISPATCH HELP</option>
                                            <option value="ARRIVED">MARK ARRIVED</option>
                                            <option value="RESOLVED">CLOSE CASE</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rescue Detail Modal */}
            {isModalOpen && selectedEmergency && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">

                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 text-left">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl shadow-inner">
                                    <AlertTriangle size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        Rescue Operations Case
                                        <StatusBadge status={selectedEmergency.status} />
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Ref: {selectedEmergency._id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 scrollbar-none">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-5 space-y-8 text-left">
                                    <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-6">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 shadow-sm"><User size={24} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject Identity</p>
                                                <p className="font-black text-xl text-slate-900 dark:text-white">{selectedEmergency.patient?.fullName || 'Unknown Object'}</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-2">
                                                    <Phone size={14} className="text-teal-500" /> {selectedEmergency.patient?.phone || 'No Secure Line'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 shadow-sm"><Calendar size={24} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Timeline</p>
                                                <div className="space-y-1 mt-1">
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Event Start: <span className="font-mono">{safeFormatDate(selectedEmergency.triggeredAt, 'HH:mm:ss — MMM dd')}</span></p>
                                                    {selectedEmergency.resolvedAt && (
                                                        <p className="text-xs font-bold text-emerald-600">Resolution: <span className="font-mono">{safeFormatDate(selectedEmergency.resolvedAt, 'HH:mm:ss — MMM dd')}</span></p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedEmergency.responseTime && (
                                            <div className="bg-emerald-500/10 dark:bg-emerald-400/10 p-6 rounded-2xl border border-emerald-500/20 flex flex-col items-center gap-1 group overflow-hidden relative transition-all">
                                                <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform">
                                                    <Clock size={80} />
                                                </div>
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] relative">Network Response Delta</p>
                                                <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 relative tracking-tighter">{selectedEmergency.responseTime}<span className="text-base ml-1">minutes</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            Patient Signal Context
                                        </h4>
                                        <div className="p-8 bg-amber-50/40 dark:bg-amber-900/10 rounded-[2rem] text-slate-800 dark:text-amber-100/90 font-bold border border-amber-100/60 dark:border-amber-700/30 shadow-inner italic leading-relaxed text-lg text-center">
                                            "{selectedEmergency.description || 'No verbal signal detected.'}"
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                            Spatial Telemetry Layer
                                        </h4>
                                        <span className="text-xs font-mono font-bold text-slate-400 tracking-tighter">{selectedEmergency.latitude.toFixed(6)}, {selectedEmergency.longitude.toFixed(6)}</span>
                                    </div>
                                    <div className="flex-1 min-h-[400px] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                                        <EmergencyMap emergency={selectedEmergency} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Dismiss Review
                            </button>
                            {selectedEmergency.status !== 'RESOLVED' && (
                                <button
                                    onClick={() => updateStatus(selectedEmergency._id, 'RESOLVED')}
                                    className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                                >
                                    <CheckCircle2 size={20} /> Close Operation
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyMonitoring;
