-- Tambah kolom views ke tabel berita (default 0)
ALTER TABLE berita
  ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Index untuk sorting berita berdasarkan views (populer)
CREATE INDEX IF NOT EXISTS idx_berita_views ON berita(views DESC);

-- Function: increment views secara atomic (race-condition safe)
CREATE OR REPLACE FUNCTION increment_berita_views(berita_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE berita
  SET views = views + 1
  WHERE id = berita_id;
END;
$$ LANGUAGE plpgsql;
