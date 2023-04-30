"""
Pulls data from excel spreadsheet and embeds it
"""
# %%
import pandas as pd

# Read tab-separated file with column names
df = pd.read_csv(
    r"data\ubereats_data.tsv",
    sep="\t",
    lineterminator="\n",
    names=["kitchenType", "name", "address", "menu"],
)

# Print the first five rows to verify the data has been loaded correctly
print(df.head())
