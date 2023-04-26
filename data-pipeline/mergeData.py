import json
import pprint
import re
import os


class Store:
    def __init__(self, store_name, store_address, rating, menu_items):
        self.store_name = store_name
        self.store_address = store_address
        self.rating = rating
        self.menu_items = menu_items

    def __str__(self):
        return f"Store name: {self.store_name}\nStore address: {self.store_address}\nRating: {self.rating}\nMenu items: {self.menu_items}"

    def __repr__(self):
        return self.__str__()

    # if they have the same name and addresses, that is sufficient for equivalency
    def __eq__(self, other):
        if not isinstance(other, Store):
            return False
        return (
            self.store_name == other.store_name
            and self.store_address == other.store_address
        )

    def __hash__(self):
        return hash((self.store_name, self.store_address))


# Define the file paths
file_paths = [
    # "../scrapers/uber-eats-scraper/scraped_data_mimi.json",
    "../scrapers/uber-eats-scraper/scraped_data_josh.json",
    # "../scrapers/uber-eats-scraper/scraped_data_akhil.json",
]

store_count = 0
restaurants = set()
# Loop through the file paths
for file_path in file_paths:
    with open(file_path, encoding="utf-8") as f:
        # Load the JSON data
        data = json.load(f)
        for store_data in data:
            # Get rid of prices in menu items
            store_data["menu_items"] = list(
                map(
                    lambda x: re.sub(r"(\$\d+(?:,\d+)?(?:.\d+)?)", ". ", x),
                    store_data["menu_items"],
                )
            )
            # Create a Store object from the store data
            store = Store(
                store_data["store_name"],
                store_data["store_address"],
                store_data["rating"],
                store_data["menu_items"],
            )

            print(store_data["menu_items"])

            # Add the Store object to the set of unique stores
            restaurants.add(store)
            store_count += 1

# pprint.pprint(restaurants)
print(
    f"restaurants scraped (exlcuding duplicates): {store_count}\nunique restaurants: {len(restaurants)}"
)


filename = "merged-data.json"
file_path = os.path.join(os.path.dirname(__file__), filename)  # build the file path

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(
        [store.__dict__ for store in restaurants], f, indent=4, ensure_ascii=False
    )
