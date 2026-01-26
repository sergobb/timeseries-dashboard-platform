import { ReactNode, useId, cloneElement, isValidElement, ReactElement } from 'react';
import Box from '@/components/ui/Box';
import Label from '@/components/ui/Label';
import Text from '@/components/ui/Text';

interface FormFieldProps {
  label: string | ReactNode;
  required?: boolean;
  hint?: string | ReactNode;
  error?: string;
  children: ReactNode;
  labelClassName?: string;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  labelClassName = '',
  className = '',
}: FormFieldProps) {
  const generatedId = useId();

  // Клонируем children и добавляем id, если его еще нет
  let fieldId = generatedId;
  const fieldElement = isValidElement(children)
    ? (() => {
        const props = children.props as Record<string, unknown> | null;
        const existingId = props?.id as string | undefined;
        fieldId = existingId || generatedId;
        const newProps = props ? { ...props, id: fieldId } : { id: fieldId };
        return cloneElement(children as ReactElement<any>, newProps);
      })()
    : children;

  return (
    <Box className={className}>
      <Label htmlFor={fieldId} className={`mb-2 ${labelClassName}`.trim()}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {fieldElement}
      {hint && !error && (
        <Text size="xs" variant="muted" className="mt-2">
          {hint}
        </Text>
      )}
      {error && (
        <Text size="xs" variant="error" className="mt-2">
          {error}
        </Text>
      )}
    </Box>
  );
}
