import pandas as pd
import numpy as np

# Load your co-benefits data
la_data = pd.read_csv('Level_1_grouped_by_LA.csv')
print(f"Co-benefits data: {len(la_data)} rows")
print("Sample LA names:", la_data['local_authority'].head(10).tolist())

# Load RUC data (England & Wales only)
ruc = pd.read_csv('Rural_Urban_Classification_(2021)_of_Local_Authority_Districts_(2024)_in_EW.csv')
print(f"\nRUC data: {len(ruc)} rows")
print("Sample RUC names:", ruc['LAD24NM'].head(10).tolist())

# Try direct name match first
la_data['local_authority_clean'] = la_data['local_authority'].str.strip()
ruc['LAD24NM_clean'] = ruc['LAD24NM'].str.strip()

merged = la_data.merge(
    ruc[['LAD24NM_clean', 'RUC21CD', 'RUC21NM', 'Urban_rural_flag']],
    left_on='local_authority_clean',
    right_on='LAD24NM_clean',
    how='left'
)

# Check how many matched
matched = merged['RUC21CD'].notna().sum()
unmatched = merged['RUC21CD'].isna().sum()

print(f"\n✅ Matched: {matched} LAs")
print(f"❌ Unmatched: {unmatched} LAs")

if unmatched > 0:
    print("\nUnmatched LAs (likely Scotland/NI or name mismatches):")
    unmatched_las = merged[merged['RUC21CD'].isna()]['local_authority'].tolist()
    for la in sorted(unmatched_las)[:20]:  # Show first 20
        print(f"  - {la}")
    
    if unmatched > 20:
        print(f"  ... and {unmatched - 20} more")

# Save merged data
output_file = 'Level_1_grouped_by_LA_with_RUC.csv'
merged.to_csv(output_file, index=False)
print(f"\n💾 Saved to: {output_file}")

# Create simple classification for display
def simplify_ruc(row):
    """Simplify RUC to simple display text"""
    if pd.isna(row['RUC21CD']):
        # Scotland/NI - need manual classification
        return None
    
    code = row['RUC21CD']
    
    # Urban codes: UUN, UUF, UIN, UIF
    if code.startswith('U'):
        if 'Majority nearer' in row['RUC21NM']:
            return 'Urban (near major city)'
        else:
            return 'Urban (isolated)'
    
    # Rural codes: RMN, RMF, RIN, RIF
    elif code.startswith('R'):
        if 'Majority rural' in row['RUC21NM']:
            return 'Rural (sparse)'
        else:
            return 'Rural (intermediate)'
    
    return 'Unknown'

merged['display_context'] = merged.apply(simplify_ruc, axis=1)

# Show summary
print("\n📊 Classification Summary:")
print(merged['display_context'].value_counts(dropna=False))

# Save simplified version
simple_output = merged[['local_authority', 'Urban_rural_flag', 'display_context', 'sum']]
simple_output.to_csv('LA_classifications_simple.csv', index=False)
print(f"\n💾 Simplified version saved to: LA_classifications_simple.csv")
