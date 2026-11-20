# Certificado de Supabase

Guarda aquí el certificado raíz de Supabase con el nombre `prod-ca-2021.crt`.

Dónde se descarga: panel de Supabase → **Project Settings → Database →
SSL Configuration → Download certificate**.

Lo usa el script de importación (`npm run db:seed`) para comprobar que se
conecta de verdad a tu base de datos (TLS con verificación completa).

Es un certificado **público** (no es un secreto): se puede subir a Git.
