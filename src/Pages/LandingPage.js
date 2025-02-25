import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Bot, CheckCircle, Clock, Brain, BarChart, Sparkles} from 'lucide-react';

const Particle = ({ className }) => (
  <div 
    className={`absolute w-1 h-1 rounded-full bg-violet-400/20 animate-particle ${className}`}
    style={{
      left: `${Math.random() * 100}%`,
      animationDuration: `${3 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 2}s`
    }}
  />
);

const FadeInSection = ({ children, delay = "0", className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`.fade-section-${delay}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      className={`fade-section-${delay} ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } transition-all duration-1000`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const GlowingBorder = ({ children }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-shift"></div>
    <div className="relative">
      {children}
    </div>
  </div>
);

const AnimatedStat = ({ icon: Icon, value, label, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const safeClassName = `stat-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );
  
      const element = document.querySelector(`.${safeClassName}`);
      if (element) observer.observe(element);
  
      return () => observer.disconnect();
    }, [label, safeClassName]);
  
    return (
      <div 
        className={`${safeClassName} transform transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="relative p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
          <div className="relative z-10">
            <Icon className="mx-auto h-8 w-8 text-violet-600 mb-4 transform group-hover:scale-110 group-hover:text-violet-700 transition-all duration-500" />
            <p className="text-4xl font-bold text-violet-900 mb-2 transform group-hover:translate-y-1 transition-transform duration-500">{value}</p>
            <p className="text-violet-600 group-hover:text-violet-700 transition-colors duration-500">{label}</p>
          </div>
        </div>
      </div>
    );
  };

const FeatureCard = ({ icon: Icon, title, color, description, features, index }) => {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );
  
      const element = document.querySelector(`.feature-${index}`);
      if (element) observer.observe(element);
  
      return () => observer.disconnect();
    }, [index]);
  
    return (
      <div 
        className={`feature-${index} transform transition-all duration-[1500ms] ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32'
        }`}
        style={{ 
          transitionDelay: `${index * 800}ms`,
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
          <div className={`relative bg-white rounded-2xl p-8 transition-transform duration-300 hover:scale-105 ${isVisible ? 'animate-float' : ''} shadow-lg`}>
            <Icon className={`h-12 w-12 ${color}`} />
            <h3 className="mt-6 text-xl text-black font-bold">{title}</h3>
            <p className="mt-4 text-purple-700 font-semibold">{description}</p>
            <div className="mt-6 space-y-2">
              {features.map((feature, i) => (
                <div key={feature} className="flex items-center">
                  <CheckCircle className={`h-4 w-4 ${color} mr-2`} />
                  <span className="text-sm text-black font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrolled / maxScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      @keyframes particle {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        50% { transform: translateY(-100vh) scale(2); opacity: 0.5; }
        100% { transform: translateY(-200vh) scale(1); opacity: 0; }
      }

      @keyframes feature-fade {
        0% { opacity: 0; transform: translateX(-20px); }
        100% { opacity: 1; transform: translateX(0); }
      }

      .animate-particle {
        animation: particle linear infinite;
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-gradient-shift {
        animation: gradient 8s linear infinite;
        background-size: 200% 200%;
      }

      .animate-feature-fade {
        animation: feature-fade 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Intelligent Document Processing",
      color: "text-violet-900",
      description: "Process invoices and documents with unprecedented speed and accuracy. Our AI learns and improves with every interaction.",
      features: ['Optimal processing time', 'Human-in-the-loop feedback', 'Continuous learning']
    },
    {
      icon: Bot,
      title: "AI Customer Service",
      color: "text-violet-900",
      description: "Deliver 24/7 customer support with generative AI that understands context and provides human-like responses.",
      features: ['Natural conversations', 'Context awareness', 'Seamless escalation']
    },
    {
      icon: Brain,
      title: "End-to-End Automation",
      color: "text-violet-900",
      description: "Streamline workflows and eliminate manual tasks with intelligent process automation that adapts to your needs.",
      features: ['Workflow optimization', 'Error reduction', 'Real-time analytics']
    }
  ];

  const stats = [
    { icon: Clock, label: 'Faster Processing', value: '10x' },
    { icon: BarChart, label: 'Average Accuracy', value: '70%' },
    { icon: FileText, label: 'Documents/Month', value: '1M+' },
    { icon: Bot, label: 'Customer Satisfaction', value: '90%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 relative overflow-hidden">
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {[...Array(20)].map((_, i) => (
        <Particle key={i} className={`particle-${i}`} />
      ))}

      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-40 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 group">
              <h1 className="text-xl font-bold text-violet-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-violet-500 group-hover:animate-spin" />
                IPA Solution
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-violet-900 px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors">
                Sign in
              </button>
              <GlowingBorder>
                <button onClick={() => navigate('/login')} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                  Sign up
                </button>
              </GlowingBorder>
            </div>
          </div>
        </div>
      </nav>

      <header className="px-6 pt-32 pb-24 mx-auto max-w-7xl">
        <FadeInSection>
          <h1 className="text-5xl font-bold text-violet-900 text-center">
            Intelligent Process
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              {" "}Automation
            </span>
          </h1>
          <p className="mt-6 text-lg text-violet-700 text-center max-w-2xl mx-auto">
            Transform your business operations with AI-powered automation.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <GlowingBorder>
              <button onClick={() => navigate('/login')} className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-semibold">
                Get Started
              </button>
            </GlowingBorder>
            <button className="text-violet-700 flex items-center hover:text-violet-900 transition-colors font-semibold">
              Learn more <ArrowRight className="ml-2" />
            </button>
          </div>
        </FadeInSection>
      </header>

      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 text-black">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-violet-700">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <AnimatedStat key={stat.label} {...stat} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeInSection>
            <div className="bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 rounded-3xl p-24 text-center">
              <h2 className="text-3xl font-bold text-white">
                Ready to transform your business operations?
              </h2>
              <p className="mt-6 text-lg text-violet-50 max-w-xl mx-auto">
                Get started with our intelligent process automation solution today.
              </p>
              <div className="mt-10 flex justify-center gap-6">
                <GlowingBorder>
                  <button 
                    onClick={() => navigate('/signup')} 
                    className="relative bg-white text-violet-600 px-6 py-3 rounded-lg transition-colors group overflow-hidden"
                  >
                    <span className="relative z-10 font-semibold">Schedule a Demo</span>
                    <div className="absolute inset-0 bg-violet-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </button>
                </GlowingBorder>
                <button className="text-white flex items-center hover:text-violet-100 font-semibold transition-colors">
                  Contact Sales <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
            </FadeInSection>
        </div>
      </section>

      <footer className="bg-white/80 backdrop-blur-md py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Sparkles className="h-6 w-6 text-violet-500" />
              <span className="text-violet-900 font-semibold">IPA Solution</span>
            </div>
            <div className="text-violet-600 text-sm">
              © 2024 IPA Solution. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;