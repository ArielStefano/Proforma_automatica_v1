-- Crear tabla de cotizaciones
CREATE TABLE cotizaciones (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_type TEXT NOT NULL DEFAULT 'client' CHECK (customer_type IN ('client', 'final')),
  customer JSONB NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  validity_days INTEGER NOT NULL DEFAULT 15,
  payment_terms TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla de clientes
CREATE TABLE clientes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cedula TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Secuencia para numeración automática
CREATE TABLE IF NOT EXISTS counter (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

INSERT INTO counter (key, value) VALUES ('proforma_counter', 0)
ON CONFLICT (key) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_cotizaciones_number ON cotizaciones(number);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_date ON cotizaciones(date DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_name ON clientes(name);
