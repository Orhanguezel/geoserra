import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@vps/shared-backend/middleware/auth';
import { requireAdmin } from '@vps/shared-backend/middleware/roles';

// @vps/shared-backend — sadece GeoSerra'da kullanılanlar
import { registerAuth } from '@vps/shared-backend/modules/auth/router';
import { registerHealth } from '@vps/shared-backend/modules/health/router';
import { registerSiteSettings } from '@vps/shared-backend/modules/siteSettings/router';
import { registerSiteSettingsAdmin } from '@vps/shared-backend/modules/siteSettings/admin.routes';
import { registerUserAdmin } from '@vps/shared-backend/modules/auth/admin.routes';
import { registerContactsAdmin } from '@vps/shared-backend/modules/contact/admin.routes';
import { registerContacts } from '@vps/shared-backend/modules/contact/router';

// GeoSerra-specific modules
import { registerAnalyses } from '@/modules/analyses/router';
import { registerAnalysesAdmin } from '@/modules/analyses/admin.routes';
import { registerImplementation } from '@/modules/implementation/router';
import { registerImplementationAdmin } from '@/modules/implementation/admin.routes';
import { registerStatsAdmin } from '@/modules/stats/router';
import { registerAssetsAdmin } from '@/modules/assets/admin.routes';
import { registerAdminMail } from '@/modules/admin-mail/routes';
import { registerCurrency } from '@/modules/currency/router';
import { registerGoogleAuth } from '@/modules/oauth-google/router';
import { registerAuthReset } from '@/modules/auth-reset/router';
import { registerPayments } from '@/modules/payments/router';

export async function registerAllRoutes(app: FastifyInstance) {
  await app.register(async (api) => {
    api.get('/health', async () => ({ ok: true, service: 'geoserra-backend' }));

    await api.register(async (v1) => {
      // ─── Admin — auth + admin role zorunlu ───────────────────────
      await v1.register(async (adminApi) => {
        adminApi.addHook('onRequest', requireAuth);
        adminApi.addHook('onRequest', requireAdmin);

        await registerSiteSettingsAdmin(adminApi);
        await registerUserAdmin(adminApi);
        await registerContactsAdmin(adminApi);
        await registerAnalysesAdmin(adminApi);
        await registerImplementationAdmin(adminApi);
        await registerStatsAdmin(adminApi);
        await registerAssetsAdmin(adminApi);
        await registerAdminMail(adminApi);
      }, { prefix: '/admin' });

      // ─── Public ──────────────────────────────────────────────────
      await registerAuth(v1);
      await registerGoogleAuth(v1);
      await registerAuthReset(v1);
      await registerHealth(v1);
      await registerSiteSettings(v1);
      await registerContacts(v1);
      await registerAnalyses(v1);
      await registerImplementation(v1);
      await registerCurrency(v1);

      // Payment webhooks — ayrı prefix, raw body gerekebilir
      await v1.register(async (payApi) => {
        await registerPayments(payApi);
      }, { prefix: '/payments' });
    }, { prefix: '/v1' });
  }, { prefix: '/api' });
}
