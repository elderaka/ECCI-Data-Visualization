This folder contains three datasets that share the same schema and differ only in the level of aggregation and detail.

Files:
- Level_1.xlsx
- Level_2.xlsx
- Level_3.xlsx

Join Key:
All datasets contain the field 'small_area', which uniquely identifies each area and allows joins to the shapefile in /shapefile/ and lookup tables in /lookups/.

Units:
- Monetary values are in million GBP unless explicitly stated as per capita.
- Base year: 2025.
- Values represent net present values (discounting follows UK Green Book health and non-health rates).

Coverage:
The data covers 46426 small areas in the UK over the period 2025 to 2050.

Level Descriptions:
Level 1: Total co-benefits by co-benefit type.
Level 2: Annual and total co-benefits by co-benefit type.
Level 3: Annual and total co-benefits by co-benefit type and damage pathway.

See the top-level README.txt for conceptual background and glossary definitions.
