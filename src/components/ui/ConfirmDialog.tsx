'use client';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export const ConfirmDialogProvider = () => {
  return (
    <ConfirmDialog
      style={{ width: '26rem' }}
      breakpoints={{ '960px': '80vw', '640px': '90vw' }}
      className="rounded-xl shadow-2xl overflow-hidden bg-white"
      contentClassName="p-6 text-gray-600 text-base font-normal"
      headerClassName="px-6 pt-5 pb-0 text-xl font-bold text-gray-800 border-none"
      acceptClassName="bg-green-600 border-none hover:bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
      rejectClassName="bg-white border-gray-200 border hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
      acceptLabel="Confirm"
      rejectLabel="Cancel"
      position="center"
      dismissableMask={true}
      maskClassName="bg-black/50 backdrop-blur-sm"
      footer={(options) => (
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button 
            onClick={options.reject} 
            className="bg-white border-gray-200 border hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={options.accept} 
            className="bg-green-600 border-none hover:bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
            autoFocus
          >
            {options.acceptLabel}
          </button>
        </div>
      )}
    />
  );
};

/**
 * Shows a confirm dialog with the specified options
 * @param message The message to display
 * @param header The dialog header
 * @param onConfirm Function to call when confirmed
 * @param onCancel Function to call when canceled
 * @param confirmLabel Optional custom label for confirm button (defaults to 'Confirm')
 * @param confirmButtonClass Optional CSS class for confirm button (defaults to green)
 */
export const showConfirmDialog = ({
  message,
  header,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmButtonClass,
}: {
  message: string;
  header?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  confirmButtonClass?: string;
}) => {
  confirmDialog({
    message,
    header: header || 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: onConfirm,
    reject: onCancel,
    acceptLabel: confirmLabel,
    acceptClassName: confirmButtonClass || 'bg-green-600 border-none hover:bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors',
  });
};
