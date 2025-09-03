export function Card({ className='', children }) {
  return (
    <div className={`rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur card-border shadow-soft ${className}`}>
      {children}
    </div>
  )
}
export function CardBody({ className='', children }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>
}
export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="px-5 sm:px-6 pt-5 sm:pt-6 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
