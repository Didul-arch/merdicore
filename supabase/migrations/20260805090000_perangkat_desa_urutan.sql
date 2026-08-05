ALTER TABLE perangkat_desa ADD COLUMN urutan INTEGER NOT NULL DEFAULT 0;

-- Backfill: data lama dapet urutan sesuai id (urutan input selama ini).
UPDATE perangkat_desa pd
SET urutan = sub.baris
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS baris FROM perangkat_desa) sub
WHERE pd.id = sub.id;
