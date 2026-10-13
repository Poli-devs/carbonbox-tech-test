# Guía de Ejecución Local y Preparación para la Entrevista Técnica (Nivel Senior)

Esta guía te proporciona el protocolo paso a paso para ejecutar y verificar el sistema en tu máquina, junto con el manual de defensa técnica para responder con solvencia las preguntas de la entrevista técnica para **CarbonBox**.

---

## 🚀 Parte 1: Protocolo de Pruebas en tu Equipo Local

### 1.1 Iniciar la Base de Datos
Desde la raíz del proyecto:
```bash
docker compose up -d
```
> **Verificación**: Ejecuta `docker ps`. Verás el contenedor `carbonbox_postgres` saludable en el puerto `5432`.

### 1.2 Iniciar el Backend
En una terminal:
```bash
cd backend
npm install
npm run prisma:deploy
npm run dev
```
> **Qué ocurre**: Fastify iniciará en **`http://localhost:3001`**. Por defecto, incluye un worker integrado en segundo plano para procesar tareas de inmediato.
> 
> *(Opcional: Si deseas emular un entorno de producción con procesos separados, puedes abrir una segunda terminal y correr `cd backend && npm run worker`).*

### 1.3 Iniciar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
> **Acceso**: Abre tu navegador en **`http://localhost:3000`**.

---

## 🧪 Parte 2: Casos de Prueba Manuales (Paso a Paso)

### Caso 1: Flujo Exitoso con Datos Reales (`sample-data.csv`)
1. Ve a `http://localhost:3000/uploads/new` (o haz clic en **"Cargar Nuevo CSV"** en el Dashboard).
2. Arrastra o selecciona el archivo `sample-data.csv` ubicado en la raíz del proyecto (contiene 61 filas válidas de emisiones de electricidad, gas, transporte, residuos y agua).
3. Haz clic en **"Iniciar Procesamiento"**:
   - Observarás la barra de progreso de subida.
   - Serás redirigido automáticamente a `/uploads/[id]`.
   - La pantalla mostrará el estado `PROCESSING` con una animación pulsante y un spinner.
   - **Observa el Polling**: Cada 3 segundos, React Query consulta `GET /api/v1/uploads/:id`.
   - En ~2 segundos, el estado cambiará a `COMPLETED` (insignia verde).
   - El polling **se detiene automáticamente**.
   - Aparece la tabla interactiva con las 61 filas procesadas, las tarjetas de métricas (Tasa de éxito: 100%) y la barra de filtros por categoría y búsqueda en tiempo real.

### Caso 2: Tolerancia a Fallos y Resiliencia (`sample-data-with-errors.csv`)
1. Ve a `http://localhost:3000/uploads/new`.
2. Sube el archivo `sample-data-with-errors.csv` (contiene filas con montos negativos, fechas con formato inválido y columnas faltantes).
3. **Comportamiento Senior esperado**:
   - El worker **NO crashea ni aborta el lote completo**.
   - Filtra y rechaza las filas corruptas, persistiendo las válidas.
   - En la vista de detalle verás:
     - Total Filas: 6
     - Filas Válidas: 2
     - Filas Rechazadas: 4
     - Tasa de éxito: 33%
   - La tabla solo muestra los datos limpios y validados.

### Caso 3: Validación de Dominio (Seguridad y Extensiones)
1. Intenta arrastrar un archivo `.txt`, `.png` o `.pdf` al formulario de subida.
2. La interfaz lo rechazará de inmediato indicando: *"Formato inválido. Solo se admiten archivos .csv"*.
3. En el backend, el Value Object `FileName` protege adicionalmente contra nombres maliciosos y ataques de *Path Traversal* (`../`).

### Caso 4: Ejecución de Pruebas Automatizadas
En tu terminal:
```bash
npm test
```
> Ejecutará la suite completa de **Vitest** con **15 pruebas pasando al 100%** (validaciones de CSV, mónada funcional Either, Value Objects, cola con backoff exponencial y DLQ, y endpoints HTTP).

---

## 🎓 Parte 3: Banco de Preguntas y Respuestas de la Entrevista Técnica

A continuación se presentan las preguntas más probables que te formulará el Tech Lead o Arquitecto, estructuradas con **Respuestas Senior**, **Pros** y **Contras (Trade-offs)**.

---

### Pregunta 1: ¿Por qué elegiste Domain-Driven Design (DDD) y Clean Architecture en lugar de un MVC simple?

#### Respuesta Senior:
> *"Elegí Clean Architecture y DDD porque en plataformas empresariales como CarbonBox, donde las reglas de negocio sobre métricas de emisiones, factores de cálculo y validaciones evolucionan con frecuencia, es crítico aislar el dominio de los frameworks y de la base de datos.*
> 
> *Estructuré el sistema en un Bounded Context llamado `document-processing`. El Dominio contiene entidades (`Upload`, `ActivityData`) y Value Objects (`FileName`, `UploadStatus`) que protegen sus propias invariantes. Ningún archivo de dominio importa `@prisma/client`, Fastify ni librerías de infraestructura. Esto garantiza que si mañana decidimos migrar de Prisma a TypeORM, o de Fastify a NestJS, el núcleo de negocio no sufre ningún cambio."*

#### Pros y Contras (Trade-offs):
| Aspecto | Clean Architecture + DDD | MVC Tradicional |
| :--- | :--- | :--- |
| **Ventajas (Pros)** | Máximo desacoplamiento, alta testabilidad con mocks puros sin levantar bases de datos, reglas de negocio centralizadas y protegidas. | Menor cantidad de archivos iniciales, desarrollo más rápido para prototipos desechables (CRUDs triviales). |
| **Desventajas (Contras)** | Mayor cantidad de capas (Domain, Application, Infrastructure, Presentation) y necesidad de mappers explícitos. | Fuerte acoplamiento: la lógica de negocio termina dispersa dentro de controladores o modelos de base de datos (Fat Controllers/Models). |

---

### Pregunta 2: ¿Qué es CQRS y por qué decidiste aplicarlo en este proyecto?

#### Respuesta Senior:
> *"CQRS (Command Query Responsibility Segregation) separa conceptual y estructuralmente las operaciones que mutan estado (Commands) de las operaciones que leen datos (Queries).*
> 
> *En este sistema implementé `CreateUploadCommand` y `ProcessFileCommand` con sus respectivos handlers para manejar la ingesta y el procesamiento. Para lectura, implementé `GetUploadByIdQuery`, `ListUploadsQuery` y `GetUploadResultsQuery`.*
> 
> *La razón principal es la asimetría de carga: en sistemas de análisis de documentos, las consultas de estado (polling) y visualización representan más del 90% del tráfico, mientras que las cargas son el 10%. Separar ambas responsabilidades nos permite en el futuro optimizar las lecturas (por ejemplo, introduciendo una réplica de lectura en PostgreSQL o un caché con Redis) sin alterar el pipeline transaccional de escritura."*

#### Pros y Contras (Trade-offs):
- **Pros**: Escalabilidad independiente de lecturas y escrituras; modelos de consulta (DTOs) optimizados para la vista sin sobrecargar las entidades de dominio; adherencia estricta al principio de responsabilidad única (SRP).
- **Contras**: Requiere mantener handlers y objetos de comando/consulta separados en lugar de un único servicio con métodos CRUD genéricos.

---

### Pregunta 3: ¿Por qué utilizaste el patrón funcional `Either<Error, T>` en lugar de `try/catch` con excepciones (`throw`)?

#### Respuesta Senior:
> *"Lanzar excepciones con `throw` para errores de negocio (como 'archivo corrupto' o 'fecha inválida') es un antipatrón en arquitecturas robustas porque oculta los posibles errores a nivel del sistema de tipos de TypeScript. Las excepciones deben reservarse para fallos catastróficos no previstos.*
> 
> *Con `Either<Error, T>`, los errores de validación y de negocio son ciudadanos de primera clase en la firma de cada caso de uso: `Promise<Either<Error, Result>>`. El desarrollador está obligado por el compilador a tratar tanto el caso de fallo (`isLeft()`) como el de éxito (`isRight()`). Esto hace que los controladores HTTP sean extremadamente limpios: no tienen bloques `try/catch` dispersos, sino que traducen determinísticamente `Left` a 400/404 y `Right` a 200/201."*

#### Pros y Contras (Trade-offs):
- **Pros**: Errores tipados y predecibles en tiempo de compilación; ausencia de excepciones no capturadas que tiren el servidor; controladores homogéneos y legibles.
- **Contras**: Curva de aprendizaje para desarrolladores habituados únicamente a la programación imperativa basada en `throw/catch`.

---

### Pregunta 4: ¿Por qué procesar el archivo CSV de forma asíncrona mediante colas en lugar de hacerlo en la misma petición HTTP?

#### Respuesta Senior:
> *"Procesar archivos pesados en el ciclo de vida de la petición HTTP bloquearía el Event Loop de Node.js, saturaría los sockets de red del cliente y provocaría errores de timeout (HTTP 504 Gateway Timeout) frente a archivos de miles de registros.*
> 
> *Al desacoplar el procesamiento mediante una cola de mensajes:
> 1. El endpoint `POST /api/v1/uploads` responde de inmediato (en < 50ms) con código `201 Created` y el ID del recurso.
> 2. El archivo se persiste de forma segura y un mensaje entra a la cola.
> 3. Uno o varios workers consumen los mensajes a su propio ritmo. Si el tráfico de uploads se dispara, el backend sigue respondiendo con baja latencia mientras la cola amortigua la carga."*

---

### Pregunta 5: ¿Cómo garantizas la resiliencia en la cola de mensajería y qué función cumple la Dead Letter Queue (DLQ)?

#### Respuesta Senior:
> *"Implementé una cola que replica el comportamiento de AWS SQS:
> - **Reintentos con Backoff Exponencial**: Si un job falla por un error transitorio (por ejemplo, bloqueo temporal de BD), no se reintenta inmediatamente saturando la CPU. Se aplica un retraso exponencial: `delay = 1000 * 2^(intentos - 1)`.
> - **Dead Letter Queue (DLQ)**: Si un mensaje falla 3 intentos consecutivos (`maxAttempts = 3`), se asume que es un 'mensaje venenoso' (poison pill, e.g. archivo con codificación corrupta que rompe el buffer). En lugar de descartarlo o generar un bucle infinito, se enruta a la DLQ. Esto permite aislarlo, registrar la anomalía en logs estructurados y permitir que los ingenieros investiguen la causa raíz sin detener la cola principal."*

---

### Pregunta 6: En el Frontend, ¿por qué React Query con Polling cada 3 segundos y no WebSockets o Server-Sent Events (SSE)?

#### Respuesta Senior:
> *"Para este caso de uso específico, React Query con polling condicional es la solución con mejor relación simplicidad/eficiencia:
> 1. **Stateless y Escalable**: El polling HTTP utiliza conexiones efímeras compatibles con cualquier balanceador de carga (ALB), sin necesidad de mantener conexiones TCP persistentes que consuman memoria en servidores Fargate.
> 2. **Polling Inteligente**: En el hook `useUpload(id)`, configuré `refetchInterval` para activarse únicamente mientras el estado sea `PENDING` o `PROCESSING`. En el momento en que cambia a `COMPLETED` o `FAILED`, el polling se apaga por completo, evitando peticiones innecesarias.
> 
> **¿Cuándo migraría a WebSockets/SSE?** Si la aplicación requiriera notificaciones colaborativas en tiempo real entre múltiples usuarios sobre cientos de documentos simultáneos, valdría la pena la sobrecarga operativa de un cluster WebSocket con Redis Pub/Sub."*

---

### Pregunta 7: ¿Cómo explicar el uso de herramientas de Inteligencia Artificial (Claude Code, Cursor, Copilot)?

#### Respuesta Senior y Honesta:
> *"Utilicé herramientas de IA como un multiplicador de productividad siguiendo las pautas de la prueba técnica, documentándolo con total transparencia en [USO-DE-IA.md](file:///Users/luisfernandocujilluco/Proyectos/Prueba%20tecnica/USO-DE-IA.md):
> 
> - **Dónde me ayudó la IA**: Generación de código boilerplate inicial (scaffolding de carpetas, sugerencia inicial del schema de Prisma y componentes base de Tailwind).
> - **Dónde intervino mi criterio técnico**:
>   - La IA inicialmente sugería bloques `try/catch` con `throw` en los servicios; refactoricé todo a la mónada funcional `Either<Error, T>`.
>   - La IA sugería colas mock triviales con `array.shift()`; implementé un mecanismo con persistencia atómica en disco para soporte multi-proceso, reintentos con backoff exponencial y DLQ.
>   - Creé Value Objects inmutables (`FileName`, `UploadStatus`) y mappers bidireccionales que la IA no estructuraba correctamente.*
> 
> *La IA fue un copiloto excelente para acelerar la sintaxis, pero el diseño arquitectónico, los límites de capas y la resiliencia fueron dirigidos por mi criterio."*

---

### Pregunta 8: ¿Cómo escalarías esta solución en AWS para procesar millones de registros diarios?

#### Respuesta Senior:
> *"Como se detalla en el diagrama [docs/arquitectura.md](file:///Users/luisfernandocujilluco/Proyectos/Prueba%20tecnica/docs/arquitectura.md):
> 1. **Cómputo**: Desplegaría los Workers en **AWS ECS Fargate** con una política de Target Tracking Auto-Scaling basada en la métrica `ApproximateNumberOfMessagesVisible` de SQS de CloudWatch. Si la cola se llena, ECS levanta más tareas automáticamente.
> 2. **Almacenamiento**: El frontend subiría archivos directamente a **Amazon S3** mediante **S3 Presigned URLs**, liberando de ancho de banda y carga de CPU al servidor Fastify.
> 3. **Procesamiento de Archivos Gigantes (>1GB)**: Sustituiría el parseo en memoria por **Node.js Streams** (`csv-parser` con `pipeline`), procesando e insertando en batches de 1,000 registros mediante `COPY` nativo de PostgreSQL o `createMany`, manteniendo el uso de memoria RAM constante en < 100MB sin importar el tamaño del CSV.
> 4. **Base de Datos**: Amazon RDS PostgreSQL en modo Multi-AZ con réplicas de lectura para las consultas de los dashboards."*

---

Con esta guía tienes el control absoluto de cómo probar el sistema y cómo defender cada una de tus decisiones técnicas con solvencia y criterio Senior.
