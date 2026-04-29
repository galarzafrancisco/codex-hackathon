# Backend Layering Guidelines for Agents

Use this as the default contract for backend work. Keep the long how-to guides for examples; this file is the short rule set agents must follow.

## Controller, DTO, Service Split

- Controllers are HTTP adapters only.
- Controllers own route decorators, guards, pipes, status codes, headers, request extraction, OpenAPI endpoint documentation, and response mapping.
- Controllers do not contain business decisions, database access, cross-domain orchestration, external API calls, or complex calculations.
- Controllers call services with plain service input types, not raw HTTP request objects.
- Controllers return response DTOs, never entities and never service result types directly.
- Controllers map service results to response DTOs explicitly, field by field.
- Controllers let domain errors bubble to the global Problem Details filter unless a transport-specific exception is truly required at the HTTP boundary.

## API DTOs

- Every HTTP request and response shape uses a DTO class under `apps/backend/src/<domain>/dto/`.
- Request DTOs use `class-validator` decorators for validation.
- DTOs that coerce query/body values use `class-transformer`.
- Every exposed DTO field has OpenAPI decorators such as `@ApiProperty()` or `@ApiPropertyOptional()` with a useful `description`, `example`, and `type`, `enum`, or `enumName` where needed.
- Controllers use `@ApiTags()`, `@ApiOperation()`, and response decorators so the OpenAPI spec is complete.
- Params, query, body, and response DTOs are separate when their contracts differ.
- Response DTOs expose only public API fields. Do not leak internal fields such as row versions, soft-delete timestamps, secrets, or persistence-only identifiers.
- Partial update DTOs use `PartialType()` only when the endpoint is truly a general partial update. Dedicated state-transition endpoints should use dedicated DTOs.

## Service Types and Services

- Service input and result types live in `dto/service/*.service.types.ts`.
- Service types are pure TypeScript `type` or `interface` declarations.
- Service types do not use `@ApiProperty`, `class-validator`, `class-transformer`, HTTP types, GraphQL decorators, or transport-specific metadata.
- Services contain business logic, invariants, transactions, repository calls, and domain-level logging or metrics.
- Services must not import or throw `HttpException`, `NotFoundException`, `BadRequestException`, `UnauthorizedException`, or other HTTP-specific exceptions.
- Services throw typed domain errors with stable error codes and safe context.
- Services return service result types, not entities and not response DTOs.
- Services use native domain types where possible, such as `Date` for dates instead of ISO strings.
- Cross-domain calls go through the other domain module's exported public service API, not through another domain's repository or table.

## Mapping Flow

The standard flow is:

```text
HTTP request DTO -> controller mapping -> service input type
service -> service result type -> controller mapping -> HTTP response DTO
entity -> service result type -> response DTO
```

- Entity-to-result mapping belongs in the service or repository adapter.
- Result-to-response mapping belongs in the controller or a dedicated HTTP mapper.
- Date objects are converted to ISO strings at the response DTO boundary.
- Nullable fields are handled deliberately according to the API contract.
- Avoid object spreading across boundaries; explicit mapping protects the API contract.

## OpenAPI and Generated Clients

- Backend API changes must keep the OpenAPI spec accurate.
- New or changed DTO fields must be documented before relying on generated clients.
- After changing controllers or DTOs, run the repo's OpenAPI/client generation path before updating UI code.
- UI code must consume the generated client and generated types; do not hand-write matching frontend request or response types.

## Review Checklist

- No HTTP concerns in services or service types.
- No business logic in controllers.
- No entities returned to controllers or clients.
- Every API field is validated where applicable and documented with OpenAPI decorators.
- Every service method has a pure input/result type.
- Domain errors stay transport-agnostic and map to Problem Details at the boundary.
- Generated clients can be regenerated from the resulting OpenAPI spec without manual patches.
