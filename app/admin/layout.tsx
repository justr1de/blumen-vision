import AdminSidebar from '@/components/AdminSidebar'
import DataRoFooter from '@/components/DataRoFooter'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-8">
          {children}
        </main>
        <DataRoFooter />
      </div>
    </div>
  )
}
