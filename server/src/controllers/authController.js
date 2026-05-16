const admin = require('../firebase');
const db = require('../db/connection');

class AuthController {
  static async login(req, res, next) {
    try {
      const { idToken, anonymousVoterId } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
      }

      if (!admin.apps || admin.apps.length === 0) {
        // Firebase admin not initialized (e.g. no serviceAccountKey)
        return res.status(500).json({ error: 'Firebase Admin SDK not configured on server.' });
      }

      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const phoneNumber = decodedToken.phone_number;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number not found in token' });
      }

      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Insert or update the user in the database
        await client.query(
          `INSERT INTO users (id, phone_number) 
           VALUES ($1, $2) 
           ON CONFLICT (id) DO UPDATE SET phone_number = EXCLUDED.phone_number`,
          [uid, phoneNumber]
        );

        // Merge anonymous votes: update voter_id to the Firebase UID
        if (anonymousVoterId && anonymousVoterId !== uid) {
          // Note: If the user previously voted on a poll anonymously, and ALSO has a vote under their real UID,
          // updating the anonymous vote to the real UID might violate the UNIQUE(poll_id, option_id, voter_id) constraint.
          // To safely merge without crashing, we can use ON CONFLICT DO NOTHING, or we can just ignore collisions.
          // Since our constraint is on (poll_id, option_id, voter_id), we can just catch conflicts and ignore them,
          // or we can delete duplicates first. The simplest safe update is standard update; if it fails, we handle it.
          // Actually, standard UPDATE doesn't have ON CONFLICT DO NOTHING.
          // Postgres 9.5+ doesn't support UPDATE ... ON CONFLICT DO NOTHING directly on updates that cause conflict.
          // Instead, we can delete anonymous votes that conflict with existing user votes, then update the rest.
          
          await client.query(`
            DELETE FROM votes v1
            WHERE voter_id = $1
            AND EXISTS (
              SELECT 1 FROM votes v2 
              WHERE v2.voter_id = $2 
              AND v1.poll_id = v2.poll_id 
              AND v1.option_id = v2.option_id
            )
          `, [anonymousVoterId, uid]);

          await client.query(`
            UPDATE votes SET voter_id = $1 WHERE voter_id = $2
          `, [uid, anonymousVoterId]);
        }

        await client.query('COMMIT');
        
        res.json({
          message: 'Login successful',
          user: { id: uid, phoneNumber }
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Login error:', err);
      // Determine if it's a Firebase token error
      if (err.code && err.code.startsWith('auth/')) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
      }
      next(err);
    }
  }
}

module.exports = AuthController;
