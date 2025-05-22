# API Versioning with /v1 Prefix

## Overview

This document describes the implementation of API versioning in the Crossword application using the `/v1` prefix approach.

## Implementation

The application now supports both the original routes and routes with a `/v1` prefix for API versioning. This allows for:

1. Backward compatibility with existing clients
2. Future API changes without breaking existing clients
3. Clearer API structure and versioning strategy

## Routes Structure

All API routes are available through both the original paths and with the `/v1` prefix:

| Feature | Original Route | Versioned Route |
|---------|---------------|-----------------|
| Authentication | `/auth/*` | `/v1/auth/*` |
| Game | `/game/*` | `/v1/game/*` |
| Achievements | `/achievements/*` | `/v1/achievements/*` |
| Admin | `/admin/*` | `/v1/admin/*` |
| Debug Session | `/debug-session` | `/v1/debug-session` |

## Testing

A dedicated test script (`test_excel_upload_v1.sh`) has been created to test the API versioning implementation, specifically for the Excel file upload functionality, which was previously problematic.

## Running the Versioned API

To run the application with API versioning support:

```bash
./run_app_v1.sh
```

This script starts the application using `app_v1.js`, which includes all the necessary routes for both original and versioned APIs.

## Future Considerations

1. **Deprecation Strategy**: When introducing `/v2` or newer APIs, a clear deprecation timeline for `/v1` should be established.

2. **Documentation**: As the API evolves, maintaining comprehensive documentation for each version will be crucial for developers.

3. **Feature Parity**: Ensure that new features are available in both the latest API version and, where appropriate, backported to previous versions.

4. **Monitoring**: Set up monitoring to track which API versions are being used to inform deprecation decisions.
