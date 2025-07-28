import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('payment_methods').select('*').order('method_name', { ascending: true });
  if (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ message: 'Failed to fetch payment methods' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const methodName = formData.get('methodName') as string;
  const accountInfo = formData.get('accountInfo') as string | null;
  const qrisImageFile = formData.get('qrisImage') as File | null;
  const isActive = formData.get('isActive') === 'true';

  if (!methodName) {
    return NextResponse.json({ message: 'Method name is required.' }, { status: 400 });
  }

  let qrisImageUrl: string | null = null;

  try {
    if (qrisImageFile) {
      const fileExt = qrisImageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('qris-images')
        .upload(fileName, qrisImageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading QRIS image:', uploadError);
        return NextResponse.json({ message: 'Failed to upload QRIS image.' }, { status: 500 });
      }
      qrisImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qris-images/${fileName}`;
    }

    const { data, error: insertError } = await supabaseAdmin
      .from('payment_methods')
      .insert({
        method_name: methodName,
        account_info: accountInfo,
        qris_image_url: qrisImageUrl,
        is_active: isActive,
      });

    if (insertError) {
      console.error('Error creating payment method:', insertError);
      return NextResponse.json({ message: 'Failed to create payment method' }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    console.error('Server error during payment method creation:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const methodName = formData.get('methodName') as string;
  const accountInfo = formData.get('accountInfo') as string | null;
  const qrisImageFile = formData.get('qrisImage') as File | null;
  const existingQrisImageUrl = formData.get('existingQrisImageUrl') as string | null;
  const isActive = formData.get('isActive') === 'true';

  if (!id || !methodName) {
    return NextResponse.json({ message: 'ID and method name are required.' }, { status: 400 });
  }

  let qrisImageUrl: string | null = existingQrisImageUrl;

  try {
    if (qrisImageFile) {
      const fileExt = qrisImageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('qris-images')
        .upload(fileName, qrisImageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading new QRIS image:', uploadError);
        return NextResponse.json({ message: 'Failed to upload new QRIS image.' }, { status: 500 });
      }
      qrisImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qris-images/${fileName}`;

      if (existingQrisImageUrl) {
        const oldFileName = existingQrisImageUrl.split('/').pop();
        if (oldFileName) {
          await supabaseAdmin.storage.from('qris-images').remove([oldFileName]);
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .update({
        method_name: methodName,
        account_info: accountInfo,
        qris_image_url: qrisImageUrl,
        is_active: isActive,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating payment method:', error);
      return NextResponse.json({ message: 'Failed to update payment method' }, { status: 500 });
    }
    return NextResponse.json(data);

  } catch (err) {
    console.error('Server error during payment method update:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { data: method, error: fetchError } = await supabaseAdmin.from('payment_methods').select('qris_image_url').eq('id', id).single();

  if (fetchError || !method) {
    console.error('Error fetching payment method for deletion:', fetchError);
    return NextResponse.json({ message: 'Payment method not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from('payment_methods').delete().eq('id', id);
  if (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ message: 'Failed to delete payment method' }, { status: 500 });
  }

  if (method.qris_image_url) {
    const fileName = method.qris_image_url.split('/').pop();
    if (fileName) {
      const { error: deleteImageError } = await supabaseAdmin.storage.from('qris-images').remove([fileName]);
      if (deleteImageError) {
        console.warn('Failed to delete QRIS image from storage:', deleteImageError);
      }
    }
  }

  return NextResponse.json({ message: 'Payment method deleted' });
}
