# Plan d'optimisation du dossier `src`

## Overview
Ce document décrit la stratégie pour améliorer la clarté et la performance du dossier `src`.

## Project Type
WEB (Next.js)

## Success Criteria
- Aucun composant ne dépasse 250 lignes.
- Suppression des appels DB redondants dans Auth.
- Centralisation des types TypeScript.
- Passage à 100% de succès sur `checklist.py`.

## Tech Stack
- Next.js 15+ (App Router)
- Prisma (ORM)
- NextAuth.js v5
- Tailwind CSS 4
- Lucide React (Icons)
- Framer Motion (Animations)

## Task Breakdown
### Phase 1: Analyse & Types
- [ ] Centraliser les types dans `src/types`
- [ ] Auditer les performances avec Lighthouse

### Phase 2: Refactorisation Composants
- [ ] Découper `UploadZone` en sous-composants
- [ ] Découper `ModuleLibraryClient`
- [ ] Créer des composants UI réutilisables (Cards, Skeletons)

### Phase 3: Optimisation Data & Auth
- [ ] Optimiser le callback JWT dans `auth.ts`
- [ ] Implémenter des Server Actions pour remplacer les fetch API clients là où c'est possible

## Phase X: Verification
- [ ] `python .agent/scripts/checklist.py .`
- [ ] `npm run build`
- [ ] `npx tsc --noEmit`
