import { Suspense } from 'react';
import { FieldsPageContent } from '@/components/field/FieldsPageContent';

export default function FieldsPage() {
  return (
    <Suspense fallback={null}>
      <FieldsPageContent />
    </Suspense>
  );
}
