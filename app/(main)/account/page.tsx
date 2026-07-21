import { PageShell } from '@/components/layout/PageShell';
import { AccountPageContent } from '@/components/account/AccountPageContent';

export default function AccountPage() {
  return (
    <PageShell size="sm">
      <AccountPageContent />
    </PageShell>
  );
}
