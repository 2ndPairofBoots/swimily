import { useEffect, useState } from 'react';
import { Gift, Crown, Trophy, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import XPCard from '../components/XPCard';
import { SPIN_PRIZES } from '../lib/constants';
import { PRICING } from '../lib/pricing';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';
import { fetchPractices } from '../lib/practices-api';
import { calculateLevel } from '../lib/swim-utils';

export default function Rewards() {
  const { profile } = useUser();
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [level, setLevel] = useState<number>(profile.level);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<typeof SPIN_PRIZES[0] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const practices = await fetchPractices();
        const xp = practices.reduce((sum, p) => sum + (p.xpEarned ?? 0), 0);
        if (cancelled) return;
        setXpTotal(xp);
        setLevel(Math.min(6, calculateLevel(xp)));
      } catch {
        // Keep context values if analytics endpoints fail.
        setXpTotal(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  
  const handleUpgradeMonthly = () => {
    toast.info('Upgrade to Premium', { 
      description: 'Redirecting to checkout for Monthly plan ($4.99/month)...' 
    });
    // In production: Redirect to Stripe Checkout
  };
  
  const handleUpgradeAnnual = () => {
    toast.info('Upgrade to Premium', { 
      description: 'Redirecting to checkout for Annual plan ($49.99/year)...' 
    });
    // In production: Redirect to Stripe Checkout
  };
  
  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    
    // Pick random prize
    const prizeIndex = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[prizeIndex];
    
    // Calculate rotation (multiple full spins + final position)
    const spinsCount = 5;
    const degreePerPrize = 360 / SPIN_PRIZES.length;
    const finalRotation = spinsCount * 360 + (prizeIndex * degreePerPrize);
    
    setRotation(rotation + finalRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setWonPrize(prize);
      
      if (prize.type === 'xp') {
        toast.success(`You won ${prize.value} XP!`, {
          description: 'XP added to your account',
          duration: 4000
        });
      } else {
        toast.success(`You won: ${prize.name}!`, {
          duration: 4000
        });
      }
    }, 3000);
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Rewards</h1>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* XP Card */}
        <div className="mb-6">
          <XPCard xp={xpTotal} level={level} />
        </div>
        
        {/* Spin Wheel Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Daily Spin Wheel 🎡</h2>
          
          <Card className="p-6">
            {/* Spin Wheel */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-lg" />
              </div>
              
              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full overflow-hidden border-4 border-slate-300 relative"
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {SPIN_PRIZES.map((prize, idx) => {
                  const degreePerPrize = 360 / SPIN_PRIZES.length;
                  const startAngle = idx * degreePerPrize;
                  
                  return (
                    <div
                      key={prize.id}
                      className="absolute w-full h-full"
                      style={{
                        transform: `rotate(${startAngle}deg)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div
                        className="absolute w-full h-1/2 flex items-end justify-center pb-8 text-white font-bold text-xs"
                        style={{
                          backgroundColor: prize.color,
                          clipPath: `polygon(50% 0%, 100% 100%, 0% 100%)`
                        }}
                      >
                        <span className="transform -rotate-90" style={{ fontSize: '10px' }}>
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-slate-400" />
                </div>
              </motion.div>
            </div>
            
            {/* Spin Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Spinning...
                </span>
              ) : (
                '🎰 Spin Now!'
              )}
            </button>
            
            {wonPrize && (
              <div className="mt-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200 text-center">
                <p className="text-lg font-bold text-pink-900 mb-1">🎉 You Won!</p>
                <p className="text-pink-700">{wonPrize.name}</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Premium Upgrade */}
        {!profile.isPremium && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Premium</h3>
                  <p className="text-sm text-white/90">Unlock all features</p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI Workout Generation
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Advanced Analytics & Charts
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Photo Workout Scanning
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Unlimited Storage
                </li>
              </ul>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-lg font-bold mb-0.5">{PRICING.monthly.displayPrice}</div>
                  <div className="text-xs text-white/90 mb-2">per month</div>
                  <button 
                    onClick={handleUpgradeMonthly}
                    className="w-full py-2 bg-white text-purple-600 rounded-md font-semibold hover:shadow-lg transition-shadow text-xs"
                  >
                    Monthly
                  </button>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border-2 border-white/40 relative">
                  <div className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-black px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                    Save {PRICING.annual.savings}
                  </div>
                  <div className="text-lg font-bold mb-0.5">{PRICING.annual.displayPrice}</div>
                  <div className="text-xs text-white/90 mb-2">per year</div>
                  <button 
                    onClick={handleUpgradeAnnual}
                    className="w-full py-2 bg-white text-purple-600 rounded-md font-semibold hover:shadow-lg transition-shadow text-xs"
                  >
                    Annual
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Challenges */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Active Challenges</h2>
          
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 light:bg-blue-100 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-500 light:text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white light:text-gray-900 mb-1">Distance Warrior</h3>
                  <p className="text-sm text-gray-400 light:text-gray-600 mb-2">Swim 25,000 yards this week</p>
                  <div className="mb-2">
                    <div className="h-2 bg-white/10 light:bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">17,000 / 25,000 yards</p>
                </div>
                <span className="text-sm font-semibold text-blue-500">+500 XP</span>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 light:bg-green-100 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-500 light:text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white light:text-gray-900 mb-1">Streak Master</h3>
                  <p className="text-sm text-gray-400 light:text-gray-600 mb-2">Practice 5 days in a row</p>
                  <div className="mb-2">
                    <div className="h-2 bg-white/10 light:bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">5 / 5 days ✓</p>
                </div>
                <span className="text-sm font-semibold text-green-500">+300 XP</span>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Badges */}
        <div>
          <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Earned Badges</h2>
          
          <div className="grid grid-cols-4 gap-3">
            {['🏊', '🔥', '⭐', '💪', '🎯', '⚡', '🏆', '👑'].map((emoji, idx) => (
              <Card
                key={idx}
                className="p-4 text-center"
              >
                <div className="text-3xl mb-1">{emoji}</div>
                <p className="text-xs text-gray-500 light:text-gray-600 font-mono">Lvl {idx + 1}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}