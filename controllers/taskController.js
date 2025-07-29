
// Get Tasks — only return tasks that do NOT have a token marked as used
import Task from '../model/task.js';
import Token from '../model/token.js';
import mongoose from 'mongoose';

export const getTask = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Find all task IDs with used tokens
    const usedTokens = await Token.find({ userId, used: true }, 'taskId').lean();
    const usedTaskIds = usedTokens.map(token => new mongoose.Types.ObjectId(token.taskId));

    // Step 2: Fetch tasks that are NOT in usedTaskIds
    const tasks = await Task.find({
      userId,
      _id: { $nin: usedTaskIds }
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error in getTask:', err);
    res.status(500).json({ error: 'Failed to fetch the tasks' });
  }
};

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, duration } = req.body;
    const userId = req.user.id;
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + duration * 60 * 1000);

    const newTask = new Task({
      title,
      duration,
      userId,
      startedAt,
      endsAt
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error in createTask:', err);
    res.status(401).json({ error: 'Failed to create a task' });
  }
};
