import type { Metadata } from 'next';
import { PrivacyPolicyView } from '@/components/storefront/PrivacyPolicyView';

export const metadata: Metadata = {
  title: 'Privacy Policy & Trattamento Dati — Vincent Store',
  description: 'Informativa sul trattamento e conservazione dei dati personali di Vincent Store ai sensi del GDPR. Uso esclusivo per la vendita dei prodotti.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
