# EMF Maps — Recent Debug Log

## Duplicate Dashboard discovery

There are two Dashboard-related structures in `frontend/index.html`.

The legacy/hidden structure contains:

```text
#propertyHealthDashboardModal
#propertyHealthDashboardCreatedDate
```

The active visible Home Dashboard is:

```text
#propertyHealthDashboardView
```

and its date element is:

```text
#dashboardPropertyCreatedDate
```

## Date debugging

The active Property had:

```text
propertyCreatedAt:
2026-09-25T09:21:27.020Z
```

The date formatter produced:

```text
25 September 2026
```

but the visible Dashboard still showed `—`.

Inspection showed the visible element existed, but no code in `app_mode.js` referenced:

```text
dashboardPropertyCreatedDate
```

A search returned:

```text
INDEX: -1
dashboardPropertyCreatedDate NOT FOUND
```

The existing date code was found in the PHR / legacy Dashboard history logic and wrote only to:

```text
propertyHealthDashboardCreatedDate
```

## Final fix

The existing writer was expanded to target both elements:

```javascript
const createdDateElements = [
    document.getElementById(
        "propertyHealthDashboardCreatedDate"
    ),
    document.getElementById(
        "dashboardPropertyCreatedDate"
    )
].filter(Boolean);

createdDateElements.forEach(
    createdDateElement => {
        createdDateElement.textContent =
            propertyCreatedDateText;
    }
);
```

Result:

```text
Dashboard → Initial record created
25 September 2026
```

Verified by user.

## Important debugging lesson

When a value exists in AppState and a DOM element exists but remains visually empty:

1. verify the active visible DOM element
2. distinguish duplicate/legacy markup
3. search loaded source for the exact active element ID
4. identify the actual writer
5. only then modify code

Do not fix the wrong duplicate element.
