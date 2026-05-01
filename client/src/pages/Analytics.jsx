import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, AlertOctagon, IndianRupee, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const FINE_MAP = { 'No Helmet': 500, 'Signal Jump': 1000, 'Overspeed': 1500, 'Parking': 700 };

export default function Analytics() {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Line chart: daily violation trends
  const trendsData = data.dailyTrends.map((item) => ({
    name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    violations: item.count,
  }));

  // Pie chart: violation type distribution
  const pieData = data.commonViolations.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // Bar chart 1: violations count per type
  const violationCountBar = data.commonViolations.map((item) => ({
    name: item._id,
    Count: item.count,
  }));

  // Bar chart 2: estimated revenue per violation type
  const revenueBar = data.commonViolations.map((item) => ({
    name: item._id,
    Revenue: (FINE_MAP[item._id] || 0) * item.count,
  }));

  const statCards = [
    { title: 'Total Revenue', value: `Rs. ${data.summary.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Total Violations', value: data.summary.totalViolations, icon: AlertOctagon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Recovery Rate', value: `${Math.round((data.summary.paidViolations / (data.summary.totalViolations || 1)) * 100)}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Repeat Offenders', value: data.repeatOffenders.length, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const chartTheme = isDarkMode
    ? { grid: '#374151', axis: '#9ca3af', tooltipBg: '#111827', tooltipBorder: '#374151', tooltipText: '#ffffff', lineDotStroke: '#111827' }
    : { grid: '#e2e8f0', axis: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#cbd5e1', tooltipText: '#0f172a', lineDotStroke: '#ffffff' };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: chartTheme.tooltipBg,
      borderColor: chartTheme.tooltipBorder,
      borderRadius: '0.5rem',
      color: chartTheme.tooltipText,
    },
    itemStyle: { color: chartTheme.tooltipText },
    labelStyle: { color: chartTheme.tooltipText },
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Analytics</h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">Real-time overview of traffic violations and revenue</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500 dark:text-gray-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
              </div>
              <div className={`rounded-xl p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Line Chart + Pie Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart – Daily Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Daily Violation Trend (Line)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} axisLine={false} />
                <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="violations" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: chartTheme.lineDotStroke }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart – Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Violation Type Breakdown (Pie)</h3>
          <div className="flex h-64 w-full items-center">
            <ResponsiveContainer width="65%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[35%] space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm">
                  <div className="mr-2 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="truncate text-slate-600 dark:text-gray-300 text-xs" title={entry.name}>
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Bar Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart 1: Violations Count per Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Violations by Type (Bar)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationCountBar} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="Count" radius={[6, 6, 0, 0]}>
                  {violationCountBar.map((entry, index) => (
                    <Cell key={`bar-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart 2: Revenue per Violation Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Revenue by Violation Type (Bar)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBar} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v}`, 'Revenue']} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="Revenue" radius={[6, 6, 0, 0]}>
                  {revenueBar.map((entry, index) => (
                    <Cell key={`rev-${entry.name}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Repeat Offenders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <h3 className="mb-6 flex items-center text-lg font-bold text-slate-900 dark:text-white">
          <Users className="mr-2 h-5 w-5 text-orange-500" />
          Repeat Offenders
          <span className="ml-3 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
            &gt; 3 Violations
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-gray-400">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-gray-800/50 dark:text-gray-500">
              <tr>
                <th className="rounded-l-lg px-6 py-3 font-medium">Vehicle Number</th>
                <th className="px-6 py-3 font-medium">Owner Name</th>
                <th className="rounded-r-lg px-6 py-3 text-right font-medium">Total Violations</th>
              </tr>
            </thead>
            <tbody>
              {data.repeatOffenders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-gray-500">
                    No repeat offenders found. Good job citizens! 🎉
                  </td>
                </tr>
              ) : (
                data.repeatOffenders.map((offender) => (
                  <tr key={offender._id} className="border-b border-slate-200 last:border-0 dark:border-gray-800/50">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{offender._id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{offender.ownerName}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="rounded-full bg-red-500/10 px-2.5 py-1 font-bold text-red-400">
                        {offender.count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
