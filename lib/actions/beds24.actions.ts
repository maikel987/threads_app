import axios from 'axios';

interface ApiResponse {
  token?: string;
  expiresIn?: number;
  refreshToken?: string;
  success?: boolean;
  type?: string;
  code?: number;
  error?: string;
}

interface CombinedApiResponse {
  token_1?: string;
  expiresIn_1?: number;
  refreshToken?: string;
  token_2?: string;
  expiresIn_2?: number;
  success?: boolean;
  type?: string;
  code?: number;
  error?: string;
}

export const fetchAuthenticationSetupBeds24 = async (code: string, deviceName: string): Promise<CombinedApiResponse> => {
  const urlSetup = '/api/beds24/authentication/setup';  // Utilisation du proxy défini dans next.config.js
  const urlToken = '/api/beds24/authentication/token';  // URL pour le refresh token
  
  try {
    // Première requête pour obtenir le token initial et le refresh token
    const responseSetup = await axios.get<ApiResponse>(urlSetup, {
      headers: {
        'accept': 'application/json',
        'code': code,
        'deviceName': deviceName,
      }
    });

    if (responseSetup.data.refreshToken) {
      // Deuxième requête pour obtenir le nouveau token en utilisant le refresh token
      const responseToken = await axios.get<ApiResponse>(urlToken, {
        headers: {
          'accept': 'application/json',
          'refreshToken': responseSetup.data.refreshToken,
        }
      });

      return {
        token_1: responseSetup.data.token,
        expiresIn_1: responseSetup.data.expiresIn,
        refreshToken: responseSetup.data.refreshToken,
        token_2: responseToken.data.token,
        expiresIn_2: responseToken.data.expiresIn,
      };
    } else {
      throw new Error('Refresh token not found in the response');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        type: 'error',
        code: error.response.status,
        error: error.response.data.error || 'Unknown error',
      };
    } else {
      return {
        success: false,
        type: 'error',
        code: 500,
        error: 'Internal Server Error',
      };
    }
  }
};

