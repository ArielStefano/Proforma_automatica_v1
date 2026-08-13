-- Agregar columna iva_rate a cotizaciones (Ecuador)
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS iva_rate numeric DEFAULT 0;
