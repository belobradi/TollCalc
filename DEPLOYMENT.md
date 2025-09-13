# TollCalc Website Deployment Guide

## Overview
The TollCalc website is deployed using **GitHub Pages** with a custom domain and automated deployment through GitHub Actions.

## Deployment Configuration

### 🌐 Live Website
- **Production URL**: https://www.putarina.com
- **Custom Domain**: Configured via `CNAME` file
- **Platform**: GitHub Pages

### 🚀 Deployment Mechanism
The project uses a **tag-based deployment strategy** configured in `.github/workflows/pages.yaml`:

#### Automatic Deployment Triggers
- ✅ **Production Deploy**: Only when tags starting with `v` are pushed (e.g., `v1.0.0`, `v1.0.1`)
- ✅ **Validation**: Pull requests to `main` branch run validation checks
- ❌ **No Deploy**: Regular pushes to `main` branch do NOT trigger deployment

#### Deployment Process
1. **Tag Creation**: When a version tag (e.g., `v1.0.2`) is pushed
2. **File Preparation**: Static files are copied to `public/` directory including:
   - `index.html` (main page)
   - `CNAME` (custom domain configuration)
   - `*.css` (stylesheets)
   - `*.js` (JavaScript files)
   - `assets/***` (images, favicons, etc.)
   - `data/***` (JSON data files)
3. **GitHub Pages Deploy**: Files are deployed to GitHub Pages
4. **Custom Domain**: Automatically serves content at putarina.com

### 📁 Included Files in Deployment
The deployment includes these file patterns:
```yaml
--include='index.html'
--include='CNAME'
--include='*.css'
--include='*.js'
--include='assets/***'
--include='data/***'
```

### 🚫 Excluded Files
The following are excluded from deployment:
- Hidden files (`.github/`, `.git/`, etc.)
- Development configuration files
- Node modules and build artifacts

## How to Deploy

### 1. Ready Your Changes
Ensure all changes are committed and pushed to the main branch.

### 2. Create a Version Tag
```bash
# Create and push a new version tag
git tag v1.0.2
git push origin v1.0.2
```

### 3. Monitor Deployment
- Visit the [Actions tab](https://github.com/belobradi/TollCalc/actions) in GitHub
- Watch the "Pages (tags only)" workflow
- Deployment typically takes 2-3 minutes

### 4. Verify Live Site
Visit https://www.putarina.com to confirm changes are live.

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Serve locally (simple HTTP server)
npx serve .
```

### Pull Request Process
1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create Pull Request to `main`
5. PR will automatically run validation checks
6. Merge PR after review
7. Create version tag to deploy

## Project Structure
```
TollCalc/
├── index.html          # Main HTML page
├── styles.css          # Main stylesheet
├── CNAME              # Custom domain (putarina.com)
├── js/                # JavaScript modules
├── assets/            # Images, icons, favicons
├── data/              # JSON data files
└── .github/
    └── workflows/
        └── pages.yaml # Deployment configuration
```

## Environment Configuration
- **Production**: Automated via GitHub Pages
- **Domain**: putarina.com (configured in CNAME)
- **SSL**: Automatically provided by GitHub Pages
- **CDN**: GitHub's global CDN

## Troubleshooting

### Deployment Not Working?
1. Verify tag format starts with `v` (e.g., `v1.0.1`)
2. Check GitHub Actions for error logs
3. Ensure CNAME file contains correct domain
4. Verify GitHub Pages is enabled in repository settings

### Custom Domain Issues?
1. Check DNS settings for putarina.com
2. Verify CNAME file content: `putarina.com`
3. GitHub Pages custom domain settings in repository

---

**Current Version**: v1.0.1  
**Last Updated**: 2024  
**Maintained by**: TollCalc Development Team