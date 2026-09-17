import PhasePlaceholder from '../components/ui/PhasePlaceholder';
import { useDocumentHead } from '../hooks/useDocumentHead';

export default function About() {
  useDocumentHead({
    title: 'About Us',
    description: "Our story and what makes MeShape Gift Shop's gifting experience special.",
  });

  return (
    <PhasePlaceholder
      title="About MeShape Gift Shop"
      description="Our story and what makes MeShape's gifting experience special."
      phaseNote="Content expands in a later phase"
    />
  );
}
