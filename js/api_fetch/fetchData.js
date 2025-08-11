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
    console.error("Error fetching Pokémon data by name:", err);
    throw err;
  }
}

export async function fetchAllPokemon(limit = 100000) {
  try {
    const response = await fetch(apiUrls.getAllPokemon(limit));
    if (!response.ok) {
      throw new Error(
        `Failed to fetch all Pokémon (Status: ${response.status})`
      );
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching all Pokémon:", err);
    throw err;
  }
}
