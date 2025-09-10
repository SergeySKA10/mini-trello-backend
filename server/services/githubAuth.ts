import axios from 'axios';
import { githubConfig } from '../config/oauth';

export interface GitHubUser {
    id: number;
    email: string;
    name: string;
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
        const response = await axios.get(githubConfig.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            avatar_url: response.data.avatar_url,
            login: response.data.login,
        };
    }
}
