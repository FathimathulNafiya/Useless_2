# Contributing to DA Roast Bot 🔥

Thank you for your interest in improving DA Roast Bot! Whether you're fixing a bug, adding new roasts to the pool, expanding the heuristic knowledge base, or tuning UI animations, all contributions are welcomed.

---

## 1. Development Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd useless2.0
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(Optional: Populate `OPENAI_API_KEY` with your OpenAI key. If omitted, the smart offline heuristic engine handles all requests automatically).*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5000` with hot-reloading active.

5. **Run the Automated Test Suite:**
   ```bash
   npm test
   ```

---

## 2. Code Standards

- **Formatting:** Standard 2-space indentation (enforced via `.editorconfig` and `.prettierrc`).
- **Commits:** Follow conventional commits:
  - `feat: add new persona`
  - `fix: resolve SSE streaming termination`
  - `docs: update API documentation`
  - `test: expand integration coverage`
- **Testing:** All pull requests must maintain 100% pass rates on `test_suite.js`.

---

## 3. Contribution Guidelines

- **Roast Guidelines:** Keep roasts comedic, relatable to student/tech life, and strictly non-toxic. We do not accept hateful, discriminatory, or harassing content.
- **Educational Accuracy:** If modifying academic or coding explanations, ensure technical precision (e.g., proper asymptotic complexity, valid syntax).
