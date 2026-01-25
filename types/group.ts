export type GroupRole = 'view' | 'edit';

export interface Group {
  id: string;
  name: string;
  description: string;
  role: GroupRole;
  memberIds: string[];
  owner: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
