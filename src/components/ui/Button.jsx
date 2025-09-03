import clsx from 'clsx'

export default function Button({ as:As='button', variant='primary', size='md', className, children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl font-medium transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-base' };
  const variants = {
    primary: 'bg-bluetint text-white hover:brightness-105 shadow-soft',
    secondary: 'bg-white text-ink hover:bg-white/90 card-border shadow-soft dark:bg-steel dark:text-silver',
    subtle: 'bg-white/70 backdrop-blur text-ink hover:bg-white/90 card-border shadow-soft dark:bg-white/5 dark:text-silver',
    ghost: 'bg-transparent text-ink hover:bg-black/5 dark:hover:bg-white/10',
    destructive: 'bg-red-600 text-white hover:bg-red-500'
  };
  return (
    <As className={clsx(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </As>
  )
}
