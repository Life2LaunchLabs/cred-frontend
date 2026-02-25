import { redirect } from 'react-router';

export function loader({ params }: { params: { orgSlug: string } }) {
  return redirect(`/${params.orgSlug}/learners?tab=cohorts`);
}

export default function CohortsRedirect() {
  return null;
}
