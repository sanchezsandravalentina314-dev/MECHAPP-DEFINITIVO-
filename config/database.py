import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1983@localhost:5433/MechApp"
)

# Cambiado a psycopg (v3) para evitar los problemas de codificación de psycopg2 en Windows
if raw_url.startswith("postgresql://"):
    DATABASE_URL = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
else:
    DATABASE_URL = raw_url

engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import models
    Base.metadata.create_all(bind=engine)