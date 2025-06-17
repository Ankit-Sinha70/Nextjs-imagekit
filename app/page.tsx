'use client';

import { useNotification } from './components/Notification';
import Link from 'next/link';

export default function Home() {
  const { showNotification } = useNotification();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Your App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern fullstack application built with Next.js, featuring authentication, 
            notifications, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Authentication"
              description="Secure user authentication with email and password"
              icon="🔐"
            />
            <FeatureCard 
              title="Real-time Notifications"
              description="Stay updated with our notification system"
              icon="🔔"
            />
            <FeatureCard 
              title="Modern UI"
              description="Beautiful and responsive user interface"
              icon="🎨"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-8">
          Join thousands of users who are already using our platform
        </p>
        <button
          onClick={() => showNotification('Welcome to our platform!', 'success')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Demo
        </button>
      </div>
    </main>
  );
}

// Feature Card Component
function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
