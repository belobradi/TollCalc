# TollCalc - Serbian Toll Road Calculator

**Note:** Changes are not directly pushed to the main branch but through merge requests.

A web application for calculating toll prices on Serbian highways, with an interactive map interface.

## 🌐 Live Website
Visit: **https://www.putarina.com**

## 📋 Features
- Interactive map of Serbian toll roads
- Toll price calculation based on route
- Multi-language support (Serbian Latin, Serbian Cyrillic, English)
- Vehicle category selection
- Real-time route visualization
- Mobile-responsive design

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/belobradi/TollCalc.git
cd TollCalc

# Install dependencies
npm install

# Run linting
npm run lint

# Serve locally
npx serve .
```

Visit `http://localhost:3000` in your browser.

## 🛠️ Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Mapping**: Leaflet.js
- **Styling**: CSS3 with custom design
- **Data**: JSON-based toll station and route data
- **Deployment**: GitHub Pages

## 📦 Deployment

The project uses **automated deployment** via GitHub Actions:

- **Production**: https://www.putarina.com
- **Trigger**: Version tags (e.g., `v1.0.1`)
- **Platform**: GitHub Pages

### To Deploy:
1. Commit and push changes to `main` branch
2. Create and push a version tag:
   ```bash
git tag v1.0.2
git push origin v1.0.2
   ```
3. GitHub Actions will automatically deploy to production

For detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📁 Project Structure
```
TollCalc/
├── index.html          # Main application page
├── styles.css          # Application styles
├── js/                 # JavaScript modules
│   └── app.js         # Main application entry point
├── assets/            # Images, icons, favicons
├── data/              # JSON data files
│   └── json/
│       └── stations.json # Toll station data
└── .github/
    └── workflows/
        └── pages.yaml # Deployment workflow
```

## 🌍 Internationalization
The application supports:
- 🇷🇸 Serbian (Latin) - `sr-Latn`
- 🇷🇸 Serbian (Cyrillic) - `sr-Cyrl`
- 🇬🇧 English - `en`

Language preference is stored in localStorage.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check code style
5. Submit a pull request

## 📄 License
ISC License - see package.json for details

## 🔗 Links
- **Live Site**: https://www.putarina.com
- **Repository**: https://github.com/belobradi/TollCalc
- **Issues**: https://github.com/belobradi/TollCalc/issues

---
**Current Version**: v1.0.1  
Made with ❤️ for Serbian drivers