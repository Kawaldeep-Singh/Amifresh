import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/mysql';
import { UserRole } from '@/types/user';

export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await props.params;

    // Security check: Only Root Admin can view arbitrary trees.
    if (session.user.role !== UserRole.ROOT_ADMIN && session.user.id !== userId) {
      // Allow user to view their own tree
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users to construct complete hierarchy
    const allUsers = await query<any>(
      `SELECT id, name, email, phone, role, status, referralCode, referredBy, 
              COALESCE(totalSales, 0) as totalSales, 
              COALESCE(totalCommission, 0) as totalCommission, 
              createdAt 
       FROM users 
       ORDER BY createdAt ASC`
    );

    // Map all users by ID
    const userMap = new Map<string, any>();
    allUsers.forEach((u) => {
      userMap.set(u.id, {
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        referralCode: u.referralCode,
        referredBy: u.referredBy || null,
        totalSales: Number(u.totalSales || 0),
        totalCommission: Number(u.totalCommission || 0),
        createdAt: u.createdAt,
        children: [],
      });
    });

    if (!userMap.has(userId)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Connect child nodes to parents
    userMap.forEach((node) => {
      if (node.referredBy && userMap.has(node.referredBy)) {
        userMap.get(node.referredBy).children.push(node);
      }
    });

    // Cleanup empty children arrays to undefined so TreeNode UI handles leaf nodes cleanly
    const cleanNode = (node: any): any => {
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(cleanNode);
      } else {
        node.children = undefined;
      }
      return node;
    };

    const targetTree = cleanNode(userMap.get(userId));

    return NextResponse.json({ tree: targetTree });
  } catch (error: any) {
    console.error('Referral Tree Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
