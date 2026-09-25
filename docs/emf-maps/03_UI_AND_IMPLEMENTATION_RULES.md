# EMF Maps — UI & Implementation Rules

## Working method

The project is at a sensitive integration stage.

Always:

1. inspect the exact current implementation
2. identify the exact selector/function/block
3. make one change
4. test immediately
5. only then make the next change

Avoid speculative selector guessing.

## Dashboard visual target

Desired hierarchy:

```text
PROPERTY HEALTH DASHBOARD

Property name
Your property's current environmental profile

PROPERTY OVERVIEW
Property Type | Location | Floors | Property ID

ENVIRONMENT                         LIFESTYLE
Indoor Sources | Outdoor Sources | Total Sources | Living Areas

CURRENT ASSESSMENT

PROPERTY INSIGHTS

PROPERTY HEALTH HISTORY
Initial record created
[date]
```

Lifestyle should visually align with the existing Environment metric design.

The outer Lifestyle section may have its own width because it is paired with Environment, but the inner Living Areas metric should visually match one Environment metric.

## Failed approaches — do not repeat

Do not use:

```css
width: calc((100% - 32px) / 3);
```

Do not arbitrarily set:

```css
width: 210px;
```

unless the actual current Environment metric dimensions justify it.

Do not use:

```css
font-size: 21px;
```

for `3 living areas added` when the goal is to match Environment typography.

Do not create nested:

```css
.property-health-dashboard-card
```

cards.

Do not add duplicate Lifestyle blocks.

## Legacy structures

There are duplicate/legacy Dashboard structures in `frontend/index.html`.

Known legacy date element:

```text
propertyHealthDashboardCreatedDate
```

Active visible Dashboard date element:

```text
dashboardPropertyCreatedDate
```

When debugging visibility, first confirm the element's bounding rectangle and parent chain before changing CSS.

## Other protected areas

Do not modify:

- Business Survey
- Account Dashboard
- `liveAnalysisPanel`
- existing PHR popup architecture
- Full EMF Insight Report
- Professional Assessment
