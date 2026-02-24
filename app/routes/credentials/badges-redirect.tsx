import { redirect } from 'react-router';

export function loader({ params }: { params: { orgSlug: string } }) {
  return redirect(`/${params.orgSlug}/credentials?tab=badges`);
}

export default function BadgesRedirect() {
  return null;
}
