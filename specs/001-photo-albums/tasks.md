# Implementation Tasks: Photo Album Organization

**Feature**: Photo Album Organization (`001-photo-albums`)  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)  
**Status**: Ready for Implementation  
**Generated**: November 29, 2025

---

## Phase 1: Setup

Project initialization, dependencies, and project structure.

- [ ] T001 Initialize Vite project with vanilla JS template in `photo-albums/` directory
- [ ] T002 Install core dependencies: `better-sqlite3`, `vitest`, `eslint`
- [ ] T003 Create directory structure: `src/`, `db/`, `tests/`, `public/`
- [ ] T004 Set up Vite configuration (`vite.config.js`) with development server
- [ ] T005 Create HTML shell (`index.html`) with main container div
- [ ] T006 Set up ESLint configuration (`.eslintrc.json`)

---

## Phase 2: Foundation - Database & Services

Core infrastructure for data persistence and business logic.

- [ ] T007 Create SQLite schema (`db/schema.sql`) with albums, photos, user_preferences tables
- [ ] T008 Implement `src/services/database.js` with init, CRUD operations for all tables
- [ ] T009 Create `src/utils/dateUtils.js` with date grouping functions (weekKey, formatting)
- [ ] T010 Implement `src/services/albumService.js` with album CRUD, grouping, reordering logic
- [ ] T011 Implement `src/services/photoService.js` with photo import, metadata extraction, thumbnail generation
- [ ] T012 Create `src/services/storageService.js` for user preference persistence
- [ ] T013 Create simple event bus in `src/utils/eventBus.js` for component communication

---

## Phase 3a: User Story 1 - View and Browse Albums (P1)

Display albums organized by date on main page with photo previews.

### Tests (Optional - Manual Testing First)
- [ ] T014 [P] [US1] Manual test: Load app with test photos → verify albums auto-grouped by date
- [ ] T015 [P] [US1] Manual test: Click album → view photos in tile grid

### Implementation
- [ ] T016 Create `src/components/AlbumGrid.js` to render album cards with cover thumbnails
- [ ] T017 Create `src/components/AlbumCard.js` component for individual album card
- [ ] T018 Create `src/components/PhotoGallery.js` to display photos in responsive grid
- [ ] T019 Create `src/styles/globals.css` with reset and base styles
- [ ] T020 Create `src/styles/layout.css` with CSS Grid for album/photo layout
- [ ] T021 Create `src/styles/components.css` for card and tile styling
- [ ] T022 [P] Create `src/app.js` main controller to initialize app and handle navigation
- [ ] T023 [P] Create `src/main.js` entry point linking HTML to app controller
- [ ] T024 Implement album loading on app start (query database, display grid)
- [ ] T025 Implement click-to-view album logic (show photos, hide albums)
- [ ] T026 Implement back navigation (show albums, hide photos)

### Integration
- [ ] T027 [US1] Test: Load 10+ test photos, verify albums appear grouped by date
- [ ] T028 [US1] Test: Click album, verify tile grid displays all photos
- [ ] T029 [US1] Test: Navigate back to album list
- [ ] T030 [US1] Responsive design: Test on 320px mobile, 768px tablet, 1920px desktop

---

## Phase 3b: User Story 2 - Drag-and-Drop Album Reordering (P2)

Enable users to reorder albums on main page with persistence.

### Tests (Optional)
- [ ] T031 [P] [US2] Manual test: Drag album card to new position → verify visual reorder

### Implementation
- [ ] T032 Create `src/components/DragDrop.js` with drag event handlers
- [ ] T033 [P] Implement `dragstart` event handler to capture album ID
- [ ] T034 [P] Implement `dragover` event handler to show drop target feedback (highlight/placeholder)
- [ ] T035 [P] Implement `drop` event handler to reorder albums
- [ ] T036 [P] Implement `dragend` event handler to cleanup visual state
- [ ] T037 Create `src/styles/animations.css` with drag-drop feedback animations
- [ ] T038 Add drag-enabled styling to `AlbumCard.js` (cursor, pointer-events)
- [ ] T039 Implement album reorder persistence to database
- [ ] T040 Update `storageService.js` to store album custom order in preferences
- [ ] T041 Modify `albumService.js` to read custom order on app load

### Integration
- [ ] T042 [US2] Test: Drag 3 albums, refresh page → verify order persists
- [ ] T043 [US2] Test: Visual feedback (highlight) appears during drag
- [ ] T044 [US2] Test: Drag-drop works with keyboard + mouse (accessibility)
- [ ] T045 [US2] Test: Mobile drag-drop (touch events or fallback UI)

---

## Phase 3c: User Story 3 - Album Preferences (P3)

Allow users to rename albums, toggle sort modes, and reset to default.

### Tests (Optional)
- [ ] T046 [P] [US3] Manual test: Toggle sort mode → albums reorder accordingly

### Implementation
- [ ] T047 Create `src/components/Preferences.js` modal for settings
- [ ] T048 [P] Add preferences button to header/main page
- [ ] T049 [P] Implement toggle for "Auto-sort by Date" vs "Manual Order"
- [ ] T050 [P] Implement "Reset to Default" button with confirmation dialog
- [ ] T051 Add album rename UI (double-click to edit or rename button)
- [ ] T052 Implement album rename in `albumService.js`
- [ ] T053 Update `database.js` to persist custom album names
- [ ] T054 Create `src/styles/preferences.css` for modal styling
- [ ] T055 Handle sort mode toggle logic (switch DB sort order)

### Integration
- [ ] T056 [US3] Test: Rename album → name persists across refresh
- [ ] T057 [US3] Test: Toggle auto-sort → albums reorder by date
- [ ] T058 [US3] Test: Reset to default → all custom names cleared, date order restored
- [ ] T059 [US3] Test: Custom settings persist across multiple sessions

---

## Phase 4: Polish & Cross-Cutting Concerns

Quality, performance, and user experience improvements.

### Error Handling & Feedback
- [ ] T060 Implement error handling for database operations (try-catch, user feedback)
- [ ] T061 Add loading indicators (spinner) while photos are importing
- [ ] T062 Add empty state UI (no albums, no photos)
- [ ] T063 Add user notification system for success/error messages

### Performance & Optimization
- [ ] T064 [P] Implement lazy loading for photo thumbnails (Intersection Observer)
- [ ] T065 [P] Optimize thumbnail generation (limit size, cache as Base64)
- [ ] T066 Add pagination or virtual scrolling for large photo counts (100+)
- [ ] T067 Profile app performance (60 FPS target for tile rendering)

### Accessibility & UX
- [ ] T068 Add keyboard navigation (arrow keys to navigate albums/photos)
- [ ] T069 Add ARIA labels and semantic HTML
- [ ] T070 Implement focus management for modal/preference dialogs
- [ ] T071 Add touch-friendly hit targets (min 44px tap area)

### Testing & Quality
- [ ] T072 [P] Write unit tests for `dateUtils.js` (date grouping logic)
- [ ] T073 [P] Write unit tests for `albumService.js` (reordering, grouping)
- [ ] T074 Write integration tests for database operations (import, query)
- [ ] T075 Write end-to-end test scenarios (import → organize → rename → reset)

### Documentation & Cleanup
- [ ] T076 Create `README.md` with setup instructions and feature overview
- [ ] T077 Add inline code comments for complex logic
- [ ] T078 Create `DEVELOPMENT.md` with debugging tips
- [ ] T079 Ensure all dependencies documented in `package.json`

---

## Dependency Map & Parallelization

### Can Run in Parallel [P]
- Phase 1 setup tasks are independent
- Phase 3a component creation (T016-T021) can be parallel
- Phase 3b drag handlers (T033-T036) are independent
- Phase 3c preference components (T047-T054) independent

### Sequential Dependencies
- T002 → T003-T006 (need dependencies installed first)
- T008 → T010, T011, T012 (services depend on database)
- T013 → T022 (event bus used by app controller)
- T023 → T024-T026 (main.js must exist)
- T027-T030 → T031+ (Phase 3a must be testable before P2)
- T042-T045 → T056+ (P2 must work before P3 integration tests)

---

## Success Criteria Mapping

| Success Criterion | Tasks | Validation |
|------------------|-------|-----------|
| SC-001: Navigate album in <1s | T024, T025, T026 | T029 |
| SC-002: Reorder 5 albums in <30s | T032-T041 | T042 |
| SC-003: Custom order persists 3 restarts | T039, T040, T041 | T042 |
| SC-004: 60 FPS tile rendering | T020, T064, T067 | Manual profiling |
| SC-005: 95% photos grouped correctly | T010, T024 | T027 |
| SC-006: Users complete task first try | All P1 tasks | T028, T030 |
| SC-007: Works 320px-2560px | T020, T021, T030 | Manual testing |

---

## MVP Scope Recommendation

**Minimum Viable Product**: Complete **Phase 1 + Phase 2 + Phase 3a (US1)**
- Users can import photos
- Albums auto-group by date
- View photos in each album
- Navigate and browse

**Result**: Deliver core value immediately. P2 & P3 can follow in incremental releases.

---

## Next Steps

1. Begin Phase 1 (T001-T006): Project setup
2. Execute Phase 2 (T007-T013): Database & services
3. Implement Phase 3a (T014-T030): P1 features (View & Browse)
4. Proceed to Phase 3b (T031-T045) once P1 validated
5. Polish & ship Phase 4 as needed

**Estimated Timeline**:
- Phase 1: 1-2 hours
- Phase 2: 3-4 hours
- Phase 3a: 4-6 hours (core UI)
- Phase 3b: 2-3 hours (drag-drop)
- Phase 3c: 1-2 hours (preferences)
- Phase 4: 2-4 hours (polish & testing)

**Total**: ~14-21 hours to full feature completion

