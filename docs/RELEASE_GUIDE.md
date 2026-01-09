# 🎉 Creating Your First Release

Complete guide to creating and managing releases on GitHub.

---

## 📋 What is a GitHub Release?

A GitHub Release is:
- ✅ A packaged version of your software
- ✅ Tagged with a version number (e.g., v1.0.0)
- ✅ Includes release notes and changelog
- ✅ Can include downloadable assets
- ✅ Marks important milestones in your project

---

## 🎯 Step 1: Prepare for Release

### 1.1 Ensure Everything is Working

```bash
# Test the build
npm run build

# Run linter
npm run lint

# Test locally
npm run preview
```

### 1.2 Update Version in package.json

Edit `package.json`:

```json
{
  "name": "panchjanya",
  "version": "1.0.0",  ← Update this
  "private": true,
  ...
}
```

**Version Format**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

### 1.3 Create CHANGELOG.md (Optional but Recommended)

Create/update `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-07

### Added
- Interactive map with temple locations
- Temple details sidebar with images
- Search and filter functionality
- Architecture floor plan viewer with hotspots
- Admin panel for temple management
- Firebase authentication
- Cloudinary image uploads
- Responsive design for mobile/desktop

### Security
- Removed sensitive credentials from repository
- Enhanced .gitignore protection
- Added security policy (SECURITY.md)

### Infrastructure
- GitHub Actions CI/CD workflows
- Automated Vercel deployment
- PR preview deployments
- Dependency update automation
```

---

## 🚀 Step 2: Create a Git Tag

### Method 1: Using Git Commands (Recommended)

```bash
# Create an annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial Public Release"

# View the tag
git tag -l

# Push the tag to GitHub
git push origin v1.0.0
```

**Tag Format**: Always use `v` prefix (e.g., `v1.0.0`, `v1.2.3`)

### Method 2: Using GitHub Web Interface

We'll use this in Step 3.

---

## 📝 Step 3: Create Release on GitHub

### 3.1 Navigate to Releases

1. Go to your repository: https://github.com/Sakshi443/Panchjanya
2. Click **"Releases"** (right sidebar)
3. Click **"Create a new release"** or **"Draft a new release"**

**Direct Link**: https://github.com/Sakshi443/Panchjanya/releases/new

### 3.2 Fill in Release Details

#### Choose a Tag
- **Tag version**: `v1.0.0`
- **Target**: `main` branch
- Click **"Create new tag: v1.0.0 on publish"**

#### Release Title
```
v1.0.0 - Initial Public Release
```

#### Release Description

Use this template:

```markdown
# 🏛️ Panchjanya v1.0.0 - Initial Public Release

**Panchjanya** is an interactive temple discovery platform that brings India's sacred heritage to your fingertips.

## ✨ Features

### 🗺️ Interactive Map
- Explore temples on an interactive Leaflet map
- Custom markers showing temple locations
- Click markers to view temple details

### 🔍 Search & Discovery
- Search temples by name, city, or district
- Filter by location (district, taluka)
- Auto-complete suggestions

### 🏛️ Temple Details
- High-quality image galleries
- Detailed descriptions
- Address and location information
- Direct links to Google Maps

### 📐 Architecture Explorer
- Interactive floor plans with hotspots
- Click hotspots to learn about architectural features
- Image galleries for each feature

### 👤 Admin Panel
- Secure admin authentication
- Add/edit/delete temples
- Upload images via Cloudinary
- Manage architecture hotspots

### 📱 Responsive Design
- Mobile-first design
- Works on all devices
- Touch-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Maps**: Leaflet + OpenStreetMap
- **Image Storage**: Cloudinary

## 🚀 Deployment

- **Live Demo**: [https://panchjanya.vercel.app](https://panchjanya.vercel.app)
- **Platform**: Vercel
- **CI/CD**: GitHub Actions

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Sakshi443/Panchjanya.git
cd Panchjanya

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Run development server
npm run dev
```

## 📚 Documentation

- [README.md](https://github.com/Sakshi443/Panchjanya/blob/main/README.md) - Complete documentation
- [DEPLOYMENT.md](https://github.com/Sakshi443/Panchjanya/blob/main/DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](https://github.com/Sakshi443/Panchjanya/blob/main/CONTRIBUTING.md) - How to contribute
- [API_DOCUMENTATION.md](https://github.com/Sakshi443/Panchjanya/blob/main/API_DOCUMENTATION.md) - API reference

## 🔒 Security

- All sensitive credentials removed from repository
- Firebase Security Rules implemented
- API key restrictions in place
- Security policy documented in SECURITY.md

## 🐛 Known Issues

- None reported yet!

## 🙏 Acknowledgments

- Maps powered by Leaflet & OpenStreetMap
- UI components from shadcn/ui
- Icons from Lucide
- Backend by Firebase

## 📝 Changelog

See [CHANGELOG.md](https://github.com/Sakshi443/Panchjanya/blob/main/CHANGELOG.md) for detailed changes.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](https://github.com/Sakshi443/Panchjanya/blob/main/LICENSE) for details.

---

**Made with ❤️ for preserving India's sacred heritage**

## Contributors

- [@Sakshi443](https://github.com/Sakshi443) - Creator & Maintainer
```

### 3.3 Attach Assets (Optional)

You can attach files like:
- 📦 Build artifacts (zip of `dist/` folder)
- 📄 Documentation PDFs
- 🖼️ Screenshots

To create a build zip:

```bash
# Build the project
npm run build

# Create a zip (Windows)
Compress-Archive -Path dist\* -DestinationPath panchjanya-v1.0.0-build.zip

# Or manually zip the dist folder
```

Then attach the zip file to the release.

### 3.4 Pre-release Option

If this is a beta/alpha version:
- ✅ Check **"Set as a pre-release"**
- This marks it as unstable

For v1.0.0, leave it unchecked (this is a stable release).

### 3.5 Publish Release

1. Review everything
2. Click **"Publish release"**
3. 🎉 Your release is live!

---

## 🏷️ Step 4: Verify Your Release

1. Go to: https://github.com/Sakshi443/Panchjanya/releases
2. You should see your v1.0.0 release
3. Verify:
   - ✅ Tag is correct
   - ✅ Release notes are formatted properly
   - ✅ Attachments are present (if any)

---

## 📊 Release Best Practices

### Semantic Versioning

Follow [SemVer](https://semver.org/):

- **v1.0.0** - Initial stable release
- **v1.0.1** - Bug fix (patch)
- **v1.1.0** - New feature (minor)
- **v2.0.0** - Breaking change (major)

### Release Notes Guidelines

1. **Be Clear**: Describe what changed
2. **Categorize**: Use sections (Added, Changed, Fixed, Removed)
3. **Link Issues**: Reference related issues (#123)
4. **Thank Contributors**: Acknowledge contributions
5. **Breaking Changes**: Highlight breaking changes

### Release Frequency

- **Major Releases**: When ready (stable milestones)
- **Minor Releases**: Monthly or when features are complete
- **Patch Releases**: As needed for bug fixes

---

## 🔄 Creating Subsequent Releases

### For a Bug Fix (v1.0.0 → v1.0.1)

```bash
# Update package.json to 1.0.1
# Update CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"
git tag -a v1.0.1 -m "Release v1.0.1: Bug fixes"
git push origin main
git push origin v1.0.1

# Create release on GitHub
```

### For a New Feature (v1.0.0 → v1.1.0)

```bash
# Update package.json to 1.1.0
# Update CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0: New features"
git push origin main
git push origin v1.1.0

# Create release on GitHub
```

---

## 🤖 Automate Releases with GitHub Actions

Create `.github/workflows/release.yml`:

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Create build archive
        run: |
          cd dist
          zip -r ../panchjanya-${{ github.ref_name }}-build.zip .
          cd ..

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: panchjanya-${{ github.ref_name }}-build.zip
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then, whenever you push a tag:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

GitHub Actions will automatically:
1. Build the project
2. Create a zip file
3. Create a release
4. Attach the build

---

## 📈 Managing Releases

### Edit a Release

1. Go to **Releases** tab
2. Click on the release
3. Click **"Edit release"**
4. Make changes
5. Click **"Update release"**

### Delete a Release

1. Go to **Releases** tab
2. Click on the release
3. Click **"Delete"**
4. Confirm deletion

**Note**: This doesn't delete the Git tag. To delete the tag:

```bash
# Delete locally
git tag -d v1.0.0

# Delete remotely
git push origin :refs/tags/v1.0.0
```

### Mark as Latest Release

To change which release is marked as "Latest":

1. Go to **Releases** tab
2. Click on the release you want as latest
3. Click **"Set as latest release"**

---

## 🎯 Release Checklist

Use this checklist for each release:

### Pre-Release
- [ ] All features tested
- [ ] No critical bugs
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] `package.json` version updated
- [ ] `CHANGELOG.md` updated
- [ ] Documentation updated

### Release
- [ ] Create Git tag
- [ ] Push tag to GitHub
- [ ] Create GitHub release
- [ ] Write clear release notes
- [ ] Attach build artifacts (if applicable)
- [ ] Publish release

### Post-Release
- [ ] Verify release is visible
- [ ] Test deployed version
- [ ] Announce release (social media, blog, etc.)
- [ ] Monitor for issues
- [ ] Update project board/roadmap

---

## 🌟 Release Announcement Template

Share your release on social media:

```text
🎉 Panchjanya v1.0.0 is now live!

🏛️ Discover India's sacred temple heritage with an interactive map, detailed information, and beautiful architecture visualizations.

Features:
✅ Interactive temple map
✅ Search & filter
✅ Architecture explorer
✅ Admin panel

Try it now: https://panchjanya.vercel.app

#React #TypeScript #Firebase #OpenSource #IndianHeritage
```

---

## 📞 Need Help?

- **GitHub Releases Documentation**: https://docs.github.com/en/repositories/releasing-projects-on-github
- **Semantic Versioning**: https://semver.org/
- **Your Releases**: https://github.com/Sakshi443/Panchjanya/releases

---

**Ready to create your first release?**

Start here: https://github.com/Sakshi443/Panchjanya/releases/new
