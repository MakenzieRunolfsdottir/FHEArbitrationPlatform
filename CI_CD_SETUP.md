# CI/CD Setup Guide

Complete guide for the GitHub Actions CI/CD pipeline for the Anonymous Arbitration Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflow Configuration](#workflow-configuration)
- [Jobs Description](#jobs-description)
- [Code Quality Tools](#code-quality-tools)
- [Setup Instructions](#setup-instructions)
- [Badges](#badges)
- [Troubleshooting](#troubleshooting)

## 🌐 Overview

This project uses **GitHub Actions** for automated testing, code quality checks, and continuous integration. The CI/CD pipeline runs on:

- Every push to `main` or `develop` branches
- All pull requests targeting `main` or `develop`
- Multiple Node.js versions (18.x, 20.x, 22.x)
- Multiple platforms (Ubuntu, Windows)

## 🔧 Workflow Configuration

### Main Workflow: `.github/workflows/test.yml`

The workflow includes 5 parallel jobs:

1. **test-ubuntu** - Run tests on Ubuntu with Node.js matrix
2. **test-windows** - Run tests on Windows
3. **lint-and-format** - Code quality checks
4. **gas-report** - Gas usage analysis
5. **security-check** - Security analysis

### Workflow Triggers

```yaml
on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
```

## 🔨 Jobs Description

### 1. Test on Ubuntu (Matrix)

Runs tests across multiple Node.js versions in parallel.

**Node.js Versions:**
- 18.x
- 20.x
- 22.x

**Steps:**
1. Checkout code
2. Setup Node.js (specific version)
3. Install dependencies (`npm ci`)
4. Run Prettier format check
5. Run Solhint linter
6. Compile contracts
7. Run test suite
8. Generate coverage report
9. Upload coverage to Codecov (Node 20.x only)

**Key Features:**
- Matrix strategy for parallel testing
- Coverage upload only on Node.js 20.x
- Continue on linter errors (non-blocking)

### 2. Test on Windows

Validates cross-platform compatibility.

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Compile contracts
5. Run tests
6. Generate coverage

**Purpose:**
- Ensure Windows compatibility
- Catch platform-specific issues
- Validate npm scripts on Windows

### 3. Code Quality Checks

Dedicated job for linting and formatting.

**Checks:**
1. Prettier formatting validation
2. Solhint contract linting
3. Successful compilation

**Why Separate Job?**
- Clear separation of concerns
- Faster feedback on code quality
- Independent of test results

### 4. Gas Usage Report

Analyzes gas consumption of contract functions.

**Steps:**
1. Compile contracts
2. Run tests with gas reporting enabled
3. Upload gas report as artifact

**Output:**
- `gas-report.txt` artifact
- Retained for 30 days
- Available for download

### 5. Security Analysis

Automated security checks.

**Checks:**
1. `npm audit` - Dependency vulnerabilities
2. `npm outdated` - Outdated packages

**Configuration:**
- Moderate audit level
- Continue on errors (non-blocking)
- Informational purpose

## 🛠 Code Quality Tools

### Solhint Configuration

**File:** `.solhint.json`

**Key Rules:**
```json
{
  "compiler-version": ["error", "^0.8.0"],
  "quotes": ["error", "double"],
  "max-line-length": ["warn", 120],
  "code-complexity": ["warn", 8],
  "function-max-lines": ["warn", 50]
}
```

**Run Locally:**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Prettier Configuration

**File:** `.prettierrc.json`

**Solidity Settings:**
- Print width: 120 characters
- Tab width: 4 spaces
- Double quotes
- Explicit types always

**Run Locally:**
```bash
npm run format:check
npm run format  # Auto-format
```

### Codecov Integration

**File:** `codecov.yml`

**Coverage Targets:**
- Project: 80% minimum
- Patch: 75% minimum
- Threshold: 2-5% tolerance

**Features:**
- Automatic coverage comments on PRs
- Diff coverage visualization
- Ignored directories (test, scripts)

## 🚀 Setup Instructions

### 1. GitHub Repository Setup

#### Enable GitHub Actions

1. Go to repository **Settings** → **Actions** → **General**
2. Select "Allow all actions and reusable workflows"
3. Save changes

#### Configure Secrets

Add the following secrets in **Settings** → **Secrets** → **Actions**:

1. **CODECOV_TOKEN** (Optional but recommended)
   - Get from [codecov.io](https://codecov.io)
   - Sign in with GitHub
   - Add your repository
   - Copy the token
   - Add as repository secret

### 2. Local Development Setup

#### Install Dependencies

```bash
npm install
```

#### Run Code Quality Checks

```bash
# Format check
npm run format:check

# Lint Solidity
npm run lint

# Auto-fix formatting
npm run format

# Auto-fix linting
npm run lint:fix
```

#### Pre-commit Hook (Optional)

Install Husky for automatic checks:

```bash
npm install --save-dev husky
npx husky init
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npm run format:check
npm run lint
npm test
```

### 3. Codecov Setup

#### Step 1: Sign Up
1. Visit [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Grant repository access

#### Step 2: Add Repository
1. Click "Add new repository"
2. Select your repository
3. Copy the upload token

#### Step 3: Configure GitHub Secret
1. Go to repository Settings → Secrets
2. Create new secret `CODECOV_TOKEN`
3. Paste the token
4. Save

#### Step 4: Verify Integration
- Push code to trigger workflow
- Check Actions tab for workflow run
- Visit Codecov dashboard for coverage report

## 📊 Badges

Add these badges to your README.md:

### GitHub Actions Badge

```markdown
[![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml)
```

### Codecov Badge

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

### License Badge

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Node.js Version Badge

```markdown
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
```

## 🔍 Workflow Status

### Check Workflow Runs

1. Go to repository **Actions** tab
2. View all workflow runs
3. Click on a run to see details
4. Expand jobs to see individual steps

### Artifacts

Download generated artifacts:

1. Go to completed workflow run
2. Scroll to "Artifacts" section
3. Download `gas-report` (available for 30 days)

## ⚙️ Workflow Customization

### Add New Job

Edit `.github/workflows/test.yml`:

```yaml
new-job-name:
  name: New Job Description
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20.x
    - run: npm ci
    - run: npm run your-command
```

### Modify Node.js Versions

Edit the matrix in `test-ubuntu` job:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add/remove versions
```

### Add New Branch Trigger

```yaml
on:
  push:
    branches:
      - main
      - develop
      - feature/*  # Add pattern
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Workflow Not Running

**Problem:** Workflow doesn't trigger on push

**Solution:**
- Check if Actions are enabled in repository settings
- Verify branch name matches trigger configuration
- Check for YAML syntax errors

#### 2. Tests Failing on CI but Passing Locally

**Problem:** Tests pass locally but fail in CI

**Solution:**
- Check Node.js version consistency
- Verify environment variables
- Review CI logs for specific errors
- Test with `npm ci` instead of `npm install`

#### 3. Coverage Upload Fails

**Problem:** Codecov upload fails

**Solution:**
- Verify `CODECOV_TOKEN` secret is set
- Check if coverage files are generated
- Review Codecov GitHub App permissions
- Set `fail_ci_if_error: false` as fallback

#### 4. Linting Errors Block CI

**Problem:** Solhint errors prevent workflow completion

**Solution:**
- Run `npm run lint` locally and fix issues
- Run `npm run lint:fix` for auto-fixes
- Use `continue-on-error: true` if needed

#### 5. Out of Memory Errors

**Problem:** Tests fail with OOM errors

**Solution:**
- Reduce test parallelization
- Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096`
- Split tests into multiple jobs

### Debug Mode

Enable debug logging:

1. Go to Settings → Secrets
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow

## 📈 Metrics & Reporting

### Coverage Reports

**View Coverage:**
1. Check Codecov dashboard
2. Review PR comments with coverage diff
3. Download coverage artifacts from Actions

**Coverage Files:**
- `coverage/lcov.info` - Machine-readable
- `coverage/lcov-report/index.html` - Human-readable

### Gas Reports

**Access Gas Reports:**
1. Go to completed workflow run
2. Download `gas-report` artifact
3. Review gas usage per function

**Sample Output:**
```
·-----------------------------------------|---------------------------|-----------|
|  Contract                ·  Method      ·  Gas    ·  % of limit  │
·-----------------------------------------|---------------------------|-----------|
|  AnonymousArbitration    ·  register    ·  85000  ·  0.3%        │
|  Platform                ·  createDis   ·  120000 ·  0.4%        │
·-----------------------------------------|---------------------------|-----------|
```

## 🔐 Security Best Practices

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens periodically
- Use environment-specific secrets

### Dependency Security

- Run `npm audit` regularly
- Update dependencies promptly
- Review security advisories
- Use Dependabot for automated updates

### Workflow Security

- Pin action versions (e.g., `@v4`)
- Use `persist-credentials: false`
- Limit workflow permissions
- Review third-party actions

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Codecov Documentation](https://docs.codecov.io)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)

### Tools
- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [Prettier](https://prettier.io) - Code formatter
- [Solhint](https://protofire.github.io/solhint/) - Solidity linter

---

**CI/CD Status**: ✅ Fully Configured

**Last Updated**: 2024

**Maintainer**: Anonymous Arbitration Platform Team
