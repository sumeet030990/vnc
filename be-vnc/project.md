# Backend Code Rules (be-vnc)

Follow these rules every time you write new backend code.

## 1. Request flow

Every request always goes through these layers, in this order:

```
routes -> controllers -> services -> repositories -> database
```

- A layer may only call the layer right below it.
- Never skip a layer (for example, a controller must never call a repository).
- Never call a layer above (for example, a repository must never call a service).

## 2. Files and naming

| Layer      | Folder                  | Grouped by | File name                | Example             |
| ---------- | ----------------------- | ---------- | ------------------------ | ------------------- |
| Route      | `src/routes/`           | feature    | `<feature>Routes.ts`     | `authRoutes.ts`     |
| Controller | `src/app/controllers/`  | feature    | `<feature>Controller.ts` | `authController.ts` |
| Service    | `src/app/services/`     | table      | `<table>Service.ts`      | `userService.ts`    |
| Repository | `src/app/repositories/` | table      | `<table>Repository.ts`   | `userRepository.ts` |
| Validation | `src/app/validations/`  | feature    | `<feature>Validation.ts` | `authValidation.ts` |

- File names are camelCase with the layer name at the end: `<name><Layer>.ts`.
- **Never use dots in file names** (`auth.controller.ts` is wrong, `authController.ts` is right).
- Names with more than one word stay camelCase too (for example `userProfileController.ts`).
- The imported name matches the file name: `import * as userService from '../services/userService'`.
- Every database table has its own service file and its own repository file.
- Code for one table goes only in that table's service and repository.

## 3. Routes (`src/routes/`)

- Only map a URL and HTTP method to a controller function.
- Add the Zod checks here (see rule 8).
- No logic here.

```ts
router.get('/users', authController.getLoginUsers)
router.post('/login', validateBody(loginSchema), authController.login)
```

## 4. Controllers (`src/app/controllers/`)

- Grouped by feature, so one controller may use several services.
- Only hand the request over to the right service(s) and send back the result.
- **When a feature needs more than one table, the controller calls each table's service** (see rule 5).
- Read what the services need from `req` (`req.body`, `req.params`, `req.query`) and pass it on.
- No business logic, no database calls, no `try/catch` (Express 5 passes thrown errors to `errorHandler` for us).
- Import services as a namespace: `import * as userService from '../services/userService'`.

```ts
export async function getStats(_req: Request, res: Response) {
  const [users, roles, items] = await Promise.all([
    userService.countUsers(),
    roleService.countRoles(),
    itemService.countItems(),
  ])
  res.json({ users, roles, items })
}
```

## 5. Services (`src/app/services/`)

- All business logic lives here: checks, rules, decisions, and shaping the response.
- Get and save data only by calling repositories.
- Never import or use `prisma` directly, except to start a transaction (rule 7).
- **Try not to call another service from a service.** Let the controller call each service instead.
  - This is a strong preference, not a hard rule. If you must break it, say why in a short comment.
  - Exception: work that must run in one transaction (rule 7).
- When something goes wrong for the user, throw `HttpError(status, message)` from `src/lib/httpError.ts`.
- Use the types made from Zod schemas (for example `LoginInput`) for inputs.

```ts
export async function login({ userId, password }: LoginInput) {
  const user = await userRepository.findLoginUserById(userId)
  if (!user || user.password !== password) {
    throw new HttpError(401, 'Invalid user or password')
  }
  return { id: user.id, name: user.name }
}
```

## 6. Repositories (`src/app/repositories/`)

- All database work (read, create, update, delete) happens only here.
- No business logic and no `HttpError` here. Just talk to the database.
- Every function takes `db: DbClient = prisma` as its **last** argument, so it can run inside a transaction.
- Use `select` or `include` to fetch only the fields that are needed.

```ts
export function findLoginUserById(id: number, db: DbClient = prisma) {
  return db.user.findFirst({
    where: { id, allow_login: true },
    include: { role: true },
  })
}
```

## 7. Transactions (work that touches more than one table)

- If one action **writes** to more than one table, or must read and write them as one step, it must run inside a transaction.
  - A transaction means: either every step succeeds, or none of them are saved.
- A transaction cannot be split across controller calls. So this is the one place a service works with more than one table:
  - The service that owns the main table starts the transaction with `prisma.$transaction(async (tx) => { ... })`.
  - Inside it, call the other tables' **repositories** directly (not their services), and pass `tx` to every call.
- Plain reads from several tables that don't need to stay in sync (like the dashboard totals) don't need a transaction. The controller calls each service.
- Do not make network calls or slow work inside a transaction. Keep it short.

```ts
// userService.ts
export function createUserWithRole(input: CreateUserInput) {
  return prisma.$transaction(async (tx) => {
    const role = await roleRepository.findBySlug(input.roleSlug, tx)
    if (!role) throw new HttpError(404, 'Role not found')
    return userRepository.create({ ...input, roleId: role.id }, tx)
  })
}
```

## 8. Validation with Zod

Check every input that comes from the client:

| Input        | When                                          | Middleware               |
| ------------ | --------------------------------------------- | ------------------------ |
| `req.body`   | every POST, PUT, PATCH and DELETE with a body | `validateBody(schema)`   |
| `req.params` | every route with URL params (`/:id`)          | `validateParams(schema)` |
| `req.query`  | every route that reads query strings          | `validateQuery(schema)`  |

- Schemas live in `src/app/validations/<feature>Validation.ts`.
- Export each schema and its type together:

```ts
export const loginSchema = z.object({ ... })
export type LoginInput = z.infer<typeof loginSchema>
```

- URL params and query strings always arrive as text, so use `z.coerce` to turn them into numbers or booleans (for example `z.coerce.number().int()`).
- PATCH schemas: make fields optional (for example `createSchema.partial()`), but reject an empty body.
- PUT schemas: every field is required (PUT replaces the whole record).
- DELETE routes: always check `req.params` (for example the `id`), plus the body if there is one.
- Write clear error messages with `{ error: '...' }` (Zod 4 style; don't use the old `message` option).
- Use Zod 4 helpers that match the installed version (for example `z.int()`, `z.email()`, `z.flattenError()`).

## 9. Errors

- Services throw `HttpError` for known problems (400, 401, 403, 404, 409, ...).
- Anything else is caught by `src/app/middlewares/errorHandler.ts` and returns 500.
- Never send raw database errors back to the client.

## 10. Checklist for a new feature

1. Zod schemas in `src/app/validations/<feature>Validation.ts` for body, params and query.
2. Repository functions in `src/app/repositories/<table>Repository.ts` (with `db: DbClient = prisma`).
3. Service functions in `src/app/services/<table>Service.ts` (logic, plus a transaction if it writes to more than one table).
4. Controller function in `src/app/controllers/<feature>Controller.ts` (only calls the service or services).
5. Route in `src/routes/<feature>Routes.ts` with the right `validate...` middleware, and register it in `app.ts` if it's a new router.
