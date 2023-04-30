"""
Pulls data from excel spreadsheet and embeds it
"""
# %%
# Load data
import pandas as pd

df = pd.read_csv(
    r"../data\ubereats_data.tsv",
    encoding="utf-8",
    sep="\t",
    lineterminator="\n",
    index_col=False,
    names=["kitchenType", "name", "address", "delete", "menu"],
)
df = df.drop(columns="delete", axis=1)

# %% get rid of duplicate fast food restaurants
fast_food_restaurants = {
    "McDonald's",
    "Subway",
    "Pizza Hut",
    "Burger King",
    "KFC",
    "Domino's Pizza",
    "Taco Bell",
    "7-Eleven",
    "Wendy's",
    "Dunkin' Donuts",
    "Starbucks",
    "Chipotle Mexican Grill",
    "Arby's",
    "Chick-fil-A",
    "Papa John's",
    "Sonic Drive-In",
    "Panda Express",
    "Hardee's",
    "Five Guys",
    "Jack in the Box",
    "Little Caesars",
    "Jimmy John's",
    "Carl's Jr.",
    "Dairy Queen",
    "Panera Bread",
    "In-N-Out Burger",
    "Whataburger",
    "Popeyes Louisiana Kitchen",
    "Bojangles'",
    "Culver's",
    "White Castle",
    "Raising Cane's Chicken Fingers",
    "Zaxby's",
    "Del Taco",
    "Long John Silver's",
    "El Pollo Loco",
    "Steak 'n Shake",
    "Checkers",
    "Church's Chicken",
    "Jersey Mike's Subs",
    "Boston Market",
    "Quiznos",
    "A&W Restaurants",
    "Qdoba",
    "Tim Hortons",
    "Baskin-Robbins",
    "Denny's",
    "Captain D's",
    "Firehouse Subs",
    "Blimpie",
}

# Loop through each fast food restaurant and delete substring duplicates for each individual fast food
for fast_food in fast_food_restaurants:
    indices_to_keep = df[df["name"].str.contains(fast_food)].index[:1]
    indices_to_drop = df[df["name"].str.contains(fast_food)].index[1:]
    df.drop(indices_to_drop, inplace=True)

# %%
# Embed each reataurant
from openai.embeddings_utils import cosine_similarity, get_embedding

# embedding model parameters
embedding_model = "text-embedding-ada-002"
embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
