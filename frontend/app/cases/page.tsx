import { redirect } from 'next/navigation';

export default function CasesPage() {
  redirect('/operations?tab=cases');
}
