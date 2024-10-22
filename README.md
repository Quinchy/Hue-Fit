# Hue-Fit Project

## Overview
Hue-Fit: An AI-Powered Men's Clothing Recommendation System. This project compose of mobile app for men's clothing recommendation and web app for maintenance.
This System contains the following projects:
- **app1 (web)**: A Next.js app located in `apps/web`
- **app2 (mobile)**: A React Native Expo app located in `apps/mobile`
## Getting Started

### 1. Clone the repository
To get started, clone the repository to your local machine:

```bash
git clone https://github.com/Quinchy/Hue-Fit.git
cd hue-fit
```

### 2. Running the Project Commands:
Once the repository is cloned, use the appropriate commands to run the application(s):
- To run both the web (Next.js) and mobile (React Native/Expo) applications:
```bash
yarn dev
```
- To run only the web (Next.js) application:
```bash
yarn dev:web
```
- To run only the mobile (React Native/Expo) application:
```bash
yarn dev:mobile
```

### 3. Adding Packages:
In adding packages for specific projects, use this commands to add packages on designated workspace:
- To add packages on the root:
```bash
yarn add packageName -W
```
- To add packages on the web (Next.js):
```bash
yarn workspace web add packageName
```
- To add packages on the mobile (React Native/Expo):
```bash
yarn workspace mobile add packageName
```