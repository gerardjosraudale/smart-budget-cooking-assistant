export function Label({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>
}
export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-white/5 card-border shadow-ring placeholder:text-neutral-400 focus-visible:outline-none ${props.className||''}`}
    />
  )
}
export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[120px] p-3 rounded-xl bg-white dark:bg-white/5 card-border shadow-ring placeholder:text-neutral-400 focus-visible:outline-none ${props.className||''}`}
    />
  )
}
