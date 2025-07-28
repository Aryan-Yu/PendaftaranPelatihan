'use client';
import React, { useState } from 'react';
import { PaymentMethod, PaymentMethodManagementProps } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const PaymentMethodManagement: React.FC<PaymentMethodManagementProps> = ({ paymentMethods, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [formState, setFormState] = useState({
    methodName: '',
    accountInfo: '',
    qrisImage: null as File | null,
    isActive: true,
    existingQrisImageUrl: null as string | null,
  });

  const openModal = (method?: PaymentMethod) => {
    if (method) {
      setCurrentMethod(method);
      setFormState({
        methodName: method.method_name,
        accountInfo: method.account_info || '',
        qrisImage: null,
        isActive: method.is_active,
        existingQrisImageUrl: method.qris_image_url,
      });
    } else {
      setCurrentMethod(null);
      setFormState({ methodName: '', accountInfo: '', qrisImage: null, isActive: true, existingQrisImageUrl: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMethod(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormState(prev => ({ ...prev, qrisImage: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentMethod ? 'PUT' : 'POST';
    const url = '/api/admin/payment-methods';

    const formData = new FormData();
    if (currentMethod) formData.append('id', currentMethod.id);
    formData.append('methodName', formState.methodName);
    formData.append('accountInfo', formState.accountInfo);
    formData.append('isActive', String(formState.isActive));
    if (formState.qrisImage) {
      formData.append('qrisImage', formState.qrisImage);
    } else if (formState.existingQrisImageUrl) {
      formData.append('existingQrisImageUrl', formState.existingQrisImageUrl);
    }

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        onUpdate();
        closeModal();
      } else {
        alert('Failed to save payment method.');
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('An error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        const response = await fetch('/api/admin/payment-methods', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          onUpdate();
        } else {
          alert('Failed to delete payment method.');
        }
      } catch (error) {
        console.error('Error deleting payment method:', error);
        alert('An error occurred.');
      }
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={() => openModal()} className="mb-4">Add New Payment Method</Button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Method Name</th>
              <th className="py-2 px-4 border-b">Account Info</th>
              <th className="py-2 px-4 border-b">QRIS Image</th>
              <th className="py-2 px-4 border-b">Active</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method: PaymentMethod) => (
              <tr key={method.id}>
                <td className="py-2 px-4 border-b">{method.method_name}</td>
                <td className="py-2 px-4 border-b">{method.account_info || '-'}</td>
                <td className="py-2 px-4 border-b">
                  {method.qris_image_url ? (
                    <a href={method.qris_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View QRIS</a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-2 px-4 border-b">{method.is_active ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">
                  <Button onClick={() => openModal(method)} className="mr-2">Edit</Button>
                  <Button onClick={() => handleDelete(method.id)} variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="methodName" className="block text-sm font-medium text-gray-700">Method Name</label>
            <Input type="text" id="methodName" name="methodName" value={formState.methodName} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700">Account Info</label>
            <textarea id="accountInfo" name="accountInfo" value={formState.accountInfo} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
          </div>
          <div>
            <label htmlFor="qrisImage" className="block text-sm font-medium text-gray-700">QRIS Image</label>
            <Input type="file" id="qrisImage" name="qrisImage" accept="image/*" onChange={handleFileChange} />
            {formState.existingQrisImageUrl && !formState.qrisImage && (
              <p className="text-sm text-gray-500 mt-1">Current: <a href={formState.existingQrisImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View QRIS</a></p>
            )}
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" name="isActive" checked={formState.isActive} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{currentMethod ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
