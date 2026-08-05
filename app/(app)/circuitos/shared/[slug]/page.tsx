import { SharedCircuitView } from '@/components/SharedCircuitView';

export default async function SharedCircuitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <SharedCircuitView slug={slug} />;
}
