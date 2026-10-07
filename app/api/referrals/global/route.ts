import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';

export async function GET(req: Request) {
  // Opt into dynamic rendering
  const url = req.url;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find all users who are roots of their own trees (no referredBy)
    // and who have children, or just all top-level users.
    const roots = await User.find({ 
      $or: [
        { referredBy: { $exists: false } },
        { referredBy: null }
      ]
    }).select('_id');

    const rootIds = roots.map(r => r._id);

    const trees = await User.aggregate([
      { $match: { _id: { $in: rootIds } } },
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
          phone: 1,
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
            phone: 1,
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

    const formattedTrees = trees.map(treeData => formatTree(treeData, treeData.network));

    return NextResponse.json({ trees: formattedTrees });
    
  } catch (error: any) {
    console.error('Global Referral Tree Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
