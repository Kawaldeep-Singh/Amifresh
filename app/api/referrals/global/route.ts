import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/mysql';
import { UserRole } from '@/types/user';

export async function GET(req: Request) {
  const _url = req.url;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users to construct complete global tree
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

    const roots: any[] = [];
    userMap.forEach((node) => {
      if (node.referredBy && userMap.has(node.referredBy)) {
        userMap.get(node.referredBy).children.push(node);
      } else {
        roots.push(node);
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

    const formattedTrees = roots.map(cleanNode);

    return NextResponse.json({ trees: formattedTrees });
  } catch (error: any) {
    console.error('Global Referral Tree Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
