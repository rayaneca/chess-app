# ♟️ Chess App

A React Native chess application built with Expo, NativeWind, and chess.js.

## 📱 Tech Stack

- **Expo** (SDK 57) - React Native framework
- **NativeWind** - Tailwind CSS for React Native
- **Expo Router** - File-based routing
- **chess.js** - Chess game logic
- **react-native-chessboard** - Chess board UI

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo Go app on your phone (for testing)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rayaneca/chess-app.git
cd chess-app

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start

# 4. Open on your device
#    - Scan QR code with Expo Go (Android/iOS)
#    - Press 'w' for web browser
#    - Press 'a' for Android emulator
#    - Press 'i' for iOS simulator (Mac only)





---

# 🌿 Git Workflow (For Contributors)

This project uses **two branches**:

- **`main`** → Development branch. All new features, fixes, and changes should be made here.
- **`master`** → Stable branch. This branch should only contain tested and working code.

> **Never work directly on `master` unless specifically asked.**

---

## 1️⃣ Clone the Project

```bash
git clone https://github.com/rayaneca/chess-app.git
cd chess-app
```

---

## 2️⃣ Check Available Branches

```bash
git branch -a
```

You should see something similar to:

```
* main
  master
```

---

## 3️⃣ Switch to the Development Branch

If you're not already on `main`:

```bash
git checkout main
```

or

```bash
git switch main
```

Always make sure you're on the **main** branch before starting work.

---

## 4️⃣ Get the Latest Changes

Before writing any code, always download the newest version:

```bash
git pull origin main
```

Do this every time before you start working to avoid merge conflicts.

---

## 5️⃣ Create Your Own Branch

Never code directly on `main`.

Create a branch for your feature or fix.

Example:

```bash
git checkout -b feature/login-screen
```

or

```bash
git switch -c feature/login-screen
```

Some branch name examples:

```
feature/profile-page
feature/chess-ai
fix/checkmate-bug
fix/login-error
```

---

## 6️⃣ Work on the Project

Make your changes normally.

You can check modified files:

```bash
git status
```

---

## 7️⃣ Save Your Changes

Stage all files:

```bash
git add .
```

Commit them:

```bash
git commit -m "Add login screen"
```

Write meaningful commit messages.

Examples:

```
Add multiplayer support
Fix board orientation
Improve game performance
Update README
```

---

## 8️⃣ Push Your Branch

The first time:

```bash
git push -u origin feature/login-screen
```

Later, you only need:

```bash
git push
```

---

## 9️⃣ Create a Pull Request

After pushing your branch:

1. Open the GitHub repository.
2. GitHub will suggest creating a Pull Request.
3. Click **Compare & Pull Request**.
4. Select:
   - **Base:** `main`
   - **Compare:** your branch
5. Wait for review before merging.

---

## 🔄 Updating Your Branch

If someone pushed new changes to `main`:

Switch to main:

```bash
git checkout main
```

Download the latest code:

```bash
git pull origin main
```

Go back to your branch:

```bash
git checkout feature/login-screen
```

Merge the latest changes:

```bash
git merge main
```

---

## 🚀 Updating the Stable Branch (`master`)

Only after the project has been tested and everything works correctly should the `master` branch be updated.

Usually this is done by the project owner after reviewing the changes.

---

# 📌 Daily Workflow

Every time you work on the project:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

After finishing:

```bash
git add .
git commit -m "Describe your changes"
git push -u origin feature/my-feature
```

Then create a Pull Request to **main**.

---

# 📖 Useful Git Commands

| Command | Description |
|---------|-------------|
| `git status` | Show modified files |
| `git branch` | Show local branches |
| `git branch -a` | Show all branches |
| `git switch main` | Switch to main |
| `git switch -c feature/name` | Create a new branch |
| `git pull origin main` | Download latest changes |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes |
| `git push` | Upload commits |
| `git log --oneline` | Show commit history |

---

## ✅ Rules

- Always pull before starting work.
- Never push directly to `master`.
- Create a new branch for every feature or bug fix.
- Write clear commit messages.
- Open a Pull Request instead of merging directly.
- Ask for review before merging into `main`.
