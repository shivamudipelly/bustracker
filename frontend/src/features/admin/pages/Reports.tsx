import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Users, Bus, MapPin, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const generateReport = () => {
    console.log('Generating report for:', selectedPeriod);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Analytics & Reports
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button 
                onClick={generateReport}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { title: 'Total Revenue', value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'green', up: true },
              { title: 'Total Trips', value: '2,847', change: '+8.2%', icon: MapPin, color: 'blue', up: true },
              { title: 'Active Users', value: '1,923', change: '+15.1%', icon: Users, color: 'purple', up: true },
              { title: 'Fleet Efficiency', value: '94.2%', change: '-2.1%', icon: Bus, color: 'yellow', up: false }
            ].map((metric, index) => (
              <Card key={index} className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 border-${metric.color}-200 border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in`} style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white/50 shadow-sm`}>
                      <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                    </div>
                    <Badge className={`${metric.up ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Analytics Chart */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Trip Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive Chart Placeholder</p>
                      <p className="text-sm text-gray-500">Trips over time visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route Performance */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Top Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { route: 'B101 - Central Line', trips: 342, revenue: '$2,450' },
                      { route: 'B205 - Airport Express', trips: 287, revenue: '$2,180' },
                      { route: 'B156 - University Route', trips: 234, revenue: '$1,890' },
                      { route: 'B089 - Shopping District', trips: 198, revenue: '$1,560' }
                    ].map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                        <div>
                          <p className="font-semibold text-gray-900">{route.route}</p>
                          <p className="text-sm text-gray-500">{route.trips} trips</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{route.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New bus B312 added to fleet', time: '2 minutes ago', type: 'success' },
                    { action: 'Route B205 completed maintenance', time: '15 minutes ago', type: 'info' },
                    { action: 'Driver John Smith logged in', time: '32 minutes ago', type: 'info' },
                    { action: 'Bus B089 reported delay', time: '45 minutes ago', type: 'warning' },
                    { action: 'Monthly report generated', time: '1 hour ago', type: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle>Fleet Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">87%</p>
                      <p className="text-sm text-gray-600">Average utilization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle>Maintenance Due</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">3</p>
                      <p className="text-sm text-gray-600">Buses need service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle>Fuel Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">12.5</p>
                      <p className="text-sm text-gray-600">KM per liter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">$45,230</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">$32,120</p>
                    <p className="text-sm text-gray-600">Operating Costs</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">$13,110</p>
                    <p className="text-sm text-gray-600">Net Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">On-time Performance</span>
                      <span className="text-sm font-bold">94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm font-bold">4.6/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
