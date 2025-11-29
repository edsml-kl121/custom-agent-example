````chatagent
---
description: A simple example agent that demonstrates handoffs to both analyze and implement agents.
handoffs:
  - label: Analyze Project
    agent: speckit.analyze
    prompt: Run analysis to check project consistency
    send: true
  - label: Implement Changes
    agent: speckit.implement
    prompt: Start implementing the verified tasks
    send: true
---

## Goal

This is a minimal example demonstrating how to use handoffs between agents in the speckit framework.

## What This Agent Does

1. **Receives input**: Takes user context about what to work on
2. **Hands off to Analyze**: Sends the project to the analyze agent for consistency checking
3. **Hands off to Implement**: Sends verified tasks to the implement agent for execution

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Check Prerequisites
Get the project structure and available documents.

### Step 2: Hand Off to Analyze
The analyze agent will:
- Validate spec.md, plan.md, and tasks.md consistency
- Identify any issues or gaps
- Report findings

### Step 3: Hand Off to Implement
The implement agent will:
- Execute tasks in the correct order
- Build the project incrementally
- Handle phase-by-phase implementation

## Key Handoff Points

**To Analyze Agent:**
- Label: "Analyze Project"
- Purpose: Verify consistency before implementation
- Data: Project artifacts (spec.md, plan.md, tasks.md)

**To Implement Agent:**
- Label: "Implement Changes"
- Purpose: Execute verified tasks
- Data: Verified tasks.md

## Next Steps

1. The analyze agent validates your project
2. The implement agent executes the tasks
3. You get a fully implemented feature

This demonstrates the power of agent handoffs for sequential workflows!
````
