# PDF to Word Conversion API using pdf2docx
# Production-ready for Render deployment

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
from contextlib import asynccontextmanager
import tempfile
import os
import uuid
import shutil

# Store temp directories for cleanup
temp_dirs_to_cleanup = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Cleanup on shutdown
    for temp_dir in temp_dirs_to_cleanup:
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass

app = FastAPI(
    title="PDF to Word API",
    version="1.0.0",
    description="Convert PDF files to Word documents with high fidelity",
    lifespan=lifespan
)

# CORS - Allow all origins for API (you can restrict this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "PDF to Word API is running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "convert": "/convert (POST)"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/convert")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    """
    Convert PDF to Word document with preserved formatting.
    
    - **file**: PDF file (multipart/form-data)
    - **Returns**: DOCX file download
    
    Features preserved:
    - Text formatting (bold, italic)
    - Colors
    - Tables
    - Images
    - Layout structure
    """
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file contents
    contents = await file.read()
    
    # Check file size (max 50MB)
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 50MB allowed")
    
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Create temp directory for this conversion
    temp_dir = tempfile.mkdtemp()
    temp_dirs_to_cleanup.append(temp_dir)
    unique_id = str(uuid.uuid4())[:8]
    
    pdf_path = os.path.join(temp_dir, f"{unique_id}.pdf")
    docx_path = os.path.join(temp_dir, f"{unique_id}.docx")
    
    try:
        # Save uploaded PDF
        with open(pdf_path, 'wb') as f:
            f.write(contents)
        
        # Convert PDF to Word using pdf2docx
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        
        # Check if conversion was successful
        if not os.path.exists(docx_path):
            raise HTTPException(status_code=500, detail="Conversion failed - output file not created")
        
        # Read the converted file
        with open(docx_path, 'rb') as f:
            docx_content = f.read()
        
        # Get original filename without extension
        original_name = os.path.splitext(file.filename)[0]
        output_filename = f"{original_name}.docx"
        
        # Cleanup temp files
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
            temp_dirs_to_cleanup.remove(temp_dir)
        except:
            pass
        
        # Return the converted file content directly
        return Response(
            content=docx_content,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{output_filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
            if temp_dir in temp_dirs_to_cleanup:
                temp_dirs_to_cleanup.remove(temp_dir)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

# For local development
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
