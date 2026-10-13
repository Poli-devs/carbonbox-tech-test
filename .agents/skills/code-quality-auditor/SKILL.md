---
name: code-quality-auditor
description: Skill de auditoría estricta para garantizar cero 'any', arquitectura limpia (Clean Architecture), CQRS, Either pattern y buenas prácticas de desarrollo Senior en el proyecto CarbonBox.
---

# Code Quality Auditor Skill

Esta skill permite auditar el código fuente del proyecto para asegurar el cumplimiento del estándar de calidad Senior requerido en la evaluación técnica.

## Puntos de Verificación Obligatorios:
1. **Verificación de Tipos (Zero `any`)**:
   - Ejecutar comprobación con TypeScript Compiler (`tsc --noEmit`).
   - Verificar que no existan declaraciones explícitas o implícitas de `any`.
2. **Separación de Capas (Clean Architecture)**:
   - `domain/`: Verificar que no importe `@prisma/client`, `fastify`, `express` ni librerías de infraestructura.
   - `application/`: Verificar que solo importe `domain/` y librerías utilitarias puras.
   - `presentation/`: Verificar que los controladores deleguen a Command/Query Handlers y no contengan lógica de negocio ni queries de Prisma.
3. **CQRS & Either Pattern**:
   - Todo handler de caso de uso debe implementar `ICommandHandler` o `IQueryHandler`.
   - El valor retornado debe ser un tipo `Either<Error, T>`.
4. **Resiliencia & Worker**:
   - El worker debe capturar errores de filas individuales sin abortar el procesamiento completo cuando sea posible, registrando `processedRows` y `failedRows`.
   - Manejo de reintentos y logging estructurado.
