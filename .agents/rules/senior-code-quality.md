# Reglas de Calidad y Arquitectura de Código Senior (CarbonBox Standards)

Estas directrices son de cumplimiento obligatorio para todo el código desarrollado en el proyecto.

---

## 1. Regla de Tipado Estricto (Cero `any`)
- **Prohibido el uso de `any`**: No se permite `any` en firmas de funciones, retornos, interfaces o DTOs.
- **Tipado Explícito**: Si un tipo es desconocido inicialmente, usar `unknown` junto con type guards o validación con schemas (Zod).
- **Inmutabilidad**: Preferir `readonly` en propiedades de Value Objects y entidades de dominio.

---

## 2. Clean Architecture & Límites de Dominio (DDD)
- **Bounded Context**: `document-processing`.
- **Capa Domain**:
  - No depende de NINGUNA librería externa de persistencia (prohibido importar `@prisma/client` o drivers DB en `domain`).
  - Contiene Entidades, Aggregate Roots, Value Objects e interfaces de Repositorios (`IUploadRepository`, `IActivityDataRepository`).
  - Los Value Objects son inmutables y validan sus propias invariantes al crearse (ej. `FileName`, `UploadStatus`).
- **Capa Application**:
  - Contiene Casos de Uso implementados como Handlers de CQRS (`CreateUploadCommandHandler`, `GetUploadByIdQueryHandler`, etc.).
  - No tiene dependencias de HTTP ni frameworks web (no importar Fastify ni Request/Response en Application).
  - Orquesta entidades y servicios de dominio.
- **Capa Infrastructure**:
  - Implementa los contratos de dominio: Repositorios con Prisma, almacenamiento de archivos, cola de mensajería.
  - Utiliza Mappers explícitos para transformar modelos de Prisma a Entidades de Dominio y viceversa.
- **Capa Presentation**:
  - Controllers delgados que adaptan HTTP a Commands/Queries y traducen `Either` a códigos HTTP adecuados (200, 201, 400, 404, 500).
  - Prohibido incluir lógica de negocio o queries directas a la base de datos en los controladores o rutas.

---

## 3. CQRS (Command Query Responsibility Segregation)
- **Commands (Escritura)**:
  - Modifican estado del sistema.
  - Cada Command tiene su handler específico implementando `ICommandHandler<TCommand, TResult>`.
  - Retornan `Either<Error, TResult>`.
- **Queries (Lectura)**:
  - Solo consultan datos sin producir efectos secundarios.
  - Cada Query tiene su handler específico implementando `IQueryHandler<TQuery, TResult>`.
  - Retornan `Either<Error, TResult>`.

---

## 4. Either Pattern para Manejo de Errores Funcional
- **No lanzar excepciones no controladas (`throw`)**: La lógica de negocio y los casos de uso retornan instancias de `Either.left(Error)` en caso de falla o `Either.right(Value)` en caso de éxito.
- **Errores de Dominio Específicos**: Crear clases de error semánticas (ej. `InvalidFileTypeError`, `UploadNotFoundError`, `CsvParsingError`).
- **Controladores Limpios**: Los controladores inspeccionan `result.isLeft()` para responder con el status HTTP y mensaje apropiado.

---

## 5. Principio de Reutilización y Desacoplamiento
- **Inyección de Dependencias**: Los servicios y handlers reciben sus dependencias a través de constructores, facilitando pruebas unitarias con mocks o stubs.
- **Módulos Independientes**: El Worker de procesamiento debe poder operar desacoplado de la API HTTP.
- **Mensajería y Storage Abstraídos**: Las interfaces `IMessageQueue` y `IFileStorage` permiten alternar entre implementación local y AWS (SQS / S3) sin modificar la capa de aplicación.

---

## 6. Logging Estructurado
- Utilizar logger estructurado (Pino / Fastify Logger) con niveles (`info`, `warn`, `error`).
- No utilizar `console.log` disperso en código de producción.
