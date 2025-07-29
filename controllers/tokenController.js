import Token from '../model/token.js';
import Task from '../model/task.js';

// STEP 1: Set URL and activate token
export const generateToken = async(req, res) => {
    try {
        const { taskId, url } = req.body;

        const token = await Token.findOne({
            taskId,
            userId: req.user.id,
            used: false
        });

        if (!token) {
            return res.status(404).json({ error: 'No valid token found' });
        }

        token.url = url;
        token.expiresAt = new Date(Date.now() + 2 * 60000); // 2 min
        await token.save();

        res.json({ tokenId: token._id });
    } catch (err) {
        console.error('Error in generateToken:', err);
        res.status(500).json({ error: 'Internal error' });
    }
};

// STEP 2: Just validate — don't mark as used yet
export const validateToken = async (req, res) => {
    try {
        const { tokenId } = req.params;
        const token = await Token.findById(tokenId);

        if (!token || token.used || new Date() > token.expiresAt) {
            return res.redirect('/dashboard.html');
        }

        // No longer mark as used here!
        res.redirect(`/countdown.html?url=${encodeURIComponent(token.url)}&tokenId=${token._id}`);
    } catch (err) {
        console.error('Error in validateToken:', err);
        res.redirect('/dashboard.html');
    }
};

// STEP 3: Mark token as used AFTER countdown finishes
export const markTokenAsUsed = async (req, res) => {
    try {
        const { tokenId } = req.params;
        const token = await Token.findById(tokenId);

        if (!token || token.used) {
            return res.status(400).json({ error: 'Token already used or invalid' });
        }

        token.used = true;
        await token.save();

        // Delete the corresponding task after token is used
        if (token.taskId) {
            await Task.deleteOne({ _id: token.taskId });
        }

        res.json({ message: 'Token marked as used successfully' });
    } catch (err) {
        console.error('Error in markTokenAsUsed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
