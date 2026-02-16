import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  Phone, 
  Camera, 
  Lock, 
  Star,
  TrendingUp,
  Download
} from 'lucide-react';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Instant Messaging",
      description: "Send messages instantly with real-time delivery and read receipts."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Chats",
      description: "Create groups with up to 256 members and enjoy group conversations."
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Voice & Video Calls",
      description: "Make high-quality voice and video calls with your contacts."
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Media Sharing",
      description: "Share photos, videos, documents and other media files seamlessly."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "Your conversations are secured with military-grade encryption."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Custom Themes",
      description: "Personalize your chat experience with custom themes and wallpapers."
    }
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Product Manager",
      content: "GBChat has transformed how our team communicates. The interface is intuitive and the features are robust.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Sarah Williams",
      role: "Designer",
      content: "The privacy features and customization options make GBChat stand out from other messaging apps.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Michael Chen",
      role: "Developer",
      content: "As someone who values security, I appreciate the end-to-end encryption and open source nature of GBChat.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  const stats = [
    { value: "10M+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "150+", label: "Countries" },
    { value: "24/7", label: "Support" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">GBChat</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link to="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Testimonials
                </Link>
                <Link to="#download" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Download
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth" className="ml-4">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8"
            >
              <span className="h-2 w-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              Now available on all platforms
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight"
            >
              Connect. Communicate.{' '}
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                Collaborate.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Experience secure, fast, and reliable messaging with advanced features designed for modern communication needs.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/auth">
                <Button size="lg" className="min-w-[200px]">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                <Download className="w-4 h-4 mr-2" />
                Download App
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for seamless communication and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="text-primary-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Secure & Reliable
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our platform ensures your communications remain private and secure with industry-leading encryption standards.
              </p>
              
              <div className="space-y-4">
                {features.slice(0, 3).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-start p-4 rounded-lg cursor-pointer transition-colors ${
                      activeFeature === index 
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="text-primary-500 mt-1 mr-3">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 lg:col-span-7 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Chat Preview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar src="https://randomuser.me/api/portraits/women/65.jpg" size="sm" />
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                        <p className="text-gray-800 dark:text-gray-200">Hey! How are you doing today?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:30 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-end">
                      <div className="bg-primary-500 text-white rounded-lg p-3 max-w-xs">
                        <p>I'm doing great! Just working on some new features for our app.</p>
                        <p className="text-xs text-primary-100 mt-1">10:31 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Avatar src="https://randomuser.me/api/portraits/men/33.jpg" size="sm" />
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                        <p>That sounds exciting! Count me in if you need any help.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:32 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join millions of satisfied users who trust GBChat for their daily communication needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <Avatar src={testimonial.avatar} size="md" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Join millions of users who trust GBChat for secure and reliable communication
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100 min-w-[200px]">
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-[200px]">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">GBChat</span>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Secure messaging for everyone. Built with privacy and usability in mind.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Features</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Security</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Download</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Help Center</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 GBChat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;