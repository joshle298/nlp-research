"""
Pulls data from excel spreadsheet and embeds it
"""
# %%
# Load data
import pandas as pd
import dotenv
import os
import openai
from dotenv import load_dotenv
from openai.embeddings_utils import cosine_similarity, get_embedding
import tiktoken

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

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

df.drop_duplicates(subset=["name"], inplace=True)


# Initialize the tokenizer
tokenizer = openai.Tokenizer()


# Define a function to truncate each menu item to 8000 tokens using the tokenizer
def truncate_menu(menu_item):
    tokens = tokenizer.encode(menu_item)["data"]
    if len(tokens) > 8000:
        truncated_tokens = tokens[:8000]
        truncated_menu_item = tokenizer.decode(truncated_tokens)
        return truncated_menu_item
    else:
        return menu_item


# Apply the function to the "menu" column to truncate each menu item
df["menu"] = df["menu"].apply(truncate_menu)

# %%
# Embed each reataurant

# embedding model parameters
embedding_model = "text-embedding-ada-002"
embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
max_tokens = 8000

# # tokenize
# encoding = tiktoken.get_encoding(embedding_encoding)
# df["menu"] = df.menu.apply(lambda x: len(encoding.encode(x)))

# assume df is your DataFrame containing the "menu" column
df["menu"] = df["menu"].fillna("").astype(str)
encoding = tiktoken.get_encoding(embedding_encoding)
df["menu"] = df["menu"].apply(lambda x: encoding.encode(x)[:8000])
df["menu"] = df["menu"].apply(lambda x: encoding.decode(x).join(" "))


df["embedding"] = df.menu.apply(lambda x: get_embedding(x, engine=embedding_model))

# %%
# get cosine similarities
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

ghostRows = df[df["kitchenType"] == "g"]
realRows = df[df["kitchenType"] == "r"]

ghostRowsSample = ghostRows.head(20)["embedding"]
realRowsSample = realRows.head(20)["embedding"]
n = len(ghostRowsSample)

ghost2ghostSimilarityMatrix = cosine_similarity(ghostRowsSample.tolist())
ghost2ghostAvgSimilarity = (
    np.sum(ghost2ghostSimilarityMatrix[np.triu_indices(n, k=1)]) * 2
) / (n * (n - 1))

combinedSamples = ghostRowsSample.append(realRowsSample)
combinedSimilarityMatrix = cosine_similarity(combinedSamples.tolist())

numRows, numCols = combinedSimilarityMatrix.shape

combinedSimilarities = []
# if numRows=NumCols=40, then i:[0-19], j[20,39]
for i in range(int(numRows / 2)):
    for j in range(int(numCols / 2), numCols):
        combinedSimilarities.append(combinedSimilarityMatrix[i, j])

combinedAvgSimilarity = np.array(combinedSimilarities).mean()

print(
    f"Ghost Kitchen to Ghost Kitchen Cosine Similarity Average: {ghost2ghostAvgSimilarity}"
)
print(
    f"Normal Kitchen to Ghost Kitchen Cosine Similarity Average: {combinedAvgSimilarity}"
)
