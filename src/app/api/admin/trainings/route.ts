import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { Training } from '../../../../types';

export async function GET() {
  const { data: trainings, error } = await supabaseAdmin.from('trainings').select('id, name, start_date, end_date, quota, material').order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json({ message: 'Failed to fetch trainings' }, { status: 500 });
  }

  // Fetch all registrations to calculate registered_count dynamically
  const { data: registrations, error: regError } = await supabaseAdmin.from('registrations').select('training_id');

  if (regError) {
    console.error('Error fetching registrations for count:', regError);
    // Continue even if registrations fail, just registered_count will be 0
  }

  const registeredCounts: { [key: string]: number } = {};
  if (registrations) {
    registrations.forEach((reg: { training_id: string }) => {
      registeredCounts[reg.training_id] = (registeredCounts[reg.training_id] || 0) + 1;
    });
  }

  const formattedTrainings = trainings.map((training: Training) => ({
    ...training,
    registered_count: registeredCounts[training.id] || 0,
  }));

  return NextResponse.json(formattedTrainings);
}

export async function POST(request: Request) {
  const { name, start_date, end_date, quota, material } = await request.json();
  const { data, error } = await supabaseAdmin.from('trainings').insert({ name, start_date, end_date, quota, material });
  if (error) {
    console.error('Error creating training:', error);
    return NextResponse.json({ message: 'Failed to create training' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, name, start_date, end_date, quota, material } = await request.json();
  const { data, error } = await supabaseAdmin.from('trainings').update({ name, start_date, end_date, quota, material }).eq('id', id);
  if (error) {
    console.error('Error updating training:', error);
    return NextResponse.json({ message: 'Failed to update training' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabaseAdmin.from('trainings').delete().eq('id', id);
  if (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json({ message: 'Failed to delete training' }, { status: 500 });
  }
  return NextResponse.json({ message: 'Training deleted' });
}
