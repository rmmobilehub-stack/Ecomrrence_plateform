import PhoneCheckPage from '@/app/store/[storeSlug]/phone-check/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultPhoneCheckPage() {
  return <PhoneCheckPage params={{ storeSlug: defaultStoreSlug }} />;
}
