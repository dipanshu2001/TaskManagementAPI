const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const authRoutes=require('./routes/authRoutes');
const taskRoutes=require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notFound=require('./middleware/notFound');
const errorHandler=require('./middleware/errorHandler');

const app=express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Task Management API is running' });
});

app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);
module.exports=app;