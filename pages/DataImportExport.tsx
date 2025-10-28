import React, { useState } from 'react';
import { Account, Transaction, Budget, RecurringTransaction, ImportExportHistoryItem, HistoryStatus, ImportDataType, Category, Backup } from '../types';
import Card from '../components/Card';
import { BTN_PRIMARY_STYLE } from '../constants';
import Modal from '../components/Modal';
import ImportWizard from '../components/ImportWizard';
import ExportModal from '../components/ExportModal';
import ImportDetailsModal from '../components/ImportDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import FinalConfirmationModal from '../components/FinalConfirmationModal';

interface DataManagementProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  allCategories: Category[];
  history: ImportExportHistoryItem[];
  onPublishImport: (items: any[], dataType: 'accounts' | 'transactions', fileName: string, originalData: Record<string, any>[], errors: Record<number, Record<string, string>>) => void;
  onDeleteHistoryItem: (id: string) => void;
  onDeleteImportedTransactions: (importId: string) => void;
  onResetAccount: () => void;
  onResetAndPreload: () => void;
  backups: Backup[];
  onCreateBackup: () => void;
  onRestoreBackup: (id: string) => void;
  onDeleteBackup: (id: string) => void;
}

const HistoryItem: React.FC<{ item: ImportExportHistoryItem; onDelete: (id: string) => void; onView: (item: ImportExportHistoryItem) => void; }> = ({ item, onDelete, onView }) => {
    const { status, type, fileName, date } = item;
    
    const statusConfig: { [key in HistoryStatus]: { color: string; icon: string } } = {
        'Complete': { color: 'text-green-500', icon: 'check_circle' },
        'Failed': { color: 'text-red-500', icon: 'error' },
        'In Progress': { color: 'text-blue-500', icon: 'sync' }
    };
    
    const { color } = statusConfig[status];

    const formattedDate = new Date(date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 last:border-b-0">
            <div>
                <p className="font-semibold text-base text-light-text dark:text-dark-text">{type === 'import' ? `Transaction Import` : `Export from`} {formattedDate}</p>
                <div className="flex items-center gap-2 text-sm">
                    {type === 'export' && <p className="text-light-text-secondary dark:text-dark-text-secondary">{fileName}</p>}
                    <span className={`font-semibold ${color}`}>{status}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                {status === 'Failed' && <button onClick={() => alert('Retry functionality not implemented yet.')} className="p-2 hover:text-red-500"><span className="material-symbols-outlined">sync</span></button>}
                <button onClick={() => onView(item)} className="p-2 hover:text-primary-500"><span className="material-symbols-outlined">visibility</span></button>
                <button onClick={() => onDelete(item.id)} className="p-2 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
            </div>
        </div>
    );
};


const NewImportModal: React.FC<{ onClose: () => void, onSelect: (type: ImportDataType) => void }> = ({ onClose, onSelect }) => {
    
    const sources: { name: string; icon: string; type: ImportDataType, enabled: boolean, description: string }[] = [
        { name: 'Transactions (CSV)', icon: 'receipt_long', type: 'transactions', enabled: true, description: 'Import transactions from a CSV file.' },
        { name: 'Accounts (CSV)', icon: 'wallet', type: 'accounts', enabled: true, description: 'Import accounts from a CSV file.' },
        { name: 'OFX / QIF file', icon: 'file_upload', type: 'mint', enabled: false, description: 'Import from financial software formats. (Coming soon)' },
    ];
    
    return (
        <Modal onClose={onClose} title="New Import">
            <div className="space-y-4">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Select the type of data you would like to import.
                </p>
                <div className="space-y-2">
                    {sources.map(source => (
                        <button 
                            key={source.type}
                            onClick={() => onSelect(source.type)}
                            disabled={!source.enabled}
                            className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-500">{source.icon}</span>
                                <div>
                                    <span className="font-semibold text-light-text dark:text-dark-text">{source.name}</span>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{source.description}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-light-text-secondary dark:text-dark-text-secondary">chevron_right</span>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

const DataManagement: React.FC<DataManagementProps> = (props) => {
    const [isNewImportModalOpen, setNewImportModalOpen] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [isWizardOpen, setWizardOpen] = useState(false);
    const [importType, setImportType] = useState<'transactions' | 'accounts' | null>(null);
    const [viewingDetails, setViewingDetails] = useState<ImportExportHistoryItem | null>(null);
    const [confirmingAction, setConfirmingAction] = useState<{ type: 'restore' | 'deleteBackup' | 'reset' | 'preload', id?: string } | null>(null);
    const [isFinalConfirmOpen, setFinalConfirmOpen] = useState(false);

    const importHistory = props.history.filter(h => h.type === 'import');
    const exportHistory = props.history.filter(h => h.type === 'export');

    const handleSelectImportType = (type: ImportDataType) => {
        if (type === 'transactions' || type === 'accounts') {
            setImportType(type);
            setNewImportModalOpen(false);
            setWizardOpen(true);
        }
    };

    const handleWizardClose = () => {
        setWizardOpen(false);
        setImportType(null);
    };

    const handleCreateBackup = () => {
        props.onCreateBackup();
        alert('Backup snapshot created successfully.');
    };

    const handleConfirmAction = () => {
        if (!confirmingAction) return;

        switch (confirmingAction.type) {
            case 'restore':
                if (confirmingAction.id) props.onRestoreBackup(confirmingAction.id);
                break;
            case 'deleteBackup':
                if (confirmingAction.id) props.onDeleteBackup(confirmingAction.id);
                break;
            case 'reset':
            case 'preload':
                setFinalConfirmOpen(true); // Move to final confirmation step
                return; // Don't close the first modal yet
        }
        setConfirmingAction(null);
    };

    const handleFinalConfirm = () => {
        if (!confirmingAction) return;

        if (confirmingAction.type === 'reset') {
            props.onResetAccount();
            alert('Account has been reset.');
        } else if (confirmingAction.type === 'preload') {
            props.onResetAndPreload();
            alert('Account has been reset and preloaded with sample data.');
        }
        setFinalConfirmOpen(false);
        setConfirmingAction(null);
    };
    
    const getConfirmationDetails = () => {
        if (!confirmingAction) return null;
        switch (confirmingAction.type) {
            case 'restore': return { title: 'Confirm Restore', message: 'Restoring from this backup will overwrite all current data. This action cannot be undone. Are you sure you want to continue?', confirmText: 'Restore' };
            case 'deleteBackup': return { title: 'Confirm Delete', message: 'Are you sure you want to delete this backup snapshot? This is permanent.', confirmText: 'Delete' };
            case 'reset': return { title: 'Confirm Account Reset', message: 'This action will delete all your data. This cannot be undone. You will be asked for a final confirmation.', confirmText: 'Continue', variant: 'primary' as const };
            case 'preload': return { title: 'Confirm Reset & Preload', message: 'This action will delete all current data and load sample data. This cannot be undone. You will be asked for a final confirmation.', confirmText: 'Continue', variant: 'primary' as const };
            default: return null;
        }
    };

  return (
    <div className="space-y-8">
      {isNewImportModalOpen && <NewImportModal onClose={() => setNewImportModalOpen(false)} onSelect={handleSelectImportType} />}
      {isExportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} onExport={() => {}} />}
      {viewingDetails && <ImportDetailsModal item={viewingDetails} onClose={() => setViewingDetails(null)} onDeleteImport={props.onDeleteImportedTransactions} />}
      {isWizardOpen && importType && (
            <ImportWizard 
                importType={importType}
                onClose={handleWizardClose}
                onPublish={props.onPublishImport}
                existingAccounts={props.accounts}
                allCategories={props.allCategories}
            />
        )}
      
      {confirmingAction && getConfirmationDetails() && !isFinalConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmingAction(null)}
          onConfirm={handleConfirmAction}
          title={getConfirmationDetails()!.title}
          message={getConfirmationDetails()!.message}
          confirmButtonText={getConfirmationDetails()!.confirmText}
          confirmButtonVariant={getConfirmationDetails()!.variant || 'danger'}
        />
      )}
      
      {isFinalConfirmOpen && confirmingAction && (
        <FinalConfirmationModal
          isOpen={true}
          onClose={() => { setFinalConfirmOpen(false); setConfirmingAction(null); }}
          onConfirm={handleFinalConfirm}
          title="Final Confirmation"
          message={<p>This is your last chance. Once you confirm, the action will be executed permanently.</p>}
          requiredText="RESET"
          confirmButtonText={confirmingAction.type === 'reset' ? 'Reset account' : 'Reset and preload'}
        />
      )}


      <header>
        <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="text-light-text-secondary dark:text-dark-text-secondary">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <span className="hover:underline cursor-pointer">Settings</span>
                <span> / </span>
                <span className="text-light-text dark:text-dark-text font-medium">Data Management</span>
            </div>
        </div>
         <div className="mt-4">
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Data Management</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your application data, including imports, exports, and resetting data.</p>
        </div>
      </header>

      <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Backup & Restore</h3>
                    <button onClick={handleCreateBackup} className={`${BTN_PRIMARY_STYLE} flex items-center gap-2`}>
                        <span className="material-symbols-outlined">add</span>
                        Create New Backup
                    </button>
                </div>
                <div>
                    {props.backups.length > 0 ? (
                        props.backups.map(backup => (
                            <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                <div>
                                    <p className="font-semibold text-light-text dark:text-dark-text">Snapshot from {new Date(backup.date).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setConfirmingAction({ type: 'restore', id: backup.id })} className="font-semibold text-primary-600 dark:text-primary-400 text-sm">Restore</button>
                                    <button onClick={() => setConfirmingAction({ type: 'deleteBackup', id: backup.id })} className="p-2 text-red-500/80 hover:bg-red-500/10 rounded-full"><span className="material-symbols-outlined text-base">delete</span></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-4 text-light-text-secondary dark:text-dark-text-secondary">No backups created yet.</p>
                    )}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Imports</h3>
                    <button onClick={() => setNewImportModalOpen(true)} className={`${BTN_PRIMARY_STYLE} flex items-center gap-2`}>
                        <span className="material-symbols-outlined">add</span>
                        New Import
                    </button>
                </div>
                <div>
                    {importHistory.length > 0 ? (
                        importHistory.map(item => <HistoryItem key={item.id} item={item} onDelete={props.onDeleteHistoryItem} onView={setViewingDetails} />)
                    ) : (
                        <p className="text-center py-4 text-light-text-secondary dark:text-dark-text-secondary">No import history.</p>
                    )}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Exports</h3>
                    <button onClick={() => setExportModalOpen(true)} className={`${BTN_PRIMARY_STYLE} flex items-center gap-2`}>
                       <span className="material-symbols-outlined">add</span>
                        New Export
                    </button>
                </div>
                 <div>
                    {exportHistory.length > 0 ? (
                        exportHistory.map(item => <HistoryItem key={item.id} item={item} onDelete={props.onDeleteHistoryItem} onView={() => alert('View details functionality for exports not implemented yet.')} />)
                    ) : (
                         <p className="text-center py-4 text-light-text-secondary dark:text-dark-text-secondary">No export history.</p>
                    )}
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold mb-2 text-red-500">Danger Zone</h3>
                <div className="space-y-4 divide-y divide-black/5 dark:divide-white/10">
                    <div className="pt-4 flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-light-text dark:text-dark-text">Reset account</h4>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mt-1">Resetting your account will delete all your accounts, categories, merchants, tags, and other data, but keep your user account intact.</p>
                        </div>
                        <button onClick={() => setConfirmingAction({ type: 'reset' })} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shrink-0">Reset account</button>
                    </div>
                    <div className="pt-4 flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-light-text dark:text-dark-text">Reset and preload</h4>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mt-1">Delete all your existing data and then load fresh sample data so you can explore with a pre-filled environment.</p>
                        </div>
                        <button onClick={() => setConfirmingAction({ type: 'preload' })} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shrink-0">Reset and preload</button>
                    </div>
                </div>
            </Card>
      </div>

    </div>
  );
};

export default DataManagement;