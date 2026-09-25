# EMF Maps — Property Health Record & Dashboard

## Home information hierarchy

```text
HOME
 ↓
MY PROPERTY
 ↓
DISCOVER
 ↓
UNDERSTAND
 ↓
PROPERTY HEALTH RECORD
 ↓
ASSESS
 ├── SELF-ASSESS
 └── PROFESSIONAL
 ↓
ACT
 ├── DIY
 ├── PROFESSIONAL
 └── SOLUTIONS
 ↓
TRACK
 ↓
PROPERTY HEALTH HISTORY
```

## User-facing terminology

- Home Project → My Property
- Results → Property Insights
- Property Health Record → persistent property's record
- Assessment → individual assessment event
- Property ≠ Assessment

## PHR

The PHR popup is already working and must not be rebuilt.

Current PHR sections:

- Property + Location
- Environment + Lifestyle
- Current Assessment
- Record History
- link to Property Health Dashboard

Current example:

```text
PROPERTY HEALTH RECORD
Test dar naujas

Environment
Indoor Sources 3
Outdoor Sources 1
Total Sources 4

Lifestyle
3 living areas added

Current Assessment
Initial Home Assessment
In progress

Record History
Initial record created
25 September 2026
```

## Environment data source

Indoor sources are derived from:

```javascript
floor.sources
```

not from `AppState.homeProject.indoorSources`.

Conceptually:

```javascript
const indoorCount =
    floors.reduce(
        (total, floor) =>
            total +
            (
                Array.isArray(floor?.sources)
                    ? floor.sources.length
                    : 0
            ),
        0
    );
```

Outdoor sources:

```javascript
const outdoorSources =
    Array.isArray(homeProject?.outdoorSources)
        ? homeProject.outdoorSources
        : [];
```

## Lifestyle data source

Lifestyle / living areas are derived from:

```javascript
floor.zones
```

Example:

```javascript
const lifestyleAreas =
    floors.flatMap(
        floor =>
            Array.isArray(floor?.zones)
                ? floor.zones
                : []
    );
```

## Dashboard

The active visible Dashboard is the newer Home-specific view:

```text
#propertyHealthDashboardView
```

There is also older/legacy Dashboard markup in `index.html`. Do not accidentally modify the hidden legacy structure when fixing the visible Dashboard.

Important active IDs include:

```text
dashboardPropertyType
dashboardPropertyLocation
dashboardPropertyFloors
dashboardPropertyId

dashboardIndoorSources
dashboardOutdoorSources
dashboardTotalSources

dashboardLifestyle

dashboardPropertyCreatedDate
```

## Creation date

The visible Dashboard originally showed:

```html
<div id="dashboardPropertyCreatedDate">—</div>
```

The existing PHR code already calculated the Property creation date, but the visible Dashboard had no writer for `dashboardPropertyCreatedDate`.

The final surgical fix writes the same calculated date to both possible Dashboard date elements:

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

This preserves the existing legacy element while also populating the active visible Dashboard.

## Date formatting

Current display format:

```text
25 September 2026
```

using:

```javascript
createdDate.toLocaleDateString(
    "en-GB",
    {
        day: "numeric",
        month: "long",
        year: "numeric"
    }
);
```
