import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Lock,
  Shield,
  EyeOff,
  Zap,
  Download,
  Ghost,
} from 'lucide-react';
import Button from '../components/common/Button';

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "Instant Messaging",
      description: "Lightning-fast messaging with real-time delivery and smart read receipts.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Ghost Mode",
      description: "Go invisible. Hide online status, typing indicators, and read receipts.",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: "14+ Premium Themes",
      description: "AMOLED, Neon, Glassmorphism, Cyberpunk — customize everything.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: <EyeOff className="w-7 h-7" />,
      title: "Anti-Delete Messages",
      description: "See deleted messages. Nobody can hide what they said from you.",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: "End-to-End Encryption",
      description: "Military-grade encryption for all messages, calls, and media.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Custom Effects",
      description: "Particles, snow, hearts, stars — make your chats come alive.",
      gradient: "from-yellow-500 to-amber-600"
    }
  ];

  const gbExclusive = [
    { icon: '🧊', title: 'Freeze Last Seen', desc: 'Lock your last seen at any time' },
    { icon: '👻', title: 'Ghost Mode', desc: 'Be completely invisible to everyone' },
    { icon: '🔒', title: 'App Lock', desc: 'Fingerprint & pattern lock support' },
    { icon: '🚫', title: 'Anti-Delete', desc: 'See messages others have deleted' },
    { icon: '📞', title: 'Call Blocker', desc: 'Block calls from unknown numbers' },
    { icon: '🎨', title: 'Custom Bubbles', desc: 'Change chat bubble styles & colors' },
    { icon: '✈️', title: 'DND Mode', desc: 'Receive messages without notifications' },
    { icon: '📊', title: 'Chat Analytics', desc: 'See detailed chat statistics' },
  ];

  const stats = [
    { value: "10M+", label: "Active Users", icon: "👥" },
    { value: "99.9%", label: "Uptime", icon: "⚡" },
    { value: "150+", label: "Countries", icon: "🌍" },
    { value: "14+", label: "Themes", icon: "🎨" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-950/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">GBChat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-semibold border border-primary-500/30">PRO</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Features</a>
              <a href="#gb-exclusive" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">GB Exclusive</a>
              <a href="#download" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Download</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-8">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300">Now with <span className="text-primary-400 font-semibold">Ghost Mode</span> & <span className="text-purple-400 font-semibold">Anti-Delete</span></span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
            The <span className="bg-gradient-to-r from-primary-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">Ultimate</span>
            <br />
            Messaging Experience
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Privacy-first messaging with advanced features. Ghost mode, anti-delete, 14+ premium themes, and encrypted calls — all in one app.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="min-w-[220px] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-xl shadow-primary-500/25 text-lg py-3">
                🚀 Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[220px] border-white/20 text-white hover:bg-white/10 text-lg py-3">
              <Download className="w-5 h-5 mr-2" />
              Download App
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">Features</span>
            </motion.h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need for the ultimate messaging experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GB Exclusive Features */}
      <section id="gb-exclusive" className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <Ghost className="w-4 h-4" /> GB Exclusive
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-4">
              Features You Won't Find <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Anywhere Else</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gbExclusive.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-all text-center group cursor-pointer">
                <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-purple-600/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Experience the <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">Future</span>?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Join millions of users who chose privacy, customization, and the best messaging experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="min-w-[220px] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-xl shadow-primary-500/25 text-lg py-3">
                  <Download className="w-5 h-5 mr-2" />
                  Download Now
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="min-w-[220px] border-white/20 text-white hover:bg-white/10 text-lg py-3">
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">GBChat</span>
              </div>
              <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                Privacy-first messaging with advanced GB features. Built for those who want more.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Security', 'Themes', 'Download'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Privacy Policy', 'Terms', 'Community'] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{col.title}</h3>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
            <p>&copy; 2026 GBChat. All rights reserved. Made with 💚</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;