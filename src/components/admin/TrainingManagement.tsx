'use client';
import React, { useState } from 'react';
import { Training, TrainingManagementProps } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const TrainingManagement: React.FC<TrainingManagementProps> = ({ trainings, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTraining, setCurrentTraining] = useState<Training | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    start_date: '',
    end_date: '',
    quota: 0,
    material: '', // New field
  });

  const openModal = (training?: Training) => {
    if (training) {
      setCurrentTraining(training);
      setFormState({
        name: training.name,
        start_date: training.start_date.split('T')[0],
        end_date: training.end_date.split('T')[0],
        quota: training.quota || 0, // Ensure quota is a number, default to 0
        material: training.material || '', // Set existing material or empty string
      });
    } else {
      setCurrentTraining(null);
      setFormState({ name: '', start_date: '', end_date: '', quota: 0, material: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTraining(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'quota' ? parseInt(value) || 0 : value, // Ensure parseInt result is a number, default to 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentTraining ? 'PUT' : 'POST';
    const url = '/api/admin/trainings';
    const body = currentTraining ? { ...formState, id: currentTraining.id } : formState;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onUpdate();
        closeModal();
      } else {
        alert('Failed to save training.');
      }
    } catch (error) {
      console.error('Error saving training:', error);
      alert('An error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this training?')) {
      try {
        const response = await fetch('/api/admin/trainings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          onUpdate();
        } else {
          alert('Failed to delete training.');
        }
      } catch (error) {
        console.error('Error deleting training:', error);
        alert('An error occurred.');
      }
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={() => openModal()} className="mb-4">Add New Training</Button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Start Date</th>
              <th className="py-2 px-4 border-b">End Date</th>
              <th className="py-2 px-4 border-b">Quota</th>
              <th className="py-2 px-4 border-b">Material</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((training: Training) => (
              <tr key={training.id}>
                <td className="py-2 px-4 border-b">{training.name}</td>
                <td className="py-2 px-4 border-b">{new Date(training.start_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{new Date(training.end_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{training.quota}</td>
                <td className="py-2 px-4 border-b">{training.material || '-'}</td>
                <td className="py-2 px-4 border-b">
                  <Button onClick={() => openModal(training)} className="mr-2">Edit</Button>
                  <Button onClick={() => handleDelete(training.id)} variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentTraining ? 'Edit Training' : 'Add New Training'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <Input type="text" id="name" name="name" value={formState.name} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
            <Input type="date" id="start_date" name="start_date" value={formState.start_date} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
            <Input type="date" id="end_date" name="end_date" value={formState.end_date} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="quota" className="block text-sm font-medium text-gray-700">Quota</label>
            <Input type="number" id="quota" name="quota" value={formState.quota} onChange={handleChange} required min="0" />
          </div>
          <div>
            <label htmlFor="material" className="block text-sm font-medium text-gray-700">Material Pelatihan</label>
            <textarea
              id="material"
              name="material"
              value={formState.material}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{currentTraining ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
