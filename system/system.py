"""
Pulls data from excel spreadsheet and embeds it
"""
# %%
import pandas as pd

# Read tab-separated file with column names
df = pd.read_csv(
    r"../data\ubereats_data.tsv",
    encoding="utf-8",
    sep="\t",
    lineterminator="\n",
    index_col=False,
    names=["kitchenType", "name", "address", "delete", "menu"],
)
df = df.drop(columns="delete", axis=1)

# Print the first five rows to verify the data has been loaded correctly
print(df.head())
