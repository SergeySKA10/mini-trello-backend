import axios from 'axios';
import { googleConfig } from '../config/oauth';

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture: string;
}

export class GoogleAuthService {
    static getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: googleConfig.clientId,
            redirect_uri: googleConfig.redirectUri,
            response_type: 'code',
            scope: googleConfig.scopes.join(' '),
            access_type: 'offline',
            prompt: 'consent',
        });

        return `${googleConfig.authUrl}?${params.toString()}`;
    }

    static async getTokens(code: string): Promise<{ access_token: string }> {
        const response = await axios.post(googleConfig.tokenUrl, {
            client_id: googleConfig.clientId,
            client_secret: googleConfig.clientSecret,
            code,
            redirect_uri: googleConfig.redirectUri,
            grant_type: 'authorization_code',
        });

        return response.data;
    }

    static async getUserInfo(accessToken: string): Promise<GoogleUser> {
        const response = await axios.get(googleConfig.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return {
            id: response.data.sub,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
        };
    }
}
