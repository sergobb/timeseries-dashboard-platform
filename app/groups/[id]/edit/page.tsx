'use client';

import { useParams } from 'next/navigation';
import GroupFormPage from '@/components/groups/GroupFormPage';

export default function EditGroupPage() {
  const params = useParams();
  const groupId = params.id as string;

  return <GroupFormPage title="Edit Group" groupId={groupId} />;
}
