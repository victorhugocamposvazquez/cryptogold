import { notFound } from "next/navigation";
import DocPage from "@/components/screens/DocPage";
import { docMap, docSlugs } from "@/lib/docs";

export function generateStaticParams() {
  return docSlugs.map((slug) => ({ slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const doc = docMap[params.slug];
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
