'use client';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export const ConfirmDialogProvider = () => {
  return (
    <ConfirmDialog
      style={{ width: '28rem' }}
      breakpoints={{ '960px': '80vw', '640px': '90vw' }}
      className="rounded-2xl shadow-2xl p-6 animate-fade-in bg-white"
      headerClassName="text-lg font-bold text-gray-800"
      contentClassName="text-gray-600"
      acceptClassName="bg-green-500 border-none hover:bg-green-600 text-white px-4 py-2 rounded-full text-base shadow-md transition-all duration-300"
      rejectClassName="bg-gray-300 border-none hover:bg-gray-400 text-black px-4 py-2 rounded-full text-base shadow-md transition-all duration-300"
      acceptLabel="Yes, Confirm"
      rejectLabel="Cancel"
      position="top-center"
    />
  );
};

export const showConfirmDialog = ({
  message,
  header,
  onConfirm,
  onCancel,
}: {
  message: string;
  header?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) => {
  confirmDialog({
    message,
    header: header || 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: onConfirm,
    reject: onCancel,
  });
};
