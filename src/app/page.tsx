"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const sections = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Handle navbar visibility
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
      
      // Handle section visibility
      sections.current.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        if (
          currentScrollY + window.innerHeight > sectionTop + 100 &&
          currentScrollY < sectionBottom - 100
        ) {
          section.classList.remove("section-hidden");
        } else {
          section.classList.add("section-hidden");
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const sectionElements = document.querySelectorAll(".section");
    sections.current = Array.from(sectionElements) as HTMLDivElement[];
    
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-base">
      {/* Navbar */}
      <nav className={`navbar fixed top-0 left-0 right-0 z-50 bg-base shadow-lg transition-transform ${showNavbar ? "" : "navbar-hidden"}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold primary-text">Praxia</div>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-text-secondary hover:primary-text transition-colors">Features</a>
            <a href="#how-it-works" className="text-text-secondary hover:primary-text transition-colors">How It Works</a>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/login" className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-base transition-all">
              Login
            </Link>
            <Link href="/auth/register" className="px-4 py-2 rounded-full bg-primary text-base hover:bg-opacity-90 transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section pt-32 pb-20 px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-[url('/images/healthcare.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your AI-Powered <span className="primary-text">Healthcare</span> Assistant
            </h1>
            <p className="text-lg md:text-xl mb-8 text-text-secondary">
              Praxia provides medical symptom analysis, X-ray interpretation, and personalized health recommendations through advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="btn-primary px-8 py-3 rounded-full text-center font-medium">
                Get Started
              </Link>
              <Link href="#features" className="btn-secondary px-8 py-3 rounded-full text-center font-medium">
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-base/80 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[url('/images/ai_assistant.png')] bg-cover bg-center"></div>
              <div className="relative z-20 h-full flex items-center justify-center">
                <p className="text-text-secondary"></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section py-20 bg-neutral">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-text">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">Symptom Analysis</h3>
              <p className="text-text-secondary">AI-powered diagnosis of medical symptoms with personalized recommendations.</p>
            </div>
            
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">X-ray Analysis</h3>
              <p className="text-text-secondary">Deep learning-based interpretation of X-ray images for pneumonia, fractures, and tumors.</p>
            </div>
            
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">Multilingual Support</h3>
              <p className="text-text-secondary">Translation of symptoms and responses in English, French, and Spanish.</p>
            </div>
            
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">Medical Research</h3>
              <p className="text-text-secondary">Integration with PubMed for retrieving relevant medical research and studies.</p>
            </div>
            
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">Health News</h3>
              <p className="text-text-secondary">Automated scraping and summarization of health news from WHO and CDC.</p>
            </div>
            
            <div className="card p-6">
              <div className="w-14 h-14 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text">Chat System</h3>
              <p className="text-text-secondary">Persistent chat sessions with the AI assistant for continuous health monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-text">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 text-text">Create Your Profile</h3>
              <p className="text-text-secondary">Sign up and complete your health profile with relevant medical information.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 text-text">Describe Your Symptoms</h3>
              <p className="text-text-secondary">Enter your symptoms in your preferred language or upload X-ray images for analysis.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 text-text">Get AI Analysis</h3>
              <p className="text-text-secondary">Receive personalized health recommendations and potential diagnoses from our AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="section py-20 bg-soft-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-text">Multilingual Support</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🇬🇧</div>
              <h3 className="text-xl font-semibold mb-2 text-text">English</h3>
              <p className="text-text-secondary">Full support for English language interactions.</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🇫🇷</div>
              <h3 className="text-xl font-semibold mb-2 text-text">French</h3>
              <p className="text-text-secondary">Common medical terms and symptom analysis in French.</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🇪🇸</div>
              <h3 className="text-xl font-semibold mb-2 text-text">Spanish</h3>
              <p className="text-text-secondary">Common medical terms and symptom analysis in Spanish.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section py-20 bg-primary text-base relative">
        <div className="absolute inset-0 bg-[url('/images/cta.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Praxia for their healthcare needs. Sign up today and experience the future of AI-powered healthcare.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/register" className="px-8 py-3 rounded-full bg-base text-primary font-medium hover:bg-opacity-90 transition-all">
              Create Account
            </Link>
            <Link href="/auth/login" className="px-8 py-3 rounded-full border border-base text-base font-medium hover:bg-base hover:text-primary transition-all">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 primary-text">Praxia</h3>
              <p className="text-text-secondary mb-4">AI-powered healthcare assistant for everyone.</p>
              <div className="flex space-x-4">
                <a href="https://github.com/AmariahAK" className="text-text-secondary hover:primary-text">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/amariah-kamau-3156412a6/" className="text-text-secondary hover:primary-text">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.5c0-1.378-1.122-2.5-2.5-2.5s-2.5 1.122-2.5 2.5v5.5h-3v-11h3v1.541c.881-.881 2.309-1.541 4-1.541 3.309 0 6 2.691 6 6v5.5z"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text">Features</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-text-secondary hover:primary-text">Symptom Analysis</a></li>
                <li><a href="#features" className="text-text-secondary hover:primary-text">X-ray Analysis</a></li>
                <li><a href="#features" className="text-text-secondary hover:primary-text">Multilingual Support</a></li>
                <li><a href="#features" className="text-text-secondary hover:primary-text">Medical Research</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:primary-text">Documentation</a></li>
                <li><a href="#" className="text-text-secondary hover:primary-text">API Reference</a></li>
                <li><a href="#" className="text-text-secondary hover:primary-text">Privacy Policy</a></li>
                <li><a href="#" className="text-text-secondary hover:primary-text">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-text">Contact</h3>
              <ul className="space-y-2">
                <li className="text-text-secondary">Email: amariah.abish@gmail.com</li>
                <li className="text-text-secondary">Phone: +254 720151950</li>
                <li><a href="https://www.linkedin.com/in/amariah-kamau-3156412a6/" className="text-text-secondary hover:primary-text">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-text-secondary">
            <p>&copy; {new Date().getFullYear()} Praxia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}