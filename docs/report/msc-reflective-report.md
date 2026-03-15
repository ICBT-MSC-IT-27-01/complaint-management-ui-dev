# MSc Reflective Report: Group Project

## 1. Introduction to the Group Project
Our group project focused on designing and implementing a **Complaint Management System (CMS)** to support end-to-end complaint handling in an educational/organizational setting. The core objective was to build a usable, secure, and maintainable platform that allows users to submit complaints, track progress, and receive updates, while enabling administrators to triage, assign, and resolve cases efficiently.

From a systems perspective, the project combined:
- A modern web-based user interface for complaint submission and tracking.
- Backend APIs for complaint lifecycle management.
- Authentication and role-based access controls.
- Basic reporting and status visibility for operational decision-making.

At MSc level, the project was not only a software delivery exercise but also an opportunity to apply software engineering theory in a constrained, collaborative environment with real deadlines, evolving requirements, and quality expectations.

## 2. Methodology / Process Model Used and Critical Evaluation
### 2.1 Process Model Adopted
The team primarily followed an **Agile Scrum-inspired iterative model**, with elements of **Kanban flow management** for task visibility and throughput. Work was organized into short iterations (sprints), using backlog refinement, incremental development, peer reviews, and regular integration.

Typical cycle:
1. Prioritize backlog items from functional and non-functional requirements.
2. Break stories into technical tasks for frontend, backend, and testing.
3. Implement features incrementally and integrate continuously.
4. Review outcomes, fix defects, and adjust plans for the next sprint.

### 2.2 Why It Fit This Project
This model was suitable because:
- Requirements evolved as stakeholders clarified complaint workflows.
- The project had parallel workstreams (UI, API, security, testing).
- Early demonstrations were useful to validate usability and process logic.
- Incremental delivery reduced integration risk.

These benefits align with Agile principles of iterative delivery, stakeholder collaboration, and responsiveness to change (Beck et al., 2001; Schwaber & Sutherland, 2020).

### 2.3 Critical Evaluation
Although effective overall, applicability was mixed:
- **Strengths observed**:
  - Faster adaptation to requirement changes.
  - Better team communication through frequent checkpoints.
  - Early defect detection via continuous integration and review.
- **Limitations observed**:
  - Estimation variance occurred when requirements were underspecified.
  - Sprint goals were occasionally disrupted by cross-component dependencies.
  - Documentation lagged behind implementation during high-pressure phases.

In critical terms, Agile practices improved responsiveness but required stronger discipline in definition of done, dependency management, and technical documentation. Without these controls, iterative speed can reduce traceability and predictability (Pressman & Maxim, 2019).

## 3. My Contributions to the Project
My contributions were concentrated on both delivery and engineering quality:

1. Implemented key frontend modules for complaint listing, filtering, and status updates.
2. Integrated frontend workflows with backend APIs and handled request/response edge cases.
3. Contributed to authentication-aware UI behavior (e.g., protected routes and role-aware actions).
4. Performed bug fixing, refactoring, and code cleanup to improve readability and maintainability.
5. Participated in peer reviews and supported team integration efforts by resolving merge and environment issues.
6. Assisted in preparing technical documentation and progress demonstrations.

Beyond coding, I contributed to decision-making on prioritization tradeoffs (feature completeness vs. quality hardening) and highlighted practical risks around timeline and scope.

## 4. Skills Developed (New and Strengthened Existing Skills)
### 4.1 New Skills Developed
- Applying iterative delivery in a real team context rather than in theory.
- Translating ambiguous user needs into implementable, testable tasks.
- Coordinating API contracts between frontend and backend components.
- Practical defect triage and prioritization under sprint constraints.

### 4.2 Existing Skills Strengthened
- JavaScript/TypeScript-based frontend development practices.
- Component-based UI design and state management patterns.
- Git collaboration workflows (branching, code reviews, conflict resolution).
- Debugging and issue isolation across layers (UI, network, API behavior).

### 4.3 MSc-Level Professional Growth
The project strengthened my capability to connect **engineering process**, **software quality**, and **team coordination**. I improved in balancing theoretical best practices with practical constraints such as deadlines, changing requirements, and integration overhead.

## 5. Challenges Faced (Team and Individual)
### 5.1 Team-Level Challenges
1. **Requirement volatility**: Stakeholder clarifications changed scope and priorities.
2. **Dependency bottlenecks**: Frontend and backend tasks were interdependent; delays propagated.
3. **Inconsistent velocity**: Sprint outcomes varied due to uneven task complexity.
4. **Documentation debt**: Focus on coding reduced time for formal documentation updates.

### 5.2 Individual Challenges
1. Managing time between implementation, debugging, and academic commitments.
2. Handling ambiguous requirements during early development stages.
3. Maintaining code quality while meeting tight iteration deadlines.
4. Coordinating fixes when defects spanned both UI and API boundaries.

These challenges are consistent with known software project risks, including communication gaps, changing requirements, and planning uncertainty (Brooks, 1995; Sommerville, 2016).

## 6. Recommendations to Overcome the Challenges
1. **Strengthen requirement engineering early**:
   - Introduce lightweight but explicit acceptance criteria for each backlog item.
   - Use short stakeholder validation cycles before sprint commitment.

2. **Improve dependency management**:
   - Maintain interface contracts (API schemas/examples) before implementation.
   - Add integration checkpoints mid-sprint, not only at sprint end.

3. **Increase predictability of delivery**:
   - Use story sizing calibration sessions and track historical estimation error.
   - Separate exploratory tasks from delivery-critical tasks in sprint planning.

4. **Embed quality earlier (shift-left)**:
   - Expand unit/integration test coverage for critical complaint flows.
   - Enforce CI quality gates (linting, tests, build checks) on pull requests.

5. **Reduce documentation debt**:
   - Include documentation update as part of definition of done.
   - Maintain concise architectural decision records (ADRs) for major choices.

6. **Support individual productivity and resilience**:
   - Use focused task slicing and explicit work-in-progress limits.
   - Schedule structured peer support for blockers to reduce rework.

Collectively, these recommendations combine Agile adaptability with stronger engineering governance, improving both velocity and reliability.

## References
Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). *Manifesto for Agile Software Development*. http://agilemanifesto.org/

Brooks, F. P. (1995). *The Mythical Man-Month: Essays on Software Engineering* (Anniversary ed.). Addison-Wesley.

Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner’s Approach* (9th ed.). McGraw-Hill.

Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org/

Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.
