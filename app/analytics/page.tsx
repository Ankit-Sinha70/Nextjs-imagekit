'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardSection from '../components/dashboard/DashboardSection';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Sample data for charts
const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400, profit: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398, profit: 2210 },
  { month: 'Mar', sales: 2000, revenue: 9800, profit: 2290 },
  { month: 'Apr', sales: 2780, revenue: 3908, profit: 2000 },
  { month: 'May', sales: 1890, revenue: 4800, profit: 2181 },
  { month: 'Jun', sales: 2390, revenue: 3800, profit: 2500 },
  { month: 'Jul', sales: 3490, revenue: 4300, profit: 2100 },
];

const userData = [
  { name: 'New Users', value: 400, color: '#8884d8' },
  { name: 'Returning Users', value: 300, color: '#82ca9d' },
  { name: 'Premium Users', value: 200, color: '#ffc658' },
  { name: 'Inactive Users', value: 100, color: '#ff7300' },
];

const trafficData = [
  { time: '00:00', visitors: 120, pageViews: 240 },
  { time: '04:00', visitors: 80, pageViews: 160 },
  { time: '08:00', visitors: 200, pageViews: 400 },
  { time: '12:00', visitors: 350, pageViews: 700 },
  { time: '16:00', visitors: 280, pageViews: 560 },
  { time: '20:00', visitors: 180, pageViews: 360 },
];

const conversionData = [
  { day: 'Mon', conversions: 12, rate: 2.4 },
  { day: 'Tue', conversions: 19, rate: 3.2 },
  { day: 'Wed', conversions: 15, rate: 2.8 },
  { day: 'Thu', conversions: 22, rate: 4.1 },
  { day: 'Fri', conversions: 18, rate: 3.5 },
  { day: 'Sat', conversions: 25, rate: 4.8 },
  { day: 'Sun', conversions: 20, rate: 3.9 },
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const StatCard = ({ title, value, change, icon }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          <p className={`text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        </div>
        <div className="text-3xl text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto">
        <div className="sm:px-0 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm">
          <DashboardSection title="Analytics Overview">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h2>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Key Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard 
                title="Total Revenue" 
                value="$45,231" 
                change={12.5} 
                icon="💰"
              />
              <StatCard 
                title="Total Sales" 
                value="2,350" 
                change={8.2} 
                icon="📈"
              />
              <StatCard 
                title="Active Users" 
                value="1,234" 
                change={-2.1} 
                icon=""
              />
              <StatCard 
                title="Conversion Rate" 
                value="3.2%" 
                change={15.3} 
                icon="🎯"
              />
            </motion.div>

            {/* Charts Section */}
            <div className="space-y-8">
              {/* Sales & Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Sales & Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* User Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
                >
                  <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">User Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
                >
                  <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Website Traffic</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="visitors" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Conversion Rate Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Conversion Rate by Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="conversions" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="rate" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'New order placed', user: 'John Doe', time: '2 minutes ago', amount: '$299' },
                    { action: 'Payment received', user: 'Jane Smith', time: '5 minutes ago', amount: '$150' },
                    { action: 'User registered', user: 'Mike Johnson', time: '10 minutes ago', amount: '-' },
                    { action: 'Product review', user: 'Sarah Wilson', time: '15 minutes ago', amount: '5 stars' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium dark:text-gray-100">{activity.action}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">by {activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{activity.time}</p>
                        <p className="font-medium dark:text-gray-100">{activity.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </DashboardSection>
        </div>
      </main>
    </DashboardLayout>
  );
}
