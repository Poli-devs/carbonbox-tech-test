# CarbonBox — Async Document Processing System

Sistema empresarial full stack para la ingesta, validación, procesamiento asíncrono y análisis de documentos CSV con datos de actividad y emisiones de carbono.

Desarrollado bajo principios de **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS** y el patrón funcional **Either**, garantizando alta cohesión, bajo acoplamiento y cero uso de `any` en TypeScript.

---

## 🏗️ 1. Arquitectura y Patrones de Diseño

El sistema está estructurado respetando la regla de dependencias de Clean Architecture: **las capas externas conocen a las internas, pero el Dominio no tiene dependencias de infraestructura ni frameworks web.**

```
                               ┌────────────────────────────────┐
                               │       Presentation (HTTP)      │
                               │ Fastify, Controllers, Routes   │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │       Application (CQRS)       │
                               │ Commands, Queries, Handlers    │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │          Domain (DDD)          │
                               │ Entities, Value Objects, Repos │
                               └───────────────▲────────────────┘
                                               │
                               ┌───────────────┴────────────────┐
                               │         Infrastructure         │
                               │ Prisma, PostgreSQL, Queue, S3  │
                               └────────────────────────────────┘
```

### Principales Patrones Aplicados:
1. **Domain-Driven Design (DDD)**:
   - **Bounded Context**: `document-processing`.
   - **Aggregate Root**: `Upload` (orquesta el ciclo de vida, estados y totales procesados).
   - **Entidad**: `ActivityData` (registro individual de actividad/emisión validado).
   - **Value Objects**: `FileName` (valida extensiones `.csv` y neutraliza ataques de *path traversal*), `UploadStatus` (estados válidos: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
   - **Repositorios**: `IUploadRepository` e `IActivityDataRepository` como contratos puros de dominio.
2. **CQRS (Command Query Responsibility Segregation)**:
   - **Commands (Escritura)**: `CreateUploadCommand`, `ProcessFileCommand`.
   - **Queries (Lectura)**: `GetUploadByIdQuery`, `ListUploadsQuery`, `GetUploadResultsQuery`.
   - Cada acción tiene su handler independiente (`ICommandHandler`, `IQueryHandler`), facilitando escalabilidad y optimización independiente de lecturas y escrituras.
3. **Either Pattern (Manejo de Errores Funcional)**:
   - En lugar de propagar excepciones arbitrarias con `throw`, todos los casos de uso retornan `Either<Error, T>`.
   - `Left(Error)` representa un error de negocio o validación.
   - `Right(Value)` representa un resultado exitoso.
   - Los controladores HTTP son extremadamente delgados y transforman el `Either` en respuestas HTTP deterministas (200, 201, 400, 404, 500).
4. **Mensajería Desacoplada y Resiliente**:
   - Abstracciones `IMessagePublisher` y `IMessageConsumer`.
   - Implementación local con **reintentos mediante backoff exponencial** y derivación automática a **Dead Letter Queue (DLQ)** tras 3 fallos consecutivos.
   - Totalmente desacoplado para operar sin costos de nube de forma local o conectarse a **AWS SQS** en producción.
5. **Inyección de Dependencias (DI)**:
   - Contenedor modular `DocumentProcessingModule` que gestiona instancias e inyección de repositorios y servicios.

---

## 📦 2. Requisitos Previos

- **Node.js**: Versión 18+ (Recomendado Node 20 LTS).
- **npm**: Versión 6+.
- **Docker & Docker Compose**: Para ejecutar el contenedor de base de datos PostgreSQL local.

---

## 🚀 3. Instrucciones de Instalación y Ejecución Local

### Paso 1: Levantar la Base de Datos PostgreSQL
Desde la raíz del proyecto:
```bash
docker compose up -d
```
> Esto iniciará un contenedor PostgreSQL 15 en el puerto `5432` con la base de datos `document_processing`.

### Paso 2: Configurar y Ejecutar el Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```
> El servidor Fastify iniciará en **`http://localhost:3001`** con el worker integrado en segundo plano para máxima conveniencia.

*(Opcional: Si deseas ejecutar el worker de forma totalmente separada en otra terminal, ejecuta `npm run worker`)*.

### Paso 3: Configurar y Ejecutar el Frontend
En una nueva terminal, desde la raíz del proyecto:
```bash
cd frontend
npm install
npm run dev
```
> La aplicación web Next.js 14 estará disponible en **`http://localhost:3000`**.

---

## 🧪 4. Ejecución de Pruebas Automatizadas

El backend incluye pruebas unitarias y de integración desarrolladas con **Vitest**:
```bash
cd backend
npm test
```
*Pruebas incluidas:*
- `CsvParserService.spec.ts`: Validación exhaustiva del parser de CSV (campos requeridos, tipos numéricos, fechas válidas `YYYY-MM-DD`).
- `Either.spec.ts`: Evaluación de la mónada funcional `Either` (Left/Right, transformaciones `map`).
- `ValueObjects.spec.ts`: Invariantes de `FileName` (rechazo de path traversal, validación `.csv`) y `UploadStatus`.
- `LocalMessageQueue.spec.ts`: Verificación de reintentos con backoff exponencial y desvío a Dead Letter Queue (DLQ).
- `App.test.ts`: Pruebas de integración HTTP usando Fastify `inject`.

---

## 📁 5. Datos de Prueba (Sample Files)

En la raíz del proyecto se incluyen dos archivos para evaluar el comportamiento del sistema:

1. **`sample-data.csv`**:
   - Contiene **60 filas** con datos válidos de electricidad, gas natural, transporte, residuos y agua en 2024.
   - Ideal para probar el flujo exitoso (`COMPLETED`) y visualizar las tablas y métricas.
2. **`sample-data-with-errors.csv`**:
   - Contiene filas corruptas (fechas inválidas, montos negativos, columnas faltantes).
   - Útil para observar cómo el motor de validación detecta las anomalías y rechaza los datos incorrectos.

---

## 🌐 6. Endpoints de la API REST

| Método | Endpoint | Descripción | Body / Query | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/uploads` | Subir archivo CSV de actividad | `multipart/form-data` con campo `file` | `201 Created` con metadata y ID de carga |
| `GET` | `/api/v1/uploads/:id` | Consultar estado del archivo | Parámetro `:id` en ruta | `200 OK` con status, totales y errores |
| `GET` | `/api/v1/uploads` | Listar cargas con paginación y stats | `?page=1&limit=10` | `200 OK` con datos paginados y métricas |
| `GET` | `/api/v1/uploads/:id/results` | Obtener registros procesados | Parámetro `:id` en ruta | `200 OK` con array de `ActivityData` |
| `GET` | `/health` | Healthcheck del servicio | — | `200 OK` `{ status: "ok" }` |

---

## ☁️ 7. Arquitectura en la Nube (AWS)

Se incluye el diseño completo para el despliegue empresarial en AWS dentro de la carpeta `docs/`:
- **Diagrama Visual**: [`docs/arquitectura-aws.svg`](docs/arquitectura-aws.svg)
- **Documentación Técnica Detallada**: [`docs/arquitectura.md`](docs/arquitectura.md)

*Resumen de Componentes AWS:*
- **Networking**: VPC con subredes públicas y privadas distribuidas en múltiples Zonas de Disponibilidad (Multi-AZ).
- **Cómputo Serverless**: AWS ECS Fargate con 2 servicios (API Service con auto-escalado horizontal y Worker Service escalando según la profundidad de la cola SQS).
- **Base de Datos**: Amazon RDS PostgreSQL 15 en modo Multi-AZ con réplica de failover síncrono.
- **Almacenamiento**: Amazon S3 con cifrado en reposo (SSE-S3) y políticas de retención.
- **Mensajería**: Amazon SQS con Dead Letter Queue (DLQ) para tolerancia a fallos.
- **Monitoreo & Seguridad**: Amazon CloudWatch (logs y métricas) y AWS Secrets Manager (rotación de credenciales).

---

## ⚖️ 8. Decisiones Técnicas y Trade-offs

1. **Fastify en lugar de Express**:
   - *Razón*: Rendimiento superior (hasta 2x en throughput de peticiones concurrentes), soporte nativo de TypeScript y logger Pino integrado de alto rendimiento.
2. **Local-First para Desarrollo**:
   - *Razón*: Permite ejecutar la prueba al 100% de manera local y gratuita sin requerir cuentas de AWS de pago, utilizando interfaces intercambiables (`IFileStorage`, `IMessagePublisher`).
3. **TanStack React Query en Frontend**:
   - *Razón*: Gestión declarativa de estado del servidor con soporte de polling automático (`refetchInterval`), cache inteligente e invalidación reactiva tras mutaciones.
4. **Either Pattern en lugar de Try/Catch disperso**:
   - *Razón*: Hace que el manejo de errores sea parte del contrato de tipos, evitando que errores inesperados rompan la ejecución del servidor.

---

## 📄 9. Documento de Uso de Inteligencia Artificial

De acuerdo con los requisitos obligatorios de la prueba, el documento con el detalle del uso de IA, adaptaciones, aprendizajes y limitaciones se encuentra en:
👉 [**`USO-DE-IA.md`**](USO-DE-IA.md)
