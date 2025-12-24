import pandas as pd

# Load the files
lookups = pd.read_csv('lookups.csv')
ruc = pd.read_csv('Rural_Urban_Classification_(2021)_of_Local_Authority_Districts_(2024)_in_EW.csv')
la_with_ruc = pd.read_csv('Level_1_grouped_by_LA_with_RUC.csv')

print(f"Lookups: {len(lookups)} rows")
print(f"RUC: {len(ruc)} rows")
print(f"LA with RUC: {len(la_with_ruc)} rows")

# Create a mapping from LA name to RUC info
la_to_ruc = la_with_ruc[['local_authority_clean', 'Urban_rural_flag', 'RUC21CD', 'RUC21NM']].drop_duplicates()

# Merge with lookups on local_authority
lookups['local_authority_clean'] = lookups['local_authority'].str.strip()
lookups_with_ruc = lookups.merge(
    la_to_ruc,
    left_on='local_authority_clean',
    right_on='local_authority_clean',
    how='left'
)

# Drop the extra clean column
lookups_with_ruc = lookups_with_ruc.drop('local_authority_clean', axis=1)

# Check how many matched
matched = lookups_with_ruc['Urban_rural_flag'].notna().sum()
unmatched = lookups_with_ruc['Urban_rural_flag'].isna().sum()

print(f"\n✅ Matched: {matched} small areas")
print(f"❌ Unmatched: {unmatched} small areas")

# Show sample of unmatched LAs
if unmatched > 0:
    unmatched_las = lookups_with_ruc[lookups_with_ruc['Urban_rural_flag'].isna()]['local_authority'].unique()
    print(f"\nUnmatched Local Authorities ({len(unmatched_las)} unique):")
    for la in sorted(unmatched_las)[:15]:
        print(f"  - {la}")

# Create simplified context for display
def create_display_context(row):
    """Create user-friendly context label"""
    # If we have RUC data, use it
    if pd.notna(row['RUC21NM']):
        ruc_name = row['RUC21NM']
        if 'Urban: Majority nearer' in ruc_name:
            return 'Urban (near major city)'
        elif 'Urban: Majority further' in ruc_name:
            return 'Urban (isolated)'
        elif 'Intermediate urban' in ruc_name:
            return 'Urban (intermediate)'
        elif 'Majority rural: Majority further' in ruc_name:
            return 'Rural (sparse)'
        elif 'Majority rural: Majority nearer' in ruc_name:
            return 'Rural (intermediate)'
        elif 'Intermediate rural' in ruc_name:
            return 'Rural (intermediate)'
        else:
            return row['Urban_rural_flag'] if pd.notna(row['Urban_rural_flag']) else 'Unknown'
    
    # For unmatched (Scotland/NI), infer from LA name
    la = row['local_authority']
    
    # Major Scottish cities
    if la in ['City of Edinburgh', 'Glasgow City', 'Aberdeen City', 'Dundee City']:
        return 'Urban (major city)'
    # Belfast
    elif la == 'Belfast':
        return 'Urban (major city)'
    # Check for common urban indicators
    elif 'City' in la or la in ['Aberdeen', 'Stirling', 'Perth']:
        return 'Urban (near major city)'
    # Default to rural for Scotland/NI unknowns
    else:
        return 'Rural (intermediate)'

lookups_with_ruc['context_display'] = lookups_with_ruc.apply(create_display_context, axis=1)

# Simplify columns for final output
output_columns = [
    'small_area',
    'population', 
    'households',
    'local_authority',
    'nation',
    'Urban_rural_flag',  # Simple Urban/Rural
    'context_display'    # Display-friendly description
]

lookups_final = lookups_with_ruc[output_columns].copy()

# Rename for clarity
lookups_final = lookups_final.rename(columns={
    'Urban_rural_flag': 'urban_rural',
    'context_display': 'area_type_display'
})

# Fill NA urban_rural with best guess based on display
lookups_final['urban_rural'] = lookups_final.apply(
    lambda x: 'Urban' if 'Urban' in str(x['area_type_display']) else 'Rural' 
    if pd.isna(x['urban_rural']) else x['urban_rural'],
    axis=1
)

# Save updated lookups
output_file = 'lookups_with_classification.csv'
lookups_final.to_csv(output_file, index=False)
print(f"\n💾 Saved updated lookups to: {output_file}")

# Show classification summary
print("\n📊 Classification Summary:")
print(lookups_final['area_type_display'].value_counts())

print("\n✅ Done! New columns added:")
print("  - urban_rural: Simple Urban/Rural flag")
print("  - area_type_display: User-friendly description")
