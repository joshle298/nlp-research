"""
Pulls data from excel spreadsheet and embeds it
"""
# %%
# Load data
import pandas as pd
import os
import openai
from dotenv import load_dotenv
from openai.embeddings_utils import cosine_similarity, get_embedding
import tiktoken
from stopwords import stopWords
from fastfoods import fast_food_restaurants

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

df = pd.read_csv(
    r"../data\ubereats_data1.tsv",
    encoding="utf-8",
    sep="\t",
    lineterminator="\n",
    index_col=False,
    names=["kitchenType", "name", "address", "menu"],
)
df = df.dropna(subset=["kitchenType"])
df = df.dropna(subset=["menu"])
df = df[df["menu"] != "\r"]


# %% get rid of duplicate fast food restaurants
# Loop through each fast food restaurant and delete substring duplicates for each individual fast food
for fast_food in fast_food_restaurants:
    indices_to_keep = df[df["name"].str.contains(fast_food)].index[:1]
    indices_to_drop = df[df["name"].str.contains(fast_food)].index[1:]
    df.drop(indices_to_drop, inplace=True)

df.drop_duplicates(subset=["name"], inplace=True)

# Get rid of stop words
df["menu"] = df["menu"].apply(
    lambda x: " ".join([word for word in x.split() if word.lower() not in stopWords])
)
# %%
# Embed each restaurant

# embedding model parameters
embedding_model = "text-embedding-ada-002"
embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
max_tokens = 8000

# assume df is your DataFrame containing the "menu" column
df["menu_encoded"] = df["menu"].fillna("").astype(str)
encoding = tiktoken.get_encoding(embedding_encoding)
df["menu_encoded"] = df["menu_encoded"].apply(lambda x: encoding.encode(x)[:8000])
df["menu_encoded"] = df["menu_encoded"].apply(lambda x: "".join(encoding.decode(x)))


# df["embedding"] = df.menu_encoded.apply(
#     lambda x: get_embedding(x, engine=embedding_model)
# )

# %%
# get cosine similarities
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

ghostRows = df[df["kitchenType"] == "g"]
realRows = df[df["kitchenType"] == "r"]

ghostRowsSample = ghostRows.head(30)["embedding"]
realRowsSample = realRows.head(30)["embedding"]
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

# %%
# Try to run through logistic regression
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score

data = df.copy()

embeddings = data["embedding"].apply(lambda x: pd.Series(x))
embeddings.columns = ["embedding_" + str(i) for i in range(len(embeddings.columns))]
data = pd.concat([data, embeddings], axis=1)
data.drop(
    ["embedding", "name", "address", "menu", "menu_encoded"],
    axis=1,
    inplace=True,
)

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(
    data.drop("kitchenType", axis=1),
    data["kitchenType"],
    test_size=0.2,
    random_state=42,
)

# Train a logistic regression model
lr = LogisticRegression()
lr.fit(X_train, y_train)
y_pred = lr.predict(X_test)

# Evaluate model performance
accuracy = accuracy_score(y_test, y_pred)
precision_r = precision_score(y_test, y_pred, pos_label="r")
recall_r = recall_score(y_test, y_pred, pos_label="r")
precision_g = precision_score(y_test, y_pred, pos_label="g")
recall_g = recall_score(y_test, y_pred, pos_label="g")

print("Accuracy:", accuracy)
print("Precision for ghost kitchen (g):", precision_g)
print("Recall for ghost kitchen (g):", recall_g)
print("Precision for regular kitchen (r):", precision_r)
print("Recall for regular kitchen (r):", recall_r)
print(f"Test data set value counts:\n{y_test.value_counts()}")

# %% Try using random forest classifier
from sklearn.ensemble import RandomForestClassifier

rfc = RandomForestClassifier()
rfc.fit(X_train, y_train)
y_pred = rfc.predict(X_test)

# Evaluate model performance
accuracy = accuracy_score(y_test, y_pred)
precision_r = precision_score(y_test, y_pred, pos_label="r")
recall_r = recall_score(y_test, y_pred, pos_label="r")
precision_g = precision_score(y_test, y_pred, pos_label="g")
recall_g = recall_score(y_test, y_pred, pos_label="g")

print("Accuracy:", accuracy)
print("Precision for ghost kitchen (g):", precision_g)
print("Recall for ghost kitchen (g):", recall_g)
print("Precision for regular kitchen (r):", precision_r)
print("Recall for regular kitchen (r):", recall_r)
print(f"Test data set value counts:\n{y_test.value_counts()}")

# %%
