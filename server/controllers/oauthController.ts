import { Request, Response } from 'express';
import { GoogleAuthService } from '../services/googleAuth';
import { GitHubAuthService } from '../services/githubAuth';
import { prisma } from '../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
export class OAuthController {
    static async handleGoogleCallback(req: Request, res: Response) {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                return res.status(400).json({ error: 'Invalid code' });
            }

            // получение токенов от Google
            const tokenG = await GoogleAuthService.getTokens(code);

            // получение информации о пользователе
            const googleUser = await GoogleAuthService.getUserInfo(
                tokenG.access_token
            );

            // ищем или создаем пользователя
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: googleUser.email },
                        { provider: 'google', providerId: googleUser.id },
                    ],
                },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: googleUser.email,
                        name: googleUser.name,
                        avatar: googleUser.picture,
                        provider: 'google',
                        providerId: googleUser.id,
                        password: null,
                    },
                });
            }

            // генерируем JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // перенаправляем на фронтенд с токеном
            res.redirect(`http://localhost:3000/auth/success?token=${token}`);
        } catch (error) {
            console.error('Google Oauth error:', error);
            res.redirect('http://localhost:3000/auth/error');
        }
    }

    static async handleGitHubCallback(req: Request, res: Response) {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                return res.status(400).json({ error: 'Invalid code' });
            }

            const tokenGit = await GitHubAuthService.getTokens(code);
            const githubUser = await GitHubAuthService.getUserInfo(
                tokenGit.access_token
            );

            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: githubUser.email },
                        {
                            provider: 'github',
                            providerId: githubUser.id.toString(),
                        },
                    ],
                },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: githubUser.email,
                        name: githubUser.name || githubUser.login,
                        avatar: githubUser.avatar_url,
                        provider: 'github',
                        providerId: githubUser.id.toString(),
                        password: null,
                    },
                });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.redirect(`http://localhost:3000/auth/success?token=${token}`);
        } catch (error) {
            console.error('GitHub Oauth error:', error);
            res.redirect('http://localhost:3000/auth/error');
        }
    }

    static getGoogleAuthUrl(req: Request, res: Response) {
        const authUrl = GoogleAuthService.getAuthUrl();
        res.json({ authUrl });
    }

    static getGitHubAuthUrl(req: Request, res: Response) {
        const authUrl = GitHubAuthService.getAuthUrl();
        res.json({ authUrl });
    }
}
