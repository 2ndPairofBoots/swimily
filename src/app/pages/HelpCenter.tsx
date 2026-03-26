import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Book, MessageCircle, Video } from 'lucide-react';
import { Link } from 'react-router';
import Card from '../components/Card';

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    icon: Book,
    questions: [
      {
        q: 'How do I log my first practice?',
        a: 'Tap the "Log Practice" button on the dashboard, then choose Manual entry, Paste workout, or Photo scan. Enter your sets with distance, stroke, and times.'
      },
      {
        q: 'What are FINA points?',
        a: 'FINA points are a standardized scoring system that allows comparison of performances across different events and courses. Higher points = faster times relative to world records.'
      },
      {
        q: 'How does the XP system work?',
        a: 'You earn XP for logging practices, setting PRs, completing challenges, and daily spins. As you level up, you unlock new titles from Novice to Olympian.'
      }
    ]
  },
  {
    category: 'Features',
    icon: Video,
    questions: [
      {
        q: 'What is AI Workout Generation?',
        a: 'Our AI Trainer creates personalized workouts based on your goals, fitness level, and preferences. It adapts to your progress over time. (Premium feature)'
      },
      {
        q: 'How do I import times from meets?',
        a: 'Go to More > Import Times, enter the meet name and date, then add your events and times. The app will automatically calculate FINA points and track PRs.'
      },
      {
        q: 'Can I track dryland workouts?',
        a: 'Yes! Go to More > Dryland Training to select available equipment and get a customized dryland routine with exercises and XP rewards.'
      }
    ]
  },
  {
    category: 'Premium',
    icon: MessageCircle,
    questions: [
      {
        q: 'What does Premium include?',
        a: 'Premium unlocks AI workout generation, advanced analytics & charts, photo workout scanning, unlimited storage, and priority support.'
      },
      {
        q: 'How much does Premium cost?',
        a: 'Premium is $4.99/month or $49.99/year (17% savings). You can manage your subscription anytime from your profile.'
      },
      {
        q: 'Can I try Premium for free?',
        a: 'We currently don\'t offer a free trial, but you can cancel your subscription anytime with no penalties.'
      }
    ]
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const filteredFAQ = FAQ_ITEMS.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Help Center</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 light:bg-white border border-white/20 light:border-gray-200 rounded-xl text-white light:text-gray-900 placeholder-gray-500 light:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="px-6">
        {/* FAQ Categories */}
        {filteredFAQ.map((category, categoryIndex) => (
          <div key={category.category} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <category.icon className="w-5 h-5 text-cyan-500" />
              <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider">{category.category}</h3>
            </div>
            
            <Card>
              <div className="divide-y divide-white/10 light:divide-gray-100">
                {category.questions.map((item, index) => {
                  const itemId = `${categoryIndex}-${index}`;
                  const isExpanded = expandedItems.includes(itemId);
                  
                  return (
                    <div key={itemId}>
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors text-left"
                      >
                        <p className="font-semibold text-white light:text-gray-900 pr-4">{item.q}</p>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-400 light:text-gray-600 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ))}
        
        {filteredFAQ.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 light:text-gray-600">No results found for "{searchQuery}"</p>
          </Card>
        )}
        
        {/* Contact Support */}
        <Card className="p-6 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border-cyan-500/30 text-center">
          <MessageCircle className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white light:text-gray-900 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-300 light:text-gray-600 mb-4">
            Contact our support team and we'll get back to you within 24 hours
          </p>
          <Link
            to="/contact-support"
            className="inline-block px-6 py-3 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition-colors"
          >
            Contact Support
          </Link>
        </Card>
      </div>
    </div>
  );
}
