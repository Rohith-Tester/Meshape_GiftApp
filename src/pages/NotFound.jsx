import PhasePlaceholder from '../components/ui/PhasePlaceholder';
import { useDocumentHead } from '../hooks/useDocumentHead';

export default function NotFound() {
  useDocumentHead({ title: 'Page Not Found', description: 'This page could not be found.', noindex: true });

  return (
    <PhasePlaceholder
      title="We couldn't find that page"
      description="The gift you're looking for may have moved. Head back home and continue browsing."
    />
  );
}
