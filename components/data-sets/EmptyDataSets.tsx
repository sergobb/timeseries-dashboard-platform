interface EmptyDataSetsProps {
  message?: string;
}

export default function EmptyDataSets({ 
  message = 'No data sets found. Create your first data set to get started.' 
}: EmptyDataSetsProps) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow">
      <p className="text-[var(--color-muted-foreground)]">
        {message}
      </p>
    </div>
  );
}

