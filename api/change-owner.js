// api/change-owner.js
export default async function handler(req, res) {
  // Only allow POST (matches Roblox API)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse query params
  const { cookie } = req.query; // .ROBLOSECURITY value
  const { newOwnerId } = req.query; // Fallback from query

  // Parse body for newOwnerId (JSON)
  let body;
  let newOwnerIdFromBody;
  if (req.body) {
    try {
      body = JSON.parse(req.body);
      newOwnerIdFromBody = body.newOwnerId;
    } catch (e) {
      // Ignore parse error if no body
    }
  }
  const targetUserId = newOwnerId || newOwnerIdFromBody;

  // Validation
  const groupId = req.query.groupId || req.params?.groupId; // Vercel path: /api/change-owner/[groupId]
  if (!groupId || !targetUserId || !cookie) {
    return res.status(400).json({ 
      error: 'Missing params: groupId, newOwnerId, and cookie (.ROBLOSECURITY) required' 
    });
  }
  if (isNaN(groupId) || isNaN(targetUserId)) {
    return res.status(400).json({ error: 'groupId and newOwnerId must be numbers' });
  }

  // Roblox API URL
  const url = `https://groups.roblox.com/v1/groups/${groupId}/change-owner`;

  // Request options
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Cookie': `.ROBLOSECURITY=${cookie}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ newOwnerId: parseInt(targetUserId) }),
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    // Forward status and data
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal proxy error', details: error.message });
  }
}
