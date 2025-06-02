declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_CONNECT_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}