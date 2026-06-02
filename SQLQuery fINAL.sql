-- Qaysi hududlar iqtisodiy jihatdan kuchli?
-- Ushbu so‘rov hududlar kesimida aholi jon boshiga
-- daromad ko‘rsatkichlarini tahlil qilish uchun ishlatiladi.
-- Natijada har bir viloyat bo‘yicha o‘rtacha daromad, 
-- eng past va eng yuqori daromad darajasi hamda kuzatuvlar soni aniqlanadi.
-- Ushbu tahlil hududlarning iqtisodiy rivojlanish darajasini solishtirish va
-- eng kuchli hududlarni aniqlash imkonini beradi.

SELECT
    region AS Viloyat,
    AVG(income_pc) AS Ortacha_daromad,
    MIN(income_pc) AS Eng_past,
    MAX(income_pc) AS Eng_yuqori,
    COUNT(*) AS Kuzatuv_soni
FROM dbo.vw_income_mart
WHERE income_pc IS NOT NULL
GROUP BY region
ORDER BY Ortacha_daromad DESC;

-- Viloyatlarni daromad darajasi bo‘yicha segmentlash

-- Mazkur so‘rov viloyatlarni o‘rtacha daromad darajasiga 
-- ko‘ra to‘rt guruhga ajratadi. Natijada hududlar past,
-- o‘rtadan past, o‘rtadan yuqori va yuqori daromad segmentlariga bo‘linadi. 
-- Bu tahlil hududlar o‘rtasidagi iqtisodiy tafovutni aniqlash va qaysi viloyatlar yetakchi yoki 
-- ortda qolayotganini ko‘rsatish uchun qo‘llaniladi.

;WITH base AS (
    SELECT DISTINCT
        region,
        CAST(income_pc AS FLOAT) AS income_pc
    FROM dbo.vw_income_mart
    WHERE income_pc IS NOT NULL
),
agg AS (
    SELECT
        region,
        AVG(income_pc) AS avg_income
    FROM base
    GROUP BY region
),
seg AS (
    SELECT
        region,
        avg_income,
        NTILE(4) OVER (ORDER BY avg_income) AS quartile
    FROM agg
)
SELECT
    region AS Viloyat,
    avg_income AS Ortacha_daromad,
    CASE quartile
        WHEN 1 THEN 'Past 25%'
        WHEN 2 THEN 'Ortadan past'
        WHEN 3 THEN 'Ortadan yuqori'
        WHEN 4 THEN 'Yuqori 25%'
    END AS Segment
FROM seg
ORDER BY avg_income DESC;

-- Hududlar o‘rtasidagi daromad tafovuti (foizda )

-- Ushbu so‘rov viloyatlar o‘rtasida daromad darajasidagi farqni aniqlaydi.
-- Natijada eng yuqori va eng past o‘rtacha daromadga ega hududlar aniqlanib,
-- ular orasidagi mutlaq farq hamda necha baravar tafovut mavjudligi hisoblab chiqiladi.
-- Bu hududlararo iqtisodiy tengsizlik darajasini baholash imkonini beradi.

;WITH base AS (
    SELECT DISTINCT
        region,
        CAST(income_pc AS FLOAT) AS income_pc
    FROM dbo.vw_income_mart
    WHERE income_pc IS NOT NULL
),
agg AS (
    SELECT
        region,
        AVG(income_pc) AS avg_income
    FROM base
    GROUP BY region
),
ext AS (
    SELECT
        MAX(avg_income) AS max_income,
        MIN(avg_income) AS min_income
    FROM agg
)
SELECT
    max_income AS Eng_yuqori_viloyat_avg,
    min_income AS Eng_past_viloyat_avg,

    -- mutlaq farq
    max_income - min_income AS Absolyut_farq,

    -- necha baravar farq
    max_income / NULLIF(min_income, 0) AS Necha_marta_farq,

    -- foizdagi farq
    ROUND(
        (max_income - min_income)
        / NULLIF(min_income, 0) * 100.0,
        2
    ) AS Farq_foizda
FROM ext;


-- Daromadi eng yuqori bo‘lgan TOP-5 hududlar

-- Ushbu tahlil o‘rtacha daromadi eng yuqori bo‘lgan beshta hududni aniqlaydi.
-- Bundan tashqari, har bir hududning umumiy daromad tarkibidagi ulushi foizlarda hisoblab chiqiladi.
-- Bu yondashuv iqtisodiy faol hududlarning mamlakat daromadidagi hissasini baholash imkonini beradi.

;WITH base AS (
    SELECT DISTINCT
        region,
        CAST(income_pc AS FLOAT) AS income_pc
    FROM dbo.vw_income_mart
    WHERE income_pc IS NOT NULL
),
agg AS (
    SELECT
        region,
        AVG(income_pc) AS avg_income
    FROM base
    GROUP BY region
),
ranked AS (
    SELECT
        region,
        avg_income,
        ROW_NUMBER() OVER (ORDER BY avg_income DESC) AS rn,
        SUM(avg_income) OVER () AS total_income
    FROM agg
)
SELECT
    region AS Viloyat,
    CAST(ROUND(avg_income, 2) AS DECIMAL(18, 2)) AS Ortacha_daromad,
    CAST(
        ROUND(avg_income / NULLIF(total_income, 0) * 100.0, 2)
        AS DECIMAL(18, 2)
    ) AS Ulush_foizda
FROM ranked
WHERE rn <= 5
ORDER BY avg_income DESC;

-- Sanoat hajmi bo‘yicha yetakchi hudud

-- Mazkur so‘rov sanoat ishlab chiqarish hajmi bo‘yicha eng yuqori
-- natijaga ega hududni aniqlash uchun qo‘llaniladi. 
-- Bu tahlil qaysi viloyatlar sanoat markazi sifatida shakllanganini va 
-- sanoat ishlab chiqarishining hududiy taqsimotini ko‘rsatadi.

SELECT TOP (1)
    r.region_name AS Viloyat,
    ROUND(AVG(ind.industry_output), 2) AS Sanoat_hajmi
FROM dbo.fact_industry$ ind
JOIN dbo.dim_region_year$ ry
    ON ry.[region _year_id ] = ind.[region _year_id ]
JOIN dbo.dim_region$ r
    ON r.region_id = ry.region_id
GROUP BY r.region_name
ORDER BY Sanoat_hajmi DESC;


-- Biznes faolligi bo‘yicha hududlar reytingi

-- Ushbu so‘rov hududlarda biznes subyektlari faolligini tahlil qiladi.
-- Natijada qaysi viloyatlarda tadbirkorlik muhiti rivojlanganligi va 
-- iqtisodiy faollik yuqori ekanligi aniqlanadi.
-- Biznes faolligi daromad o‘sishining muhim omillaridan biri hisoblanadi.

SELECT
    r.region_name AS Viloyat,
    ROUND(AVG(bus.business_), 2) AS Biznes_faolligi
FROM dbo.fact_business$ bus
JOIN dbo.dim_region_year$ ry
    ON ry.[region _year_id ] = bus.region_year_id
JOIN dbo.dim_region$ r
    ON r.region_id = ry.region_id
GROUP BY r.region_name
ORDER BY Biznes_faolligi DESC;

-- Sektorlar kesimida iqtisodiyot tuzilmasi

IF OBJECT_ID('tempdb..#sector_total') IS NOT NULL DROP TABLE #sector_total;
IF OBJECT_ID('tempdb..#sector_debug') IS NOT NULL DROP TABLE #sector_debug;

CREATE TABLE #sector_total (
    sector NVARCHAR(50) NOT NULL,
    total_value FLOAT NOT NULL
);

CREATE TABLE #sector_debug (
    sector NVARCHAR(50) NOT NULL,
    fact_table SYSNAME NOT NULL,
    measure_column SYSNAME NULL
);

DECLARE @t TABLE (sector NVARCHAR(50), fact_table SYSNAME);

INSERT INTO @t (sector, fact_table)
VALUES
    ('Industry',    'dbo.[fact_industry$]'),
    ('Business',    'dbo.[fact_business$]'),
    ('Agriculture', 'dbo.[fact_agriculture$]'),
    ('Energy',      'dbo.[fact_energy$]'),
    ('LaborMarket', 'dbo.[fact_labor_market$]');

DECLARE @sector NVARCHAR(50), @fact SYSNAME, @tbl SYSNAME, @col SYSNAME, @sql NVARCHAR(MAX);

DECLARE c CURSOR FAST_FORWARD FOR
SELECT sector, fact_table FROM @t;

OPEN c;
FETCH NEXT FROM c INTO @sector, @fact;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @tbl = REPLACE(REPLACE(@fact, 'dbo.[', ''), ']', '');
    SET @col = NULL;

    SELECT TOP (1)
        @col = COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = @tbl
      AND DATA_TYPE IN ('int','bigint','float','real','decimal','numeric','money','smallint','tinyint')
      AND COLUMN_NAME NOT LIKE '%id%'
      AND COLUMN_NAME NOT LIKE '%year%'
      AND COLUMN_NAME NOT LIKE '%region%'
      AND COLUMN_NAME NOT LIKE '%date%'
    ORDER BY
      CASE
        WHEN COLUMN_NAME LIKE '%output%' THEN 1
        WHEN COLUMN_NAME LIKE '%income%' THEN 2
        WHEN COLUMN_NAME LIKE '%count%'  THEN 3
        WHEN COLUMN_NAME LIKE '%value%'  THEN 4
        ELSE 5
      END,
      COLUMN_NAME;

    INSERT INTO #sector_debug (sector, fact_table, measure_column)
    VALUES (@sector, @fact, @col);

    IF @col IS NOT NULL
    BEGIN
        SET @sql = N'
            INSERT INTO #sector_total(sector, total_value)
            SELECT N''' + @sector + N''', COALESCE(SUM(CAST(' + QUOTENAME(@col) + N' AS FLOAT)), 0)
            FROM ' + @fact + N'
            WHERE ' + QUOTENAME(@col) + N' IS NOT NULL;
        ';
        EXEC sp_executesql @sql;
    END
    ELSE
    BEGIN
        INSERT INTO #sector_total (sector, total_value)
        VALUES (@sector, 0);
    END

    FETCH NEXT FROM c INTO @sector, @fact;
END

CLOSE c;
DEALLOCATE c;

SELECT * FROM #sector_debug ORDER BY sector;

-- Sektorlarning umumiy iqtisodiyotdagi ulushi

;WITH tot AS (
    SELECT SUM(total_value) AS grand_total
    FROM #sector_total
)
SELECT
    st.sector AS Sektor,
    CAST(ROUND(st.total_value, 2) AS DECIMAL(18, 2)) AS Umumiy_hajm,
    CAST(
        ROUND(st.total_value / NULLIF(tot.grand_total, 0) * 100.0, 2)
        AS DECIMAL(18, 2)
    ) AS Ulush_foizda
FROM #sector_total AS st
CROSS JOIN tot
ORDER BY st.total_value DESC;

-- Top-3 sektor va qolgan sektorlar taqqoslanishi

;WITH s AS (
    SELECT sector, total_value
    FROM #sector_total
),
ranked AS (
    SELECT
        sector,
        total_value,
        ROW_NUMBER() OVER (ORDER BY total_value DESC) AS rn,
        SUM(total_value) OVER () AS grand_total
    FROM s
)
SELECT
    CASE WHEN rn <= 3 THEN sector ELSE 'Others' END AS Sektor_guruhi,
    CAST(ROUND(SUM(total_value), 2) AS DECIMAL(18, 2)) AS Hajm,
    CAST(
        ROUND(SUM(total_value) / NULLIF(MAX(grand_total), 0) * 100.0, 2)
        AS DECIMAL(18, 2)
    ) AS Ulush_foizda
FROM ranked
GROUP BY CASE WHEN rn <= 3 THEN sector ELSE 'Others' END
ORDER BY Hajm DESC;


-- Daromad va sanoat o‘rtasidagi bog‘liqlik
SELECT
    AVG(i.income_pc) AS Avg_income,
    AVG(ind.industry_output) AS Avg_industry
FROM dbo.fact_income$ i
JOIN dbo.fact_industry$ ind
    ON ind.[region _year_id ] = i.region_year_id;


-- Daromad va biznes faolligi o‘rtasidagi bog‘liqlik
SELECT
    AVG(i.income_pc) AS Avg_income,
    AVG(b.active_enterprises_count) AS Avg_business
FROM dbo.fact_income$ i
JOIN dbo.fact_business$ b
    ON b.region_year_id = i.region_year_id;

-- Korrelyatsion tahlil 
--Daromadni nima oshiryapti? (Income ↔ Industry) — hududlar kesimida korrelyatsiya

;WITH base AS (
    SELECT
        r.region_name,
        CAST(i.income_pc AS FLOAT) AS income_pc,
        CAST(ind.industry_output AS FLOAT) AS industry_output
    FROM dbo.dim_region_year$ ry
    JOIN dbo.dim_region$ r
        ON r.region_id = ry.region_id
    JOIN dbo.fact_income$ i
        ON i.region_year_id = ry.[region _year_id ]
    JOIN dbo.fact_industry$ ind
        ON ind.[region _year_id ] = ry.[region _year_id ]
    WHERE i.income_pc IS NOT NULL
      AND ind.industry_output IS NOT NULL
),
agg AS (
    SELECT
        region_name,
        COUNT(*) AS n,
        AVG(industry_output) AS avg_x,
        AVG(income_pc) AS avg_y,
        AVG(industry_output * income_pc) AS avg_xy,
        STDEV(industry_output) AS sd_x,
        STDEV(income_pc) AS sd_y
    FROM base
    GROUP BY region_name
)
SELECT
    region_name AS Viloyat,
    n AS Kuzatuv_soni,
    (avg_xy - (avg_x * avg_y)) / NULLIF(sd_x * sd_y, 0) AS corr_industry_income
FROM agg
ORDER BY ABS((avg_xy - (avg_x * avg_y)) / NULLIF(sd_x * sd_y, 0)) DESC;









