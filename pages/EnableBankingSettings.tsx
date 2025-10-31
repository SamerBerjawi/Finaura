import React, { useState } from 'react';
import { Account, EnableBankingSettings, Page } from '../types';
import Card from '../components/Card';
import { BTN_PRIMARY_STYLE, BTN_SECONDARY_STYLE, SELECT_ARROW_STYLE, SELECT_WRAPPER_STYLE, INPUT_BASE_STYLE, BTN_DANGER_STYLE } from '../constants';
import ConfirmationModal from '../components/ConfirmationModal';

interface EnableBankingSettingsProps {
    linkedAccounts: Account[];
    settings: EnableBankingSettings;
    setSettings: (settings: EnableBankingSettings) => void;
    onStartConnection: () => void;
    onUnlinkAccount: (accountId: string) => void;
    onManualSync: (accountId: string) => void;
    setCurrentPage: (page: Page) => void;
}

const EnableBankingSettingsPage: React.FC<EnableBankingSettingsProps> = ({
    linkedAccounts,
    settings,
    setSettings,
    onStartConnection,
    onUnlinkAccount,
    onManualSync,
    setCurrentPage,
}) => {
    const [confirmingUnlink, setConfirmingUnlink] = useState<Account | null>(null);

    const handleUnlinkClick = (account: Account) => {
        setConfirmingUnlink(account);
    };
    
    const handleConfirmUnlink = () => {
        if (confirmingUnlink) {
            onUnlinkAccount(confirmingUnlink.id);
            setConfirmingUnlink(null);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {confirmingUnlink && (
                <ConfirmationModal
                    isOpen={!!confirmingUnlink}
                    onClose={() => setConfirmingUnlink(null)}
                    onConfirm={handleConfirmUnlink}
                    title="Confirm Unlink"
                    message={`Are you sure you want to unlink the account "${confirmingUnlink.name}"? This will stop automatic transaction syncing.`}
                    confirmButtonText="Unlink"
                />
            )}
            <header>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentPage('Settings')} className="text-light-text-secondary dark:text-dark-text-secondary p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <span onClick={() => setCurrentPage('Settings')} className="hover:underline cursor-pointer">Settings</span>
                        <span> / </span>
                        <span className="text-light-text dark:text-dark-text font-medium">Enable Banking</span>
                    </div>
                </div>
                <div className="mt-4">
                    {/* <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Enable Banking Settings</h2> */}
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your connected bank accounts and sync settings.</p>
                </div>
            </header>

            <Card>
                <h3 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">General Settings</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">Automatic Syncing</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Automatically sync transactions from your linked accounts.</p>
                        </div>
                        <div 
                            onClick={() => setSettings({ ...settings, autoSyncEnabled: !settings.autoSyncEnabled })}
                            className={`w-12 h-6 rounded-full p-1 flex items-center cursor-pointer transition-colors ${settings.autoSyncEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white dark:bg-dark-card shadow-md transform transition-transform ${settings.autoSyncEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="font-medium">Sync Frequency</p>
                        <div className={`${SELECT_WRAPPER_STYLE} max-w-xs`}>
                            <select 
                                value={settings.syncFrequency} 
                                onChange={(e) => setSettings({ ...settings, syncFrequency: e.target.value as 'daily' | 'twice_daily' })} 
                                className={INPUT_BASE_STYLE}
                                disabled={!settings.autoSyncEnabled}
                            >
                                <option value="daily">Once a day</option>
                                <option value="twice_daily">Twice a day</option>
                            </select>
                            <div className={SELECT_ARROW_STYLE}><span className="material-symbols-outlined">expand_more</span></div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">Connected Accounts</h3>
                    <button onClick={onStartConnection} className={`${BTN_PRIMARY_STYLE} flex items-center gap-2`}>
                        <span className="material-symbols-outlined">add</span>
                        Link New Bank
                    </button>
                </div>
                <div className="space-y-2">
                    {linkedAccounts.length > 0 ? (
                        linkedAccounts.map(account => (
                            <div key={account.id} className="flex flex-wrap justify-between items-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group">
                                <div>
                                    <p className="font-semibold">{account.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        <span>{account.enableBankingInstitution}</span>
                                        <span>&bull;</span>
                                        <span>Last sync: {account.lastSync ? new Date(account.lastSync).toLocaleString() : 'Never'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button onClick={() => onManualSync(account.id)} className={`${BTN_SECONDARY_STYLE} py-1.5 px-3 text-sm`}>Sync Now</button>
                                    <button onClick={() => handleUnlinkClick(account)} className={`${BTN_DANGER_STYLE} py-1.5 px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity`}>Unlink</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                            No bank accounts have been linked yet.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default EnableBankingSettingsPage;