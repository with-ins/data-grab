import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 300000, // 5분
  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    trace: 'on-first-retry',
  },
  reporter: 'html',
  globalTeardown: './global-teardown.ts',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],

        // 기본 설정
        headless: true,              // 브라우저 UI 없이 실행 (CPU 절약)
        viewport: { width: 800, height: 600 },

        // 스크린샷/비디오 최적화 (크롤링 시 불필요)
        screenshot: 'off',           // 스크린샷 비활성화
        video: 'off',               // 비디오 녹화 비활성화
        trace: 'off',               // 추적 비활성화

        // 네트워크 최적화
        ignoreHTTPSErrors: true,     // HTTPS 오류 무시 (속도 향상)

        // 권한 최적화
        permissions: [],             // 모든 권한 비활성화

        // 모바일 시뮬레이션 비활성화
        hasTouch: false,
        isMobile: false,

        // Chrome 전용 args 설정
        launchOptions: {
          args: [
            // 성능 최적화
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-web-security',

            // 백그라운드 프로세스 최적화
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',

            // 특성 비활성화
            '--disable-features=TranslateUI',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
            '--disable-plugin-discovery',
            '--disable-sync',

            // 메모리 최적화
            '--aggressive-cache-discard',
            '--memory-pressure-off',

            // 시각 효과 비활성화
            '--disable-background-networking',
            '--disable-component-update',
            '--disable-hang-monitor',

            // 로깅 최소화
            '--log-level=3',
            '--silent',
            '--disable-logging',

            // 크롤링 특화 설정
            '--enable-logging',
            '--disable-blink-features=AutomationControlled', // 봇 감지 우회
            '--disable-ipc-flooding-protection',

            // 네트워크 최적화
            '--enable-tcp-fast-open',
            '--enable-features=NetworkService,NetworkServiceLogging',
          ],

          // 추가 실행 옵션
          timeout: 30000,            // 브라우저 실행 타임아웃
          slowMo: 0,                // 액션 지연 제거

        }
      },
    },
  ]

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
