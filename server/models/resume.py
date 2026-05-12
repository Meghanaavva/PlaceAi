from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename    = Column(String(255), nullable=True)          # original uploaded filename
    raw_text    = Column(Text, nullable=True)                 # extracted text from PDF
    parsed_data = Column(Text, nullable=True)                 # JSON: sections dict
    score       = Column(Float, default=0.0)                  # AI score 0-100
    analysis    = Column(Text, nullable=True)                 # JSON: full AI analysis
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship back to user
    user = relationship("User", backref="resumes")

    def __repr__(self):
        return f"<Resume id={self.id} user_id={self.user_id} score={self.score}>"