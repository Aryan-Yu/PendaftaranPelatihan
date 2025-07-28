'use client';
import { RegistrationForm } from '../../components/forms/RegistrationForm';
import { useState, useEffect } from 'react';
import { Training, PaymentMethod } from '../../types';

export default function RegisterPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainingsRes, paymentMethodsRes] = await Promise.all([
          fetch('/api/admin/trainings'), // Reusing admin API for public read
          fetch('/api/admin/payment-methods'), // Reusing admin API for public read
        ]);

        if (trainingsRes.ok) {
          const fetchedTrainings = await trainingsRes.json();
          setTrainings(fetchedTrainings);
        } else {
          throw new Error('Failed to fetch trainings');
        }

        if (paymentMethodsRes.ok) {
          setPaymentMethods(await paymentMethodsRes.json());
        } else {
          throw new Error('Failed to fetch payment methods');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <RegistrationForm
          trainings={trainings}
          paymentMethods={paymentMethods}
          onSubmitSuccess={() => {
            // Optionally, show a success message or redirect
            alert('Pendaftaran berhasil!');
          }}
        />
      </div>
    </main>
  );
}
