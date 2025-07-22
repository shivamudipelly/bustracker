interface EnvironmentConfig {
  API_URL: string
  SOCKET_URL: string
  MAPBOX_ACCESS_TOKEN: string
  APP_NAME: string
  APP_VERSION: string
  IS_DEVELOPMENT: boolean
}

class Environment {
  private static instance: Environment
  private config: EnvironmentConfig

  private constructor() {
    this.config = this.loadConfig()
    this.validateConfig()
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment()
    }
    return Environment.instance
  }

  private loadConfig(): EnvironmentConfig {
    return {
      API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
      SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "",
      APP_NAME: import.meta.env.VITE_APP_NAME || "Bus Tracker",
      APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
      IS_DEVELOPMENT: import.meta.env.DEV,
    }
  }

  private validateConfig(): void {
    if (!this.config.MAPBOX_ACCESS_TOKEN && this.config.IS_DEVELOPMENT) {
      console.warn("⚠️  MAPBOX_ACCESS_TOKEN not set. Map features will not work.")
    }
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key]
  }

  public getAll(): EnvironmentConfig {
    return { ...this.config }
  }
}

export const environment = Environment.getInstance()
