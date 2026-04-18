const jobs = new Map(); // taskId (string) → timeoutId

const REMINDER_OFFSET_MS = parseInt(process.env.REMINDER_OFFSET_MINUTES||'60',10)*60*1000; // 1 hour before

function scheduleReminder(task){
  cancelReminder(task._id.toString());

  if (task.status === 'completed') return;
  if (!task.dueDate) return;

  const delay = new Date(task.dueDate).getTime() - Date.now() - REMINDER_OFFSET_MS;

  if (delay <= 0) return;

  const timeoutId = setTimeout(()=> {
    fireReminder(task);
    jobs.delete(task._id.toString());
  }, delay);

  jobs.set(task._id.toString(), timeoutId);
}

function cancelReminder(taskId){
  const key = taskId.toString();
  const existing = jobs.get(key);

  if (existing){
    clearTimeout(existing);
    jobs.delete(key);
  }
}
async function fireReminder(task) {
  const message = `[REMINDER] Task "${task.title}" (id: ${task._id}) is due in ${Math.round(REMINDER_OFFSET_MS / 60000)} minute(s)`;
  console.log(message);
 
  const url = process.env.REMINDER_WEBHOOK_URL;
  if (!url) return;
 
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'task.reminder',
        taskId: task._id,
        title: task.title,
        dueDate: task.dueDate,
        userId: task.userId
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`[REMINDER] Webhook delivered for task ${task._id}`);
  } catch (err) {
    console.error(`[REMINDER] Webhook delivery failed: ${err.message}`);
  }
}

module.exports = { scheduleReminder, cancelReminder };