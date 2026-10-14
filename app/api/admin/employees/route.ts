import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { hashPassword } from '@/lib/auth/password';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User, { UserRole, UserStatus } from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { generateUniqueReferralCode } from '@/services/referral.service';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { name, email, phone, password, designation } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: phone.trim() }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'A user with this phone number already exists.' }, { status: 400 });
    }

    // Generate unique Login ID (EMP + 6 digits)
    let uniqueLoginId = '';
    let isLoginIdUnique = false;
    while (!isLoginIdUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      uniqueLoginId = `EMP${randomDigits}`;
      const found = await User.findOne({ loginId: uniqueLoginId });
      if (!found) isLoginIdUnique = true;
    }

    // Determine password
    const clearPassword = password && password.trim().length >= 6 
      ? password.trim() 
      : crypto.randomBytes(4).toString('hex'); // 8 characters

    const hashedPassword = await hashPassword(clearPassword);
    const referralCode = await generateUniqueReferralCode(name);

    const newEmployee = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      loginId: uniqueLoginId,
      role: UserRole.TEAM,
      status: UserStatus.ACTIVE,
      referralCode,
      mustChangePassword: true,
      statusRemark: designation ? designation.trim() : 'Internal Staff Member',
      commissionRate: 0,
    });

    await AuditLog.create({
      performedBy: session.user.id,
      action: 'EMPLOYEE_CREATED',
      entityType: 'User',
      entityId: newEmployee._id,
      description: `Created new internal employee ${newEmployee.name} (${newEmployee.email}) with Login ID: ${uniqueLoginId}`,
    });

    revalidatePath('/admin/employees');
    revalidatePath('/admin/users');

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully.',
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        loginId: uniqueLoginId,
        referralCode: newEmployee.referralCode,
        role: newEmployee.role,
        status: newEmployee.status,
      },
      credentials: {
        loginId: uniqueLoginId,
        email: newEmployee.email,
        tempPassword: clearPassword,
      }
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create employee.' },
      { status: 500 }
    );
  }
}
