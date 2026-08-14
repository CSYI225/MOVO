import app from './app';
import { initialiserCompteAdmin } from './utils/ensureAdminUser';

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initialiserCompteAdmin();
});
