# Food Adulteration Awareness System

A full-stack web application that teaches people about food adulteration: search foods, see common adulterants, health risks and awareness checks, analyse a food photo (demo AI), and report suspected cases. Includes a full admin panel.

**Stack:** React 18 + Vite (frontend) | Python Flask (backend) | SQLite (database)

> **Important:** every check in this app is educational. It does **not** confirm adulteration. Laboratory testing may be required for definitive confirmation.

## 1. Required software
- Node.js 18 or newer (with npm)
- Python 3.9 or newer (with pip)

## 2. Install frontend dependencies
```bash
cd frontend
npm install
```

## 3. Install backend dependencies
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate      macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

## 4. Start the backend (port 5000)
```bash
cd backend
python app.py
```
Check http://127.0.0.1:5000/api/health, it should return `{"status":"ok"}`.

## 5. Start the frontend (port 5173)
In a second terminal:
```bash
cd frontend
npm run dev
```
Open http://localhost:5173. In development, Vite proxies `/api` to the Flask server, so nothing else needs configuring.

## 6. Database setup
Nothing to do. On first start the backend creates `backend/database/food_awareness.db`, all 8 tables (`users, admins, foods, adulterants, awareness_articles, reports, report_images, search_history`) and sample data (14 foods, 6 articles, demo accounts, 1 sample report). To reset, stop the backend and delete the `.db` file.

## 7. Demo user
- Email: `demo@foodsafe.com`
- Password: `Demo@1234`

## 8. Demo admin
Open http://localhost:5173/admin/login
- Username: `admin`
- Password: `Admin@123`

Change both passwords before any real deployment.

## 9. Replace background images
All background image URLs are in one file: `frontend/src/config/images.js`.
- Remote: replace a URL with any image URL.
- Local: put the file in `frontend/src/assets/`, then in `images.js` add `import home from "../assets/home.jpg";` and set `home: home`.

A dark green overlay keeps text readable. If an image fails to load, a green background shows instead. Food card photos are uploaded by admins under Admin > Foods.

## 10. Connect a real AI/ML model later
The demo lives in `backend/services/ai_service.py` and is a **mock**: it derives generic indicators from the file bytes, not from the food itself.
1. Train or download an image classifier (for example a PyTorch or TensorFlow model).
2. Implement `predict(image_bytes)` in `ai_service.py` so it loads your model and returns a score from 0 to 100.
3. Keep the dictionary returned by `analyze_image()` in the same shape (`indicator_level`, `confidence`, `indicators`, `recommendations`, `disclaimer`) and the frontend needs no changes.
4. Add the ML libraries to `requirements.txt` and set `"mode": "model"` in the result.

Keep the wording educational. An image alone cannot scientifically confirm adulteration.

## 11. Deploy
**Backend:** `pip install gunicorn`, then `gunicorn -w 2 -b 0.0.0.0:5000 app:app` (Windows: use `waitress-serve`). Set environment variables `SECRET_KEY` (long random string) and `CORS_ORIGIN` (your frontend URL). Put the `database/` and `uploads/` folders on persistent storage.

**Frontend:** set `VITE_API_URL=https://your-api-domain/api`, then `npm run build` and host the `frontend/dist` folder on any static host (Netlify, Vercel, Nginx). Configure the host to serve `index.html` for all routes (single-page app fallback). Serve everything over HTTPS.

## Project structure
```
backend/   app.py, config.py, routes/ (auth, foods, reports, admin), services/, models/schema.py, database/, uploads/
frontend/  src/{components,pages,layouts,services,context,config,assets}, App.jsx, main.jsx
```

## Security notes
Passwords are hashed (Werkzeug). Auth uses signed, expiring bearer tokens with separate user and admin roles, checked on every protected API route. Uploads are limited to PNG/JPG/WEBP under 5 MB and verified by file signature. All SQL uses parameters.

## API summary
`POST /api/auth/register|login|forgot` | `POST /api/admin/login` | `GET /api/foods?q=&category=` | `GET /api/foods/<id>` | `GET /api/adulterants` | `GET /api/articles` | `POST /api/analyze` | `POST/GET /api/reports` | `GET /api/admin/stats` | `POST/PUT/DELETE /api/admin/foods` | `GET /api/admin/reports` | `PUT /api/admin/reports/<id>`

## Known limits
"Forgot password" shows a confirmation but does not send email (no mail server is configured). Sign-in accepts email or phone number.
