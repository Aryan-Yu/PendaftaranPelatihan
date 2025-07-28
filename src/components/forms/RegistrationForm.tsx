// Example (simplified)
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Training, PaymentMethod, RegistrationFormProps } from '../../types';
import QRCode from 'qrcode.react';

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ trainings, paymentMethods, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    nim: '',
    classOption: '',
    phoneNumber: '',
    selectedTraining: '',
    paymentProof: null as File | null,
    selectedPaymentMethod: '',
  });
  const [qrisData, setQrisData] = useState<string | null>(null);
  const [selectedPaymentMethodDetails, setSelectedPaymentMethodDetails] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (formData.selectedPaymentMethod) {
      const method = paymentMethods.find(pm => pm.id === formData.selectedPaymentMethod);
      setSelectedPaymentMethodDetails(method || null);
      if (method?.qris_image_url) {
        setQrisData(method.qris_image_url);
      } else {
        setQrisData(null);
      }
    } else {
      setSelectedPaymentMethodDetails(null);
      setQrisData(null);
    }
  }, [formData.selectedPaymentMethod, paymentMethods]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, paymentProof: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('nim', formData.nim);
    data.append('classOption', formData.classOption);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('trainingId', formData.selectedTraining);
    data.append('selectedPaymentMethodId', formData.selectedPaymentMethod);
    if (formData.paymentProof) {
      data.append('paymentProof', formData.paymentProof);
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setSuccess('Pendaftaran berhasil! Mohon tunggu konfirmasi admin. Silakan bergabung ke grup WhatsApp untuk informasi lebih lanjut: https://chat.whatsapp.com/your-group-link');
        setFormData({ 
          fullName: '', nim: '', classOption: '', phoneNumber: '',
          selectedTraining: '', paymentProof: null, selectedPaymentMethod: ''
        });
        onSubmitSuccess();
      } else {
        const resData = await response.json();
        setError(resData.message || 'Pendaftaran gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan tak terduga.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Form Pendaftaran Pelatihan</h2>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <Input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="nim" className="block text-sm font-medium text-gray-700">NIM</label>
        <Input type="text" id="nim" name="nim" value={formData.nim} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="classOption" className="block text-sm font-medium text-gray-700">Kelas</label>
        <Select id="classOption" name="classOption" value={formData.classOption} onChange={handleChange} required>
          <option value="">Pilih Kelas</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </Select>
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Nomor HP</label>
        <Input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="selectedTraining" className="block text-sm font-medium text-gray-700">Pilih Jadwal Pelatihan</label>
        <Select id="selectedTraining" name="selectedTraining" value={formData.selectedTraining} onChange={handleChange} required>
          <option value="">Pilih Pelatihan</option>
          {trainings.map((training: Training) => (
            <option key={training.id} value={training.id}>
              {training.name} ({new Date(training.start_date).toLocaleDateString()} - {new Date(training.end_date).toLocaleDateString()}) - Kuota: {training.quota - (training.registered_count || 0)}
            </option>
          ))}
        </Select>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Informasi Pembayaran</h3>
        <div>
          <label htmlFor="selectedPaymentMethod" className="block text-sm font-medium text-gray-700">Pilih Metode Pembayaran</label>
          <Select id="selectedPaymentMethod" name="selectedPaymentMethod" value={formData.selectedPaymentMethod} onChange={handleChange} required>
            <option value="">Pilih Metode</option>
            {paymentMethods.filter((pm: PaymentMethod) => pm.is_active).map((method: PaymentMethod) => (
              <option key={method.id} value={method.id}>{method.method_name}</option>
            ))}
          </Select>
        </div>

        {selectedPaymentMethodDetails && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <p className="font-medium">Detail Pembayaran:</p>
            {selectedPaymentMethodDetails.account_info && (
              <p className="text-sm">{selectedPaymentMethodDetails.account_info}</p>
            )}
            {selectedPaymentMethodDetails.qris_image_url && (
              <div className="mt-3 text-center">
                <p className="text-sm mb-2">Scan QRIS ini:</p>
                <img src={selectedPaymentMethodDetails.qris_image_url} alt="QRIS Code" className="mx-auto max-w-[200px] h-auto" />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">Bukti Pembayaran (Upload Foto)</label>
        <Input type="file" id="paymentProof" name="paymentProof" accept="image/*" onChange={handleFileChange} required />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && <div className="text-green-500 text-sm text-center">{success}</div>}

      <Button type="submit" className="w-full">Daftar Sekarang</Button>
    </form>
  );
};
