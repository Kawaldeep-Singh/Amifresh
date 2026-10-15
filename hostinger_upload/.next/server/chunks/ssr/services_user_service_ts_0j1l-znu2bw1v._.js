module.exports=[93742,a=>{"use strict";var b=a.i(54799),c=a.i(56251),d=a.i(10822);async function e(a){let{page:b=1,limit:e=10,search:f,role:g,status:h}=a,i=[],j=[];if(f){let a=`%${f.trim()}%`;i.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.referralCode LIKE ?)"),j.push(a,a,a,a)}g&&Object.values(d.O).includes(g)&&(i.push("u.role = ?"),j.push(g)),h&&Object.values(d.x).includes(h)&&(i.push("u.status = ?"),j.push(h));let k=i.length>0?`WHERE ${i.join(" AND ")}`:"",l=await (0,c.q)(`SELECT COUNT(*) as total FROM users u ${k}`,[...j]),m=Number(l?.total||0);return{users:(await (0,c.z)(`SELECT 
      u.*,
      r.id as ref_id,
      r.name as ref_name,
      r.email as ref_email,
      r.referralCode as ref_referralCode,
      (SELECT COUNT(*) FROM users d WHERE d.referredBy = u.id) as directReferralCount
    FROM users u
    LEFT JOIN users r ON u.referredBy = r.id
    ${k}
    ORDER BY u.createdAt DESC
    LIMIT ? OFFSET ?`,[...j,Number(e),Number((b-1)*e)])).map(a=>{let b={...a,_id:a.id,directReferralCount:Number(a.directReferralCount||0)};return a.ref_id?b.referredBy={_id:a.ref_id,id:a.ref_id,name:a.ref_name,email:a.ref_email,referralCode:a.ref_referralCode}:b.referredBy=null,delete b.ref_id,delete b.ref_name,delete b.ref_email,delete b.ref_referralCode,delete b.password,b}),total:m,page:b,totalPages:Math.ceil(m/e)}}async function f(a){let b=await (0,c.q)(`SELECT 
      u.*,
      r.id as ref_id,
      r.name as ref_name,
      r.email as ref_email,
      r.referralCode as ref_referralCode,
      (SELECT COUNT(*) FROM users d WHERE d.referredBy = u.id) as directReferralCount
    FROM users u
    LEFT JOIN users r ON u.referredBy = r.id
    WHERE u.id = ? OR u.referralCode = ?
    LIMIT 1`,[a,a]);if(!b)return null;let d=0;try{let a=await (0,c.q)(`WITH RECURSIVE downline AS (
        SELECT id FROM users WHERE referredBy = ?
        UNION ALL
        SELECT u.id FROM users u INNER JOIN downline d ON u.referredBy = d.id
      )
      SELECT COUNT(*) as count FROM downline`,[b.id]);d=Number(a?.count||0)}catch{d=Number(b.directReferralCount||0)}let e={...b,_id:b.id,directReferralCount:Number(b.directReferralCount||0),networkCount:d};return b.ref_id?e.referredBy={_id:b.ref_id,id:b.ref_id,name:b.ref_name,email:b.ref_email,referralCode:b.ref_referralCode}:e.referredBy=null,delete e.ref_id,delete e.ref_name,delete e.ref_email,delete e.ref_referralCode,delete e.password,e}async function g(a,e,f,g){if(!a)throw Error("Invalid user ID");if(!f)throw Error("Invalid admin ID");if(!Object.values(d.x).includes(e))throw Error("Invalid status");if(a===f&&e!==d.x.ACTIVE)throw Error("You cannot deactivate or block yourself");let h=await (0,c.q)("SELECT * FROM users WHERE id = ?",[a]);if(!h)throw Error("User not found");let i=h.status,j=g||(e===d.x.ACTIVE?"":h.statusRemark);return await (0,c.O)(async c=>{await c.execute("UPDATE users SET status = ?, statusRemark = ?, updatedAt = NOW() WHERE id = ?",[e,j,a]);let d=b.default.randomUUID(),h=`User status changed from ${i} to ${e}${g?` - ${g}`:""}`;await c.execute(`INSERT INTO audit_logs (id, performedBy, action, entityType, entityId, description, createdAt, updatedAt)
       VALUES (?, ?, ?, 'User', ?, ?, NOW(), NOW())`,[d,f,`USER_${e}`,a,h])}),!0}async function h(){let a=await (0,c.q)(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN role = 'TEAM' THEN 1 ELSE 0 END), 0) as teams,
      COALESCE(SUM(CASE WHEN role = 'SAKHI' THEN 1 ELSE 0 END), 0) as sakhis,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending
    FROM users
  `);return{total:Number(a?.total||0),active:Number(a?.active||0),teams:Number(a?.teams||0),sakhis:Number(a?.sakhis||0),blocked:Number(a?.blocked||0),inactive:Number(a?.inactive||0),pending:Number(a?.pending||0)}}async function i(){let a=await (0,c.q)(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked
    FROM users WHERE role = 'TEAM'
  `);return{total:Number(a?.total||0),active:Number(a?.active||0),inactive:Number(a?.inactive||0),blocked:Number(a?.blocked||0)}}async function j(){let a=await (0,c.q)(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked,
      COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending
    FROM users WHERE role = 'SAKHI'
  `);return{total:Number(a?.total||0),active:Number(a?.active||0),inactive:Number(a?.inactive||0),blocked:Number(a?.blocked||0),pending:Number(a?.pending||0)}}a.s(["P",0,h,"$",0,i,"s",0,j,"M",0,f,"A",0,e,"b",0,g])}];

//# sourceMappingURL=services_user_service_ts_0j1l-znu2bw1v._.js.map