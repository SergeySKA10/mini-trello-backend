import { Router } from 'express';
import { OAuthController } from '../controllers/oauthController';

const router = Router();

// Получение URL для аутентификации
router.get('/google/url', OAuthController.getGoogleAuthUrl);
router.get('/github/url', OAuthController.getGitHubAuthUrl);

// Callback-роуты (для перенаправления провайдерами)
router.get('/google/callback', OAuthController.handleGoogleCallback);
router.get('/github/callback', OAuthController.handleGitHubCallback);

export default router;
