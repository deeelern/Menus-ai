# AI Kitchen Assistant MVP

A comprehensive AI-powered kitchen intelligence application built with React frontend and Flask backend. This application helps users manage their kitchen inventory, reduce food waste, and get personalized recipe recommendations.

## 🚀 Features

### Core Features Implemented

#### 1. Intelligent Scanner System
- **Single Item Scan**: Identify ingredients, estimate freshness/shelf life, and categorize
- **Cook Now Multi-Item Scan**: Generate instant recipes from scanned ingredients
- Camera integration with react-webcam
- Mock computer vision API integration (ready for real CV services)

#### 2. Kitchen Hub (Inventory Management)
- Digital inventory with automated population via scanner
- Manual/barcode entry option for packaged goods
- Proactive expiry management with visual indicators
- Color-coded expiry status (Fresh, Expiring Soon, Expired)
- Comprehensive inventory dashboard with statistics

#### 3. Recipe Generation & AI Chef
- Multiple recipe access points: Browse, Suggestions, Favorites
- Personalized AI Chef that learns from dietary needs and preferences
- Advanced recipe search and filtering (cuisine, difficulty, time, dietary)
- Recipe detail view with ingredients, instructions, and nutrition facts
- Recipe matching system showing ingredient availability percentage
- Favorites management system

#### 4. Meal Planning & Shopping Lists
- Weekly meal planning grid with 7 days and 4 meal types
- Auto-generated shopping lists from meal plans
- Shopping list categorization by ingredient type
- Interactive shopping list with check-off functionality
- Portion scaling functionality for recipes
- Comprehensive nutrition tracking (daily and weekly summaries)

#### 5. Expiry Tracking & Waste Reduction
- Automated expiry date tracking with visual indicators
- Expiry status system with color-coded badges
- Waste tracking dashboard showing expired items
- Expiry calculations with days until expiry
- Visual expiry indicators throughout the application

## 🛠 Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **Shadcn/UI** for consistent, accessible components
- **Lucide React** for icons
- **React Webcam** for camera functionality

### Backend
- **Flask** with Python 3.11
- **SQLAlchemy** for database ORM
- **Flask-JWT-Extended** for authentication
- **Flask-CORS** for cross-origin requests
- **SQLite** database for development

## 📁 Project Structure

```
ai-kitchen-assistant/
├── kitchen-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Scanner.jsx    # Camera scanning functionality
│   │   │   ├── Inventory.jsx  # Inventory management
│   │   │   ├── Recipes.jsx    # Recipe browsing and management
│   │   │   ├── MealPlanner.jsx # Meal planning and shopping lists
│   │   │   ├── LoginForm.jsx  # User authentication
│   │   │   └── ...
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Application entry point
│   ├── package.json
│   └── vite.config.js
├── kitchen-backend/           # Flask backend API
│   ├── src/
│   │   ├── models/           # Database models
│   │   │   ├── user.py       # User model
│   │   │   ├── inventory.py  # Inventory item model
│   │   │   ├── recipe.py     # Recipe models
│   │   │   └── preferences.py # User preferences
│   │   ├── routes/           # API routes
│   │   │   ├── user.py       # Authentication routes
│   │   │   ├── scanner.py    # Scanner API endpoints
│   │   │   ├── inventory.py  # Inventory management
│   │   │   └── recipes.py    # Recipe management
│   │   └── main.py           # Flask application entry point
│   ├── requirements.txt
│   └── venv/                 # Python virtual environment
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- Python 3.11 or higher
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-kitchen-assistant
   ```

2. **Set up the backend**
   ```bash
   cd kitchen-backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd kitchen-frontend
   npm install  # or pnpm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd kitchen-backend
   source venv/bin/activate
   python src/main.py
   ```
   The backend will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   cd kitchen-frontend
   npm run dev  # or pnpm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

### Demo Mode
The application includes a demo mode for testing without authentication:
- Click "Try Demo Mode" on the login screen
- Explore all features with mock data

## 📱 Usage Guide

### 1. Authentication
- Register a new account or use demo mode
- Login with your credentials

### 2. Scanner
- Use "Single Scan" to identify individual ingredients
- Use "Cook Now" to scan multiple items for instant recipes
- Camera permissions required for scanning functionality

### 3. Inventory Management
- View all your kitchen items with expiry status
- Add items manually or via scanner
- Track expiry dates with visual indicators
- Monitor inventory statistics

### 4. Recipe Discovery
- **Browse**: Search and filter recipes by cuisine, difficulty, time, dietary preferences
- **Suggestions**: Get AI-powered recipe recommendations based on your inventory
- **Favorites**: Save and manage your favorite recipes

### 5. Meal Planning
- Plan meals for the week using the calendar grid
- Add recipes to specific days and meal types
- Auto-generate shopping lists from your meal plan
- Track nutrition with daily and weekly summaries

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Scanner
- `POST /api/scan` - Process scanned image
- `POST /api/scan/cook-now` - Generate recipes from multiple scanned items

### Inventory
- `GET /api/inventory` - Get user inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Recipes
- `GET /api/recipes` - Get recipes with filters
- `POST /api/recipes/generate` - Generate recipe suggestions
- `GET /api/recipes/favorites` - Get favorite recipes
- `POST /api/recipes/{id}/favorite` - Toggle recipe favorite status

## 🎨 Design Features

### UI/UX
- Clean, modern interface with Tailwind CSS
- Responsive design for desktop and mobile
- Consistent component library with Shadcn/UI
- Intuitive navigation with tab-based interface
- Visual feedback for all user actions

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast color schemes
- Semantic HTML structure

## 🔮 Future Enhancements

### Planned Features
- Real computer vision API integration (Google Vision, Clarifai)
- Push notifications for expiry alerts
- AR guides for recipe instructions
- Social sharing features
- Advanced meal prep planning
- Nutritional goal tracking
- Barcode scanning for packaged goods
- Integration with grocery delivery services

### Technical Improvements
- Production database (PostgreSQL)
- Redis caching for better performance
- Real-time notifications with WebSockets
- Mobile app development (React Native)
- Advanced analytics and reporting

## 🐛 Known Issues

1. **Authentication Integration**: Minor JWT token format mismatch between frontend and backend
   - **Workaround**: Use demo mode for full functionality testing
   - **Status**: Backend APIs work correctly via direct API calls

2. **Camera Permissions**: Some browsers may require HTTPS for camera access
   - **Workaround**: Use localhost or enable camera permissions manually

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern React and Flask best practices
- UI components from Shadcn/UI library
- Icons from Lucide React
- Styling with Tailwind CSS

---

**Note**: This is an MVP (Minimum Viable Product) implementation showcasing all core features of an AI-powered kitchen assistant. The application demonstrates the complete user journey from ingredient scanning to meal planning and shopping list generation.

