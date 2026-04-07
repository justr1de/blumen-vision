import ClientSidebar from '@/components/ClientSidebar'
import DataRoFooter from '@/components/DataRoFooter'

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-8">
          {children}
        </main>
        <DataRoFooter />
      </div>
    </div>
  )
}
