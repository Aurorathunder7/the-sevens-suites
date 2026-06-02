@echo off
echo 🚀 Setting up The Sevens Suites Project...

:: Initialize package.json
echo 📦 Creating package.json...
call npm init -y

:: Install dependencies
echo 📥 Installing dependencies...
call npm install react react-dom react-scripts @supabase/supabase-js react-router-dom

:: Create folders
echo 📁 Creating folder structure...
mkdir src 2>nul
mkdir src\components 2>nul
mkdir src\pages 2>nul
mkdir src\utils 2>nul
mkdir public 2>nul

:: Create .env file
echo 🔧 Creating .env file...
echo REACT_APP_SUPABASE_URL=your_supabase_url_here > .env
echo REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here >> .env

:: Create .gitignore
echo 📝 Creating .gitignore...
echo /node_modules/ > .gitignore
echo /build/ >> .gitignore
echo .env >> .gitignore
echo .DS_Store >> .gitignore

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Add your Supabase credentials to .env file
echo 2. Create your React components in the src folder
echo 3. Run 'npm start' to start the development server
echo.
pause