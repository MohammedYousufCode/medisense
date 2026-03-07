import { type LucideIcon, FileText } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-200 mb-4">
        <Icon size={32} className="text-gray-500" />
      </div>
      <h3 className="text-white dark:text-white light:text-gray-900 font-semibold text-lg mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-500 light:text-gray-600 text-sm max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
