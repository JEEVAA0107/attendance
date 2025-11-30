import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
  LayoutDashboard,
  Zap
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student database with easy operations and detailed history.'
    },
    {
      icon: ClipboardCheck,
      title: 'Smart Attendance',
      description: 'Quick attendance marking with batch selection and real-time updates.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Visual insights with charts, heatmaps, and department tracking.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Automated Export',
      description: 'Export data to Excel templates with automated reports.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Students Managed' },
    { value: '500+', label: 'Institutions' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SmartAttend
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              Trusted by 500+ Educational Institutions
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Track Smarter. <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Teach Better.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your college attendance management with our intelligent, automated system.
              Get real-time insights, save time, and improve accuracy.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/login/hod">
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                  HoD Login
                </Button>
              </Link>
              <Link to="/login/faculty">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                  Faculty Login
                </Button>
              </Link>
              <Link to="/login/student">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                  Student Login
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Setup in 5 minutes • 30-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage attendance efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Transform Your Attendance System?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join hundreds of institutions using SmartAttend to save time and improve accuracy.
              </p>
              <div className="flex justify-center">
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                30-day free trial • No setup fees • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SmartAttend
              </span>
            </div>
            <p className="text-gray-600 text-center">
              © 2025 SmartAttend. Track Smarter. Teach Better.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;