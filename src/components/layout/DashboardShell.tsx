import { Sidebar } from './Sidebar'
import { Header } from './Header'

type DashboardShellProps = {
  children: React.ReactNode
  title: string
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-fm-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
