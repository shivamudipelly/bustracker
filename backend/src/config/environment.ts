import dotenv from "dotenv"

dotenv.config()

interface EnvironmentConfig {
  NODE_ENV: string
  PORT: number
  MONGO_URI: string
  JWT_SECRET: string
  FRONTEND_URL: string
  EMAIL_USER: string
  EMAIL_PASS: string
  LOG_LEVEL: string
  GOOGLE_MAPS_API_KEY: string
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
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: Number.parseInt(process.env.PORT || "5000", 10),
      MONGO_URI: process.env.MONGO_URI || "",
      JWT_SECRET: process.env.JWT_SECRET || "",
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
      EMAIL_USER: process.env.EMAIL_USER || "",
      EMAIL_PASS: process.env.EMAIL_PASS || "",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
    }
  }

  private validateConfig(): void {
    const requiredFields: (keyof EnvironmentConfig)[] = ["MONGO_URI", "JWT_SECRET"]

    if (this.config.NODE_ENV === "development") {
      if (!this.config.MONGO_URI) {
        console.warn("⚠️  MONGO_URI not set. Using default: mongodb://localhost:27017/bus-tracking")
        this.config.MONGO_URI = "mongodb://localhost:27017/bus-tracking"
      }

      if (!this.config.JWT_SECRET) {
        console.warn("⚠️  JWT_SECRET not set. Using development default (NOT for production!)")
        this.config.JWT_SECRET = "dev-jwt-secret-change-in-production-please"
      }

      if (!this.config.EMAIL_USER) {
        console.warn("⚠️  EMAIL_USER not set. Email features will not work.")
        this.config.EMAIL_USER = "dev@example.com"
      }

      if (!this.config.EMAIL_PASS) {
        console.warn("⚠️  EMAIL_PASS not set. Email features will not work.")
        this.config.EMAIL_PASS = "dev-password"
      }

      return
    }

    const missingFields = requiredFields.filter((field) => !this.config[field])

    if (missingFields.length > 0) {
      throw new Error(`Missing required environment variables: ${missingFields.join(", ")}`)
    }
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key]
  }

  public getAll(): EnvironmentConfig {
    return { ...this.config }
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === "development"
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === "production"
  }
}

export const environment = Environment.getInstance()
