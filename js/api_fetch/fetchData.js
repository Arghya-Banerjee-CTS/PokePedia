import apiUrls from "../../asset/api_urls/urls.js";

export async function fetchDataByName(pokemonName) {
  try {
    const response = await fetch(apiUrls.getByName(pokemonName));
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for ${pokemonName} (Status: ${response.status})`
      );
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching Pokémon data:", err);
    throw err;
  }
}
