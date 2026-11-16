## Pull Request Checklist

### 1. Summary of Changes
<!-- Provide a clear, concise summary of the changes in this PR -->

### 2. Verification Evidence
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm test -- --run` passes (100% test files green)
- [ ] `npm run build` succeeds locally
- [ ] Responsive layout verified on mobile (390x844) and desktop (1280x800)
- [ ] Bilingual check: Verified in both English (`en`) and Bangla (`bn`)

### 3. Security & Dependency Declaration
- [ ] Zero secrets, keys, or credentials committed
- [ ] Any new dependency is strictly justified in the description
- [ ] No regression on guest data or cloud synchronization
