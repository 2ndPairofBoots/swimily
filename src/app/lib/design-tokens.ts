// Centralized Tailwind class tokens for shared primitives.
// This makes it easier to swap implementations for other platforms (e.g., React Native).

export const BUTTON_BASE_STYLES =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

export const BUTTON_VARIANTS: Record<'primary' | 'secondary' | 'ghost' | 'danger', string> = {
  primary: 'bg-cyan-500 text-black hover:bg-cyan-400 active:bg-cyan-600 font-bold',
  secondary:
    'bg-white/10 light:bg-gray-100 text-white light:text-gray-900 hover:bg-white/20 light:hover:bg-gray-200 active:bg-white/5 border border-white/20 light:border-gray-300',
  ghost: 'text-white light:text-gray-900 hover:bg-white/10 light:hover:bg-gray-100 active:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
};

export const BUTTON_SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3.5 text-base',
};

export const CARD_BASE_STYLES =
  'bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white rounded-xl border border-white/10 light:border-gray-200';

export const CARD_HOVER_STYLES =
  'cursor-pointer hover:border-cyan-500/50 light:hover:border-cyan-500/50 transition-colors';

