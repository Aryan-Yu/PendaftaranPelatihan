import React, { useState, useEffect } from 'react';
import { Training, Registration, PaymentMethod } from '../../types';
import { TrainingManagement } from './TrainingManagement';
import { RegistrationList } from './RegistrationList';
import { PaymentMethodManagement } from './PaymentMethodManagement';
import { CSVExportButton } from './CSVExportButton';

export const AdminDashboard: React.FC<{ activeTab: 'registrations' | 'trainings' | 'paymentMethods'; onTabChange: (tab: 'registrations' | 'trainings' | 'paymentMethods') => void }> = ({ activeTab, onTabChange }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const fetchData = async () => {
    try {
      const [trainingsRes, registrationsRes, paymentMethodsRes] = await Promise.all([
        fetch('/api/admin/trainings'),
        fetch('/api/admin/registrations'),
        fetch('/api/admin/payment-methods'),
      ]);

      if (trainingsRes.ok) setTrainings(await trainingsRes.json());
      if (registrationsRes.ok) setRegistrations(await registrationsRes.json());
      if (paymentMethodsRes.ok) setPaymentMethods(await paymentMethodsRes.json());

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 text-lg ${activeTab === 'registrations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => onTabChange('registrations')}
          >
            Manajemen Pendaftaran
          </button>
          <button
            className={`py-2 px-4 text-lg ${activeTab === 'trainings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => onTabChange('trainings')}
          >
            Manajemen Pelatihan
          </button>
          <button
            className={`py-2 px-4 text-lg ${activeTab === 'paymentMethods' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => onTabChange('paymentMethods')}
          >
            Manajemen Pembayaran
          </button>
        </div>
      </div>

      {activeTab === 'registrations' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daftar Pendaftar</h2>
          <CSVExportButton data={registrations} filename="registrations" />
          <RegistrationList registrations={registrations} trainings={trainings} onUpdate={fetchData} />
        </div>
      )}

      {activeTab === 'trainings' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manajemen Pelatihan</h2>
          <TrainingManagement trainings={trainings} onUpdate={fetchData} />
        </div>
      )}

      {activeTab === 'paymentMethods' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manajemen Metode Pembayaran</h2>
          <PaymentMethodManagement paymentMethods={paymentMethods} onUpdate={fetchData} />
        </div>
      )}
    </div>
  );
};
