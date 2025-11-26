USE moderni;

ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS estimated_total DECIMAL(12,2) NULL AFTER total;

UPDATE presupuestos
SET estimated_total = total
WHERE estimated_total IS NULL;

SELECT 'estimated_total column ready' AS info;
