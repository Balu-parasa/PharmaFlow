import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Capsulix API Server running at http://localhost:${PORT}`);
  console.log(`🎯 Precision Pharmacy, Zero Errors.`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/api/health`);
});

