# EMF Maps — Next Steps

## Completed

### Property identity

- unique Property ID generation verified
- PHR ID generation verified
- new Property data persisted
- Property identity restored after refresh

### Property creation date

- `createdAt` generated once during Property creation
- `propertyCreatedAt` persisted
- restored after reload
- PHR reads the persistent date
- Dashboard reads the same persistent date
- visible Dashboard now displays the formatted date

## Remaining work

### 1. Dashboard visual polish

Continue only after inspecting the exact current CSS.

Primary target:

- Lifestyle metric width
- Lifestyle label typography
- Lifestyle value typography
- spacing/alignment relative to Environment metrics

### 2. Dashboard spacing

Check:

- card vertical rhythm
- section spacing
- metric alignment
- responsive behavior

### 3. Existing legacy property date

There is an older test Property:

```text
Test dar naujas
Property ID: PHI-PRP-036ECDB9
```

Its historical creation date must not be invented.

If its date needs correction, confirm the intended date explicitly before changing stored data.

### 4. Final regression test

Test at minimum:

```text
Create new Property
→ unique Property ID
→ unique PHR ID
→ createdAt generated
→ save
→ refresh
→ reload Property
→ open PHR
→ open Dashboard
→ verify same Property ID
→ verify same creation date
→ verify sources
→ verify lifestyle
→ verify assessment
```

## Do not start architecture refactoring

The current goal is stabilization and visual polish, not a rewrite.
