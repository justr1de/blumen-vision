import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SistemasContent from '@/components/SistemasContent'

export default async function SistemasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return <SistemasContent user={{ name: session.name, email: session.email, role: session.role }} />
}
