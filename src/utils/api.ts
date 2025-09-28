const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// デバッグ情報をコンソールに出力
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// UI上でAPI設定を確認できるよう、windowオブジェクトに設定
if (typeof window !== 'undefined') {
  (window as any).API_CONFIG = {
    baseUrl: API_BASE_URL,
    timestamp: new Date().toISOString()
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}, timeout = 30000): Promise<T> {
    const requestInfo = {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      body: options.body,
      headers: options.headers,
      timestamp: new Date().toISOString()
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // credentials: 'include' を確実に設定するため、optionsとは別に明示的に設定
      const requestOptions: RequestInit = {
        ...options,
        method: options.method || 'GET',
        credentials: 'include', // httpOnly Cookieを含める（必須）
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // ngrokの警告をスキップ
          ...options.headers,
        },
      };

      console.log('🚀 API Request:', {
        url: `${API_BASE_URL}${endpoint}`,
        method: requestOptions.method,
        credentials: requestOptions.credentials,
        headers: requestOptions.headers,
        body: options.body,
        cookies: document.cookie,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...requestOptions
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      console.log('📥 API Response:', {
        url: `${API_BASE_URL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        const errorInfo = {
          ...requestInfo,
          requestOptions,
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data
          }
        };
        console.error('❌ API Error:', errorInfo);
        throw new Error(JSON.stringify(errorInfo));
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('⏰ API Timeout:', { endpoint, timeout });
        throw new Error(`タイムアウト: ${endpoint} (${timeout/1000}秒)`);
      }
      
      // ネットワークエラーの場合、詳細情報を含める
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = {
          ...requestInfo,
          error: 'Network Error',
          message: 'サーバーに接続できません。APIのURLを確認してください。',
          originalError: error.message
        };
        console.error('🌐 Network Error:', networkError);
        throw new Error(JSON.stringify(networkError));
      }
      
      console.error('💥 Unexpected Error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string) {
    return this.request('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getSalonInfo() {
    return this.request('/salons/me', {
      method: 'GET',
    });
  }

  async updateSalonInfo(salonInfo: { name: string; location: string; strengths: string; services: string }) {
    return this.request('/salons', {
      method: 'POST',
      body: JSON.stringify(salonInfo),
    });
  }

  async generatePosts(params: { context: string; channels: string[]; tone: string; hints: string; ask_ai: string }) {
  }
  async generatePosts(params: { context: string; channels: string[]; tone: string; topic_suggestion: string }) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }, 60000); // 60秒のタイムアウト
  }
}

export const apiClient = new ApiClient();