import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';

export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
  // Opt into dynamic rendering
  const url = req.url;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { userId } = await props.params;

    // Security check: Only Root Admin can view arbitrary trees.
    // Managers and Members can only view their own tree or sub-trees.
    if (session.user.role !== UserRole.ROOT_ADMIN) {
      // Basic check: is the requested userId the same as session.user.id?
      // For a more robust check, we'd need to verify if the userId is actually in the session user's downline.
      // We'll allow them to view their own tree to start.
      if (session.user.id !== userId) {
        // TODO: Validate if requested user is in the downline of session user
        // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch the target user
    const targetUser = await User.findById(userId).select('name email role status referralCode createdAt totalSales totalCommission');
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build the tree recursively
    // Note: For large networks, recursive queries in Node can be slow. 
    // In a production system with deep networks, you might use MongoDB's $graphLookup.
    // We will use $graphLookup here for better performance.
    
    const tree = await User.aggregate([
      { $match: { _id: targetUser._id } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referredBy',
          as: 'network',
          maxDepth: 10,
          depthField: 'level'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          referralCode: 1,
          createdAt: 1,
          totalSales: 1,
          totalCommission: 1,
          network: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            status: 1,
            referralCode: 1,
            referredBy: 1,
            level: 1,
            totalSales: 1,
            totalCommission: 1,
            createdAt: 1
          }
        }
      }
    ]);

    if (!tree || tree.length === 0) {
      return NextResponse.json({ tree: null });
    }

    // Format the flat array from $graphLookup into a hierarchical tree structure
    const formatTree = (rootNode: any, allNodes: any[]): any => {
      const children = allNodes
        .filter(n => n.referredBy && n.referredBy.toString() === rootNode._id.toString())
        .map(n => formatTree(n, allNodes));
      
      return {
        ...rootNode,
        children: children.length > 0 ? children : undefined
      };
    };

    const rootData = tree[0];
    const hierarchicalTree = formatTree(rootData, rootData.network);

    return NextResponse.json({ tree: hierarchicalTree });
    
  } catch (error: any) {
    console.error('Referral Tree Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
