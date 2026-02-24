import { redirect } from 'react-router';

export function loader({ params }: { params: { orgSlug: string } }) {
  return redirect(`/${params.orgSlug}/credentials?tab=collections`);
}

export default function CollectionsRedirect() {
  return null;
}
