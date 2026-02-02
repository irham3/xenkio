# PDF to Word Conversion API

High-quality PDF to Word conversion API using **pdf2docx** library.

## Features

- ✅ Preserves text formatting (bold, italic, underline)
- ✅ Preserves colors
- ✅ Preserves tables
- ✅ Preserves images
- ✅ Preserves layout structure
- ✅ Handles complex documents

## Deploy to Render (Free)

### Step 1: Push to GitHub

Make sure your repo is pushed to GitHub with the `api/pdf-to-word` folder.

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `pdf-to-word-api`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `api/pdf-to-word`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. Select **Free** plan
5. Click **"Create Web Service"**

### Step 4: Wait for Deployment

Render will build and deploy. This takes ~5 minutes.

Your API will be available at:
```
https://pdf-to-word-api.onrender.com
```

## API Endpoints

### Health Check
```
GET /health
```

### Convert PDF to Word
```
POST /convert
Content-Type: multipart/form-data

file: <PDF file>
```

**Response:** DOCX file download

## Test with cURL

```bash
curl -X POST "https://pdf-to-word-api.onrender.com/convert" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf" \
  --output document.docx
```

## Local Development

```bash
cd api/pdf-to-word

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

Server runs at `http://localhost:8000`

## Integration with Frontend

After deploying, add environment variable to your Next.js app:

```env
NEXT_PUBLIC_PDF_API_URL=https://pdf-to-word-api.onrender.com
```

Then update your frontend code to use the API.
