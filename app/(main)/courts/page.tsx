import { Suspense } from 'react';
import { FieldsPageContent } from '@/components/field/fields-page';

export default function CourtsPage() {
  return (
    <Suspense fallback={null}>
      <FieldsPageContent />
    </Suspense>
  );
}
