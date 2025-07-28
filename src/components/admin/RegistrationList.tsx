'use client';
import React, { useState } from 'react';
import { Registration, RegistrationListProps, Training } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const RegistrationList: React.FC<RegistrationListProps> = ({ registrations, trainings, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<Registration>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrainingId, setFilterTrainingId] = useState<string>('all');

  const openEditModal = (registration: Registration) => {
    setCurrentRegistration(registration);
    setEditFormState(registration);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentRegistration(null);
    setEditFormState({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRegistration) return;

    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentRegistration.id, ...editFormState }),
      });

      if (response.ok) {
        onUpdate();
        closeEditModal();
      } else {
        alert('Failed to update registration.');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('An error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this registration?')) {
      try {
        const response = await fetch('/api/admin/registrations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          onUpdate();
        } else {
          alert('Failed to delete registration.');
        }
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('An error occurred.');
      }
    }
  };

  const filteredRegistrations = registrations.filter((reg: Registration) => {
    const statusMatch = filterStatus === 'all' || reg.status === filterStatus;
    const trainingMatch = filterTrainingId === 'all' || reg.training_id === filterTrainingId;
    return statusMatch && trainingMatch;
  });

  return (
    <div className="overflow-x-auto mt-4">
      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Filter Status</label>
          <Select id="filterStatus" name="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
        <div>
          <label htmlFor="filterTraining" className="block text-sm font-medium text-gray-700">Filter Pelatihan</label>
          <Select id="filterTraining" name="filterTraining" value={filterTrainingId} onChange={(e) => setFilterTrainingId(e.target.value)}>
            <option value="all">All</option>
            {trainings.map(training => (
              <option key={training.id} value={training.id}>{training.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama</th>
            <th className="py-2 px-4 border-b">NIM</th>
            <th className="py-2 px-4 border-b">Kelas</th>
            <th className="py-2 px-4 border-b">Nomor HP</th>
            <th className="py-2 px-4 border-b">Pelatihan</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Bukti Bayar</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRegistrations.map((reg: Registration) => (
            <tr key={reg.id}>
              <td className="py-2 px-4 border-b">{reg.full_name}</td>
              <td className="py-2 px-4 border-b">{reg.nim}</td>
              <td className="py-2 px-4 border-b">{reg.class_option}</td>
              <td className="py-2 px-4 border-b">{reg.phone_number}</td>
              <td className="py-2 px-4 border-b">{reg.training_name}</td>
              <td className="py-2 px-4 border-b">{reg.status}</td>
              <td className="py-2 px-4 border-b">
                {reg.payment_proof_url ? (
                  <a href={reg.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <Button onClick={() => openEditModal(reg)} className="mr-2">Edit</Button>
                <Button onClick={() => handleDelete(reg.id)} variant="danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Registration">
        {currentRegistration && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <Input type="text" id="full_name" name="full_name" value={editFormState.full_name || ''} onChange={handleEditChange} required />
            </div>
            <div>
              <label htmlFor="nim" className="block text-sm font-medium text-gray-700">NIM</label>
              <Input type="text" id="nim" name="nim" value={editFormState.nim || ''} onChange={handleEditChange} required />
            </div>
            <div>
              <label htmlFor="class_option" className="block text-sm font-medium text-gray-700">Kelas</label>
              <Select id="class_option" name="class_option" value={editFormState.class_option || ''} onChange={handleEditChange} required>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Nomor HP</label>
              <Input type="tel" id="phone_number" name="phone_number" value={editFormState.phone_number || ''} onChange={handleEditChange} required />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <Select id="status" name="status" value={editFormState.status || 'pending'} onChange={handleEditChange} required>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            {/* Add training selection if needed for editing */}
            {editFormState.payment_proof_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Bukti Pembayaran</label>
                <a href={editFormState.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Current Proof</a>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={closeEditModal}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
