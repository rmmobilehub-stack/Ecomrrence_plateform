export type StatusUpdateEntry = {
  status: string;
  note: string;
  at: string;
  emailSent: boolean;
};

export function formatStatusLabel(status: string): string {
  return status
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildStatusNotifyMessage(input: {
  storeName: string;
  referenceLabel: string;
  referenceNumber: string;
  customerName: string;
  status: string;
  note?: string;
  extraLines?: string[];
}): string {
  const lines = [
    `Hi ${input.customerName},`,
    '',
    `${input.storeName} update:`,
    `${input.referenceLabel}: ${input.referenceNumber}`,
    `Status: ${formatStatusLabel(input.status)}`,
  ];

  if (input.extraLines?.length) {
    lines.push('', ...input.extraLines);
  }

  const note = input.note?.trim();
  if (note) {
    lines.push('', `Note from team:`, note);
  }

  lines.push('', 'Reply on this chat if you have any questions.');
  return lines.join('\n');
}

export function appendStatusUpdate(
  existing: StatusUpdateEntry[] | undefined,
  entry: StatusUpdateEntry
): StatusUpdateEntry[] {
  return [...(existing ?? []), entry].slice(-30);
}
