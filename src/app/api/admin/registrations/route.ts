import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const trainingIdFilter = searchParams.get('trainingId');

  let query = supabaseAdmin
    .from('registrations')
    .select(`
      *,
      trainings (id, name, quota),
      payment_methods (method_name)
    `);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  if (trainingIdFilter && trainingIdFilter !== 'all') {
    query = query.eq('training_id', trainingIdFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ message: 'Failed to fetch registrations' }, { status: 500 });
  }

  // Fetch all registrations again to calculate registered_count dynamically for each training
  const { data: allRegistrations, error: allRegError } = await supabaseAdmin.from('registrations').select('training_id');
  const registeredCounts: { [key: string]: number } = {};
  if (allRegistrations) {
    allRegistrations.forEach((reg: { training_id: string }) => {
      registeredCounts[reg.training_id] = (registeredCounts[reg.training_id] || 0) + 1;
    });
  }

  const formattedData = data.map((reg: any) => ({
    ...reg,
    training_name: reg.trainings?.name,
    payment_method_name: reg.payment_methods?.method_name,
    // Add dynamic registered_count to the training object within registration
    training: {
      ...reg.trainings,
      registered_count: registeredCounts[reg.training_id] || 0,
    }
  }));

  return NextResponse.json(formattedData);
}

export async function PUT(request: Request) {
  const { id, ...updates } = await request.json();

  // Filter out properties that are not actual columns in the 'registrations' table
  const validUpdates: { [key: string]: any } = {};
  const registrationColumns = [
    'full_name', 'nim', 'class_option', 'phone_number',
    'payment_proof_url', 'selected_payment_method_id', 'status',
    'training_id'
  ];

  for (const key of registrationColumns) {
    if (updates.hasOwnProperty(key)) {
      validUpdates[key] = updates[key];
    }
  }

  const { data, error } = await supabaseAdmin.from('registrations').update(validUpdates).eq('id', id);
  if (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ message: 'Failed to update registration' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabaseAdmin.from('registrations').delete().eq('id', id);
  if (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ message: 'Failed to delete registration' }, { status: 500 });
  }
  return NextResponse.json({ message: 'Registration deleted' });
}
