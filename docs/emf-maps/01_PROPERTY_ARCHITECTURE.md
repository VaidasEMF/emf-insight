# EMF Maps — Property Architecture

## Canonical model

Property is the persistent parent.

```text
Property
   ↓
Property Health Record
   ↓
Multiple Assessments over time
```

Property Health Record is not the same thing as an Assessment.

## Canonical AppState property

```javascript
property: {
    id: null,
    propertyHealthRecordId: null,
    name: "",
    country: "",
    state: "",
    region: "",
    city: "",
    address: "",
    propertyType: "",
    floors: [],
    currentFloorIndex: 0,
}
```

## IDs

`frontend/core/id_factory.js` provides:

```javascript
createPropertyId()
createPropertyHealthRecordId()
createPropertyAssessmentId()
```

Property creation generates a Property ID and PHR ID.

Example format:

```text
PHI-PRP-B8AB917B
```

## Assessment relationship

```javascript
AppState.propertyAssessment.id =
    createPropertyAssessmentId();

AppState.propertyAssessment.propertyId =
    AppState.property.id;

AppState.propertyAssessment.propertyHealthRecordId =
    AppState.property.propertyHealthRecordId;
```

## Property creation

`createProject()` remains part of the current architecture.

A new Home Property receives:

```javascript
AppState.property.id =
    window.PhiIdFactory?.createPropertyId?.();

AppState.property.propertyHealthRecordId =
    window.PhiIdFactory?.createPropertyHealthRecordId?.();

AppState.property.createdAt =
    new Date().toISOString();
```

The generated values are persisted with the created Home project data.

## Persistence

Current verified persistence:

```text
CREATE PROPERTY
      ↓
create Property ID
      ↓
create PHR ID
      ↓
createdAt = current ISO timestamp
      ↓
persist in project data
      ↓
load project
      ↓
restore AppState.property.id
restore AppState.property.createdAt
      ↓
PHR + Dashboard read the same Property data
```

Restore logic uses the persisted project values rather than generating a new Property identity on load.

## Important distinction

Do not confuse:

- database Project `created_at`
- Property `createdAt` / `propertyCreatedAt`

The Property creation date is part of the Property data model and is persisted through the project data payload.
