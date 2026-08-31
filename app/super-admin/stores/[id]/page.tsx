import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import StoreSettingsForm from '@/components/admin/StoreSettingsForm';

export default function SuperAdminStoreEditor({ params }: { params: { id: string } }) {
  return <>
    <div className="page-header">
      <div>
        <Link href="/super-admin/stores" className="back-link"><ArrowLeft size={15}/> All stores</Link>
        <h1 className="page-title">Edit storefront</h1>
        <p className="page-subtitle">Manage branding, About content, social links and store details.</p>
      </div>
    </div>
    <StoreSettingsForm endpoint={`/api/super-admin/stores/${params.id}`} complete/>
  </>;
}
