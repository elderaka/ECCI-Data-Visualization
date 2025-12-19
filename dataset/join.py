import pandas as pd

# Read the CSV files
lookups = pd.read_csv('lookups.csv')
level_2 = pd.read_csv('Level_2.csv')

# Merge and group in one operation
result = level_2.merge(
    lookups[['small_area', 'local_authority']], 
    on='small_area', 
    how='left'
).groupby('local_authority', as_index=False).sum(numeric_only=True)

# Save the grouped result
result.to_csv('Level_2_grouped_by_LA.csv', index=False)

print(f"Success! Created Level_2_grouped_by_LA.csv")
print(f"Original small areas: {len(level_2)}")
print(f"Grouped local authorities: {len(result)}")
print(f"\nFirst few rows:")
print(result.head())