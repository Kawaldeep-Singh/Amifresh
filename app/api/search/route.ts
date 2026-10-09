import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { headers } from 'next/headers';

import { connection } from 'next/server';

export async function GET(request: Request) {
  try {
    await connection();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await connectDB();

    const results = [];
    const lowerQuery = query.toLowerCase();

    // 1. Static Routes Search
    const routes = [];
    const rolePrefix = session.user.role === UserRole.ROOT_ADMIN ? '/admin' : 
                       session.user.role === UserRole.TEAM ? '/team' : '/sakhi';

    // Base routes everyone has (adapted for role)
    routes.push({ title: 'Dashboard', href: `${rolePrefix}/dashboard` });
    routes.push({ title: 'My Network', href: `${rolePrefix}/network` });
    routes.push({ title: 'My Profile', href: `${rolePrefix}/profile` });

    if (session.user.role === UserRole.ROOT_ADMIN) {
      routes.push({ title: 'User Management', href: '/admin/users' });
      routes.push({ title: 'Registrations', href: '/admin/registrations' });
      routes.push({ title: 'Product Management', href: '/admin/products' });
      routes.push({ title: 'Order Management', href: '/admin/orders' });
      routes.push({ title: 'Commission Settings', href: '/admin/settings' });
      routes.push({ title: 'Audit Logs', href: '/admin/audit-logs' });
      routes.push({ title: 'Reports', href: '/admin/reports' });
    } else if (session.user.role === UserRole.TEAM) {
      routes.push({ title: 'My Team', href: '/team/team' });
      routes.push({ title: 'Sales', href: '/team/sales' });
      routes.push({ title: 'Team Commissions', href: '/team/commissions' });
      routes.push({ title: 'Team Registrations', href: '/team/registrations' });
    } else {
      // Sakhi
      routes.push({ title: 'Products', href: '/sakhi/products' });
      routes.push({ title: 'My Orders', href: '/sakhi/orders' });
      routes.push({ title: 'My Commission', href: '/sakhi/commission' });
      routes.push({ title: 'Referral Link', href: '/sakhi/referrals' });
    }

    const matchedRoutes = routes.filter(r => r.title.toLowerCase().includes(lowerQuery));
    for (const r of matchedRoutes) {
      results.push({ type: 'route', title: r.title, subtitle: 'Page', href: r.href });
    }

    // 2. User Search (Only Admin and Team)
    if (session.user.role === UserRole.ROOT_ADMIN || session.user.role === UserRole.TEAM) {
      const dbQuery: any = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { referralCode: { $regex: query, $options: 'i' } }
        ]
      };

      // Teams can only search their team? Actually, let's keep it simple or restrict to their team if team.
      // But the prompt says "user bhi search kr sakte phone number name raferal code ks ath".
      // Let's just do a generic search but if they click the result it goes to users/[id] for Admin, or maybe network view.
      // We will direct Admins to User Profile, Teams to Network view (since Teams don't have a specific user profile page).
      
      const matchedUsers = await User.find(dbQuery).limit(5).lean();

      for (const u of matchedUsers) {
        const href = session.user.role === UserRole.ROOT_ADMIN 
          ? `/admin/users/${u.referralCode}`
          : `/team/team?search=${u.referralCode}`;
          
        results.push({
          type: 'user',
          title: u.name,
          subtitle: `${u.email} | ${u.phone} | Code: ${u.referralCode}`,
          href
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
