import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.error('Login error:', error);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });

  } catch (err) {
    console.error('Server error during login:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
