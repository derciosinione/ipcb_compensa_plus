# AI Document Converter - Backend Implementation Guide

## Overview
The AI Document Converter frontend is ready and integrated. You need to implement two backend endpoints to make it fully functional.

## Required Backend Endpoints

### 1. Document Processing Endpoint
**POST** `YOUR_BACKEND_URL/api/ai/process-document`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The uploaded document (PDF, DOC, DOCX, TXT, CSV, XLSX)
  - `prompt`: User's instructions for data extraction

**Response:**
```json
{
  "headers": ["Column1", "Column2", "Column3"],
  "rows": [
    ["value1", "value2", "value3"],
    ["value4", "value5", "value6"]
  ]
}
```

**Implementation Steps:**
1. Receive the uploaded file and prompt
2. Extract text content from the document (use libraries like `pdfplumber`, `python-docx`, `openpyxl`, etc.)
3. Send the document content + user prompt to your AI API (OpenAI, Anthropic Claude, etc.)
4. Parse the AI response to extract structured data
5. Return the data in the format above

**Example AI Prompt Structure:**
```
User Instructions: {user_prompt}

Document Content:
{extracted_text}

Extract the requested data and return ONLY a JSON object in this format:
{
  "headers": ["column1", "column2", ...],
  "rows": [
    ["row1col1", "row1col2", ...],
    ["row2col1", "row2col2", ...]
  ]
}
```

### 2. Database Insert Endpoint
**POST** `YOUR_BACKEND_URL/api/database/insert`

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "headers": ["Column1", "Column2", "Column3"],
  "rows": [
    ["value1", "value2", "value3"],
    ["value4", "value5", "value6"]
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data inserted successfully",
  "rowsAffected": 2
}
```

**Implementation Steps:**
1. Receive the headers and rows
2. Validate the data structure
3. Create/use a database table with appropriate columns
4. Insert the data rows into your database
5. Return success status

## Frontend Configuration

Update the API endpoints in `/src/app/components/compensa/AIDocumentConverter.tsx`:

```typescript
// Line ~44 - Replace with your actual backend URL
const response = await fetch('YOUR_BACKEND_URL/api/ai/process-document', {
  method: 'POST',
  body: formData,
});

// Line ~64 - Replace with your actual backend URL
const response = await fetch('YOUR_BACKEND_URL/api/database/insert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    headers: extractedData.headers,
    rows: extractedData.rows,
  }),
});
```

## Security Considerations

1. **API Key Storage**: Never expose AI API keys in frontend code. Store them securely on your backend.
2. **File Validation**: Validate file types and sizes on the backend
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Authentication**: Add authentication/authorization to protect your endpoints
5. **Input Sanitization**: Sanitize user inputs before sending to AI or database
6. **CORS**: Configure CORS properly to allow requests from your frontend

## Example Backend Implementation (Python/Flask)

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import openai
import pdfplumber
import json

app = Flask(__name__)
openai.api_key = "YOUR_OPENAI_API_KEY"

@app.route('/api/ai/process-document', methods=['POST'])
def process_document():
    file = request.files['file']
    prompt = request.form['prompt']
    
    # Extract text from document
    if file.filename.endswith('.pdf'):
        with pdfplumber.open(file) as pdf:
            text = '\n'.join([page.extract_text() for page in pdf.pages])
    # Add other file type handlers...
    
    # Send to AI
    ai_prompt = f"""
    User Instructions: {prompt}
    
    Document Content:
    {text}
    
    Extract the requested data and return ONLY a JSON object with "headers" and "rows" arrays.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": ai_prompt}]
    )
    
    result = json.loads(response.choices[0].message.content)
    return jsonify(result)

@app.route('/api/database/insert', methods=['POST'])
def insert_data():
    data = request.json
    headers = data['headers']
    rows = data['rows']
    
    # Insert into your database
    # ... database insertion logic ...
    
    return jsonify({
        "success": True,
        "message": "Data inserted successfully",
        "rowsAffected": len(rows)
    })

if __name__ == '__main__':
    app.run(debug=True)
```

## Testing

1. Start your backend server
2. Update the frontend endpoints with your backend URL
3. Test with sample documents
4. Verify data extraction accuracy
5. Check database insertion

## Supported AI Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini Pro
- **Azure OpenAI**: GPT-4, GPT-3.5

Choose based on your needs for accuracy, cost, and speed.
