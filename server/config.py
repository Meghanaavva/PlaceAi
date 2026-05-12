from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./placement.db"
    SECRET_KEY: str = "2650fcc29dd5a48c0fdc1f945aa22aa8a80cbb5157f3c19e039ec12d30351e11"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    GROQ_API_KEY: str = "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"
    FRONTEND_URL: str = "http://localhost:5173"
    RAPID_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()