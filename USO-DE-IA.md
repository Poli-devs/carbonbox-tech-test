# Uso de Inteligencia Artificial en esta Prueba Técnica

## Herramientas Utilizadas
- [x] Antigravity AI Pair Programmer (DeepMind)
- [x] Claude Code / Cursor AI
- [x] GitHub Copilot
- [ ] ChatGPT
- [ ] Otra: _________________

---

## ¿Qué Generé con IA?

### Backend
- [x] **Estructura inicial de carpetas**: Scaffold de Clean Architecture y Domain-Driven Design (DDD) con Bounded Context `document-processing`.
- [x] **Schema de Prisma**: Modelos relacionales `Upload` y `ActivityData` con soporte de foreign keys e índices.
- [x] **Tipado Estricto de TypeScript**: Configuración de `tsconfig.json` con `strict: true`, `noImplicitAny: true` y meta de 0% de `any`.
- [x] **Either Pattern**: Utilidad funcional `Either<L, R>` para manejo determinista de errores en casos de uso.
- [x] **Lógica de Parseo de CSV**: Motor de parseo robusto en `CsvParserService` con detección de filas corruptas y validación de tipos.
- [x] **Mensajería Resiliente**: Cola en memoria con reintentos mediante backoff exponencial y desvío a Dead Letter Queue (DLQ).

### Frontend
- [x] **Setup de Next.js 14 App Router**: Configuración con TypeScript, Tailwind CSS y cliente Axios.
- [x] **Componentes UI Base**: `UploadForm` (con drag & drop y progreso), `UploadList` (con badges por estado y paginación), `UploadDetail` (con resumen de métricas) y `ResultsTable` (con búsqueda y filtros).
- [x] **Hooks de TanStack React Query**: Configuración de queries con polling dinámico cada 3 segundos en estado `PROCESSING`.
- [x] **Diseño Visual**: Paleta moderna en modo oscuro basada en colores esmeralda/ecológicos representativos de CarbonBox.

---

## ¿Qué Modifiqué o Corregí de lo Generado por IA?

1. **Aplicación Estricta del Patrón Either en CQRS**:
   - *Situación inicial*: La IA sugería bloques `try/catch` convencionales dentro de los controladores HTTP y lanzaba excepciones (`throw new Error(...)`) en los servicios de aplicación.
   - *Corrección*: Se adaptaron todos los `ICommandHandler` y `IQueryHandler` para devolver de manera obligatoria `Promise<Either<Error, T>>`. Los controladores se convirtieron en capas delgadas que inspeccionan `result.isLeft()` para responder con el status HTTP correspondiente (200, 201, 400, 404).

2. **Validación Exhaustiva de Dominio con Value Objects**:
   - *Situación inicial*: La IA inicialmente aceptaba cualquier string como nombre de archivo o estado en la capa de infraestructura.
   - *Corrección*: Se implementaron los Value Objects `FileName` y `UploadStatus`. Se añadieron validaciones contra ataques de path traversal (`..`, `/`, `\`), verificación de extensión obligatoria `.csv`, e invariantes de negocio para asegurar que la cantidad (`amount`) sea estrictamente positiva.

3. **Mapeo Bidireccional entre Prisma y el Dominio**:
   - *Situación inicial*: La IA mezclaba las entidades de Prisma Client directamente en los casos de uso de la aplicación.
   - *Corrección*: Se crearon mappers explícitos (`PrismaUploadMapper` y `PrismaActivityDataMapper`), desacoplando por completo el dominio del ORM y permitiendo cambiar la base de datos sin afectar las reglas de negocio.

4. **Polling Inteligente en React Query**:
   - *Situación inicial*: Se sugería un `setInterval` manual con `useEffect` que podía provocar memory leaks y saturar el backend.
   - *Corrección*: Se configuró `refetchInterval` condicional dentro del hook `useUpload(id)`, de modo que el polling se detiene automáticamente en el momento en que el archivo pasa a estado `COMPLETED` o `FAILED`.

---

## ¿Qué Aprendí en el Proceso?

1. **Clean Architecture combinada con CQRS en Node.js**:
   - Profundicé en cómo aislar completamente los comandos (mutaciones de estado) de las consultas (lecturas optimizadas). Esto permite optimizar los flujos de lectura sin cargar la lógica de las entidades de dominio.
2. **Either Pattern en TypeScript**:
   - Comprobé cómo el tipado algebraico de `Either<Left, Right>` elimina la necesidad de capturar excepciones en capas superiores y hace que todos los posibles errores formen parte explícita de la firma de tipos de cada función.
3. **Resiliencia en Mensajería Asíncrona (DLQ + Backoff Exponencial)**:
   - Diseñé un mecanismo de reintentos local que replica con exactitud el comportamiento de AWS SQS, aislando mensajes venenosos en una cola de mensajes no procesables (DLQ) para evitar bucles infinitos en los trabajadores.
4. **TanStack React Query en Next.js 14**:
   - Afiancé el manejo de estados asíncronos en componentes cliente, invalidación de queries en mutaciones y estrategias de polling reactivo.

---

## Limitaciones Encontradas con Herramientas de IA

1. **Rutas Relativas en Arquitecturas Profundas**:
   - La IA tiende a calcular erróneamente los niveles de subida (`../`) en estructuras de carpetas con muchas capas jerárquicas (Domain, Application, Infrastructure, Presentation). Fue necesario ajustar manualmente las importaciones para cumplir con la verificación estricta de TypeScript.
2. **Simplicidad Excesiva en Mocks de Colas**:
   - Los ejemplos comunes de IA para "colas mock" se limitaban a un array con `shift()`, ignorando reintentos, tiempos de visibilidad y Dead Letter Queues. Se implementó una cola orientada a eventos con backoff exponencial para cumplir con los estándares Senior de la prueba.

---

## Tiempo Invertido

- **Setup del entorno, reglas `.agents` y Docker Compose:** 30 minutos
- **Backend (DDD, Prisma, CQRS, Fastify, Worker y Tests):** 1 hora 45 minutos
- **Frontend (Next.js 14, React Query, Tailwind, Vistas y Componentes):** 1 hora 15 minutos
- **Pruebas integradas, documentación y diagramas AWS:** 30 minutos
- **Total invertido:** ~4 horas
