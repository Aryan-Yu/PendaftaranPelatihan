import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const formData = await request.formData();

  const fullName = formData.get('fullName') as string;
  const nim = formData.get('nim') as string;
  const classOption = formData.get('classOption') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const trainingId = formData.get('trainingId') as string;
  const selectedPaymentMethodId = formData.get('selectedPaymentMethodId') as string;
  const paymentProofFile = formData.get('paymentProof') as File | null;

  if (!fullName || !nim || !classOption || !phoneNumber || !trainingId || !selectedPaymentMethodId || !paymentProofFile) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  let paymentProofUrl: string | null = null;

  try {
    if (paymentProofFile) {
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProofFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading payment proof:', uploadError);
        return NextResponse.json({ message: 'Failed to upload payment proof.' }, { status: 500 });
      }
      paymentProofUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${fileName}`;
    }

    const { data, error: insertError } = await supabase
      .from('registrations')
      .insert({
        full_name: fullName,
        nim: nim,
        class_option: classOption,
        phone_number: phoneNumber,
        training_id: trainingId,
        selected_payment_method_id: selectedPaymentMethodId,
        payment_proof_url: paymentProofUrl,
        status: 'pending',
      });

    if (insertError) {
      console.error('Error inserting registration:', insertError);
      return NextResponse.json({ message: 'Failed to submit registration.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Registration successful!', data });

  } catch (err) {
    console.error('Server error during registration:', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
