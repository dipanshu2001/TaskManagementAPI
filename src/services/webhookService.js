const WEBHOOK_URL = process.env.COMPLETION_WEBHOOK_URL;
const MAX_RETRIES = 3;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deliverWebhook(task, attempt = 1) {
  if (!WEBHOOK_URL) return;

  const payload = {
    event:'task.completed',
    taskId: task._id,
    title: task.title,
    completedAt: new Date().toISOString(),
    userId: task.userId
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    console.log(`[WEBHOOK] Delivered on attempt ${attempt} for task ${task._id}`);
  } 
  catch (err) {
    console.error(`[WEBHOOK] Attempt ${attempt} failed: ${err.message}`);

    if (attempt < MAX_RETRIES){
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[WEBHOOK] Retrying in ${delay}ms...`);
      await sleep(delay);
      return deliverWebhook(task, attempt + 1);
    }

    console.error(`[WEBHOOK] All ${MAX_RETRIES} attempts exhausted for task ${task._id}`);
  }
}

module.exports = { deliverWebhook };