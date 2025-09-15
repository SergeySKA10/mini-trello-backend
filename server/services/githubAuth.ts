import axios from 'axios';
import { githubConfig } from '../config/oauth';

export interface GitHubUser {
    id: number;
    email: string;
    name: string | null;
    avatar_url: string;
    login: string;
}

export class GitHubAuthService {
    static getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: githubConfig.clientId,
            redirect_uri: githubConfig.redirectUri,
            scope: githubConfig.scopes.join(' '),
        });

        return `${githubConfig.authUrl}?${params.toString()}`;
    }

    static async getTokens(code: string): Promise<{ access_token: string }> {
        const response = await axios.post(
            githubConfig.tokenUrl,
            {
                client_id: githubConfig.clientId,
                client_secret: githubConfig.clientSecret,
                code,
                redirect_uri: githubConfig.redirectUri,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        return response.data;
    }

    static async getUserInfo(accessToken: string): Promise<GitHubUser> {
        const userResponse = await axios.get(githubConfig.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // проверяем email
        if (userResponse.data.email) {
            return {
                id: userResponse.data.id,
                email: userResponse.data.email,
                name: userResponse.data.name,
                avatar_url: userResponse.data.avatar_url,
                login: userResponse.data.login,
            };
        }

        // если нет email - отдельный запрос для email
        console.log(
            'Email not in main response, fetching emails separately...'
        );
        const emailsResponse = await axios.get(
            'https://api.github.com/user/emails',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        // поиск основного email
        const primaryEmail = emailsResponse.data.find(
            (email: any) => email.primary && email.verified
        );

        if (!primaryEmail) {
            throw new Error('No verified primary email found');
        }

        return {
            id: userResponse.data.id,
            email: primaryEmail.email,
            name: userResponse.data.name || userResponse.data.login,
            avatar_url: userResponse.data.avatar_url,
            login: userResponse.data.login,
        };
    }
}
