import { ArrowLeft, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router';
import Card from '../components/Card';

export default function TermsPrivacy() {
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Legal</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Terms of Service */}
        <Card className="mb-6">
          <div className="p-6 border-b border-white/10 light:border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-bold text-white light:text-gray-900">Terms of Service</h2>
            </div>
            <p className="text-sm text-gray-400 light:text-gray-600 mb-4">
              Last updated: March 22, 2026
            </p>
          </div>
          
          <div className="p-6 space-y-6 text-sm">
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">1. Acceptance of Terms</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                By accessing and using Swimily, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the service.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">2. Use License</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                Permission is granted to temporarily download one copy of Swimily for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">3. User Account</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to share your account credentials with anyone.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">4. Premium Subscriptions</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                Premium subscriptions are billed monthly or annually. You may cancel your subscription at any time. No refunds will be provided for partial subscription periods.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">5. User Content</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                You retain all rights to the practice data and content you submit to Swimily. By uploading content, you grant us a license to use, store, and display this content to provide the service.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">6. Prohibited Uses</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                You may not use the service to violate any applicable laws, infringe on intellectual property rights, transmit harmful code, or interfere with other users' access to the service.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Privacy Policy */}
        <Card className="mb-6">
          <div className="p-6 border-b border-white/10 light:border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white light:text-gray-900">Privacy Policy</h2>
            </div>
            <p className="text-sm text-gray-400 light:text-gray-600 mb-4">
              Last updated: March 22, 2026
            </p>
          </div>
          
          <div className="p-6 space-y-6 text-sm">
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">Information We Collect</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed mb-2">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-400 light:text-gray-600 space-y-1 ml-2">
                <li>Name, email, team affiliation</li>
                <li>Swimming practice data (times, distances, strokes)</li>
                <li>Meet results and personal records</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">How We Use Your Information</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-400 light:text-gray-600 space-y-1 ml-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Calculate FINA points and track progress</li>
                <li>Generate AI-powered workout recommendations</li>
                <li>Send notifications and updates</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">Data Security</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">Data Sharing</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                We do not sell your personal information to third parties. We may share anonymized, aggregated data for analytics purposes. We may disclose your information if required by law.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">Your Rights</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You can export all your data from the Privacy & Data settings page.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white light:text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-400 light:text-gray-600 leading-relaxed">
                If you have questions about these terms or our privacy practices, contact us at legal@swimily.app
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
